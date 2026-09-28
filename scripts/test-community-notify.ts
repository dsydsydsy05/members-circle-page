// Runs the real Edge Function with fetch replaced; it never contacts an email provider.
import { assertEquals, assertStringIncludes } from 'jsr:@std/assert';
let handler: (request: Request) => Promise<Response>;
const serve = Deno.serve;
Deno.serve = ((fn: typeof handler) => { handler = fn; return {}; }) as typeof Deno.serve;
await import('../supabase/functions/community-notify/index.ts');
Deno.serve = serve;
const originalFetch = globalThis.fetch;
const id='00000000-0000-4000-8000-000000000001';
const keys={SUPABASE_URL:'https://room-test.invalid',SUPABASE_ANON_KEY:'test-anon',SUPABASE_SERVICE_ROLE_KEY:'test-service',RESEND_API_KEY:'test-resend',WAITLIST_FROM_EMAIL:'The Room <test@test.invalid>',PUBLIC_SITE_URL:'https://site.test.invalid'};
for(const [key,value]of Object.entries(keys))Deno.env.set(key,value);
function fixture(options:{status?:string;actor?:string;providerFails?:boolean;claimLost?:boolean;connectionStatus?:string}={}){
 let row={id,connection_id:id,actor_id:options.actor||'actor',recipient_id:'00000000-0000-4000-8000-000000000002',kind:'request',status:options.status||'pending',updated_at:'2026-09-28T00:00:00Z',attempts:0,error:null};
 const sends:Record<string,unknown>[]=[];
 globalThis.fetch=(async(input:RequestInfo|URL,init?:RequestInit)=>{
  const url=String(input);const method=init?.method||'GET';const body=typeof init?.body==='string'?JSON.parse(init.body):null;
  const json=(data:unknown,status=200)=>new Response(JSON.stringify(data),{status,headers:{'Content-Type':'application/json'}});
  if(url.endsWith('/auth/v1/user'))return json({id:'actor',email:'actor@login.test.invalid'});
  if(url.includes('/auth/v1/admin/users/'))return json({id:'recipient',email:'recipient@login.test.invalid'});
  if(url.includes('/rpc/has_role'))return json(false);
  if(url.includes('/community_notifications')){
   if(method==='PATCH'){if(body.status==='processing'&&options.claimLost)return json(null);row={...row,...body};return json(body.status==='processing'?{id}:null);}
   return json(row);
  }
  if(url.includes('/member_connections'))return json({status:options.connectionStatus||'pending'});
  if(url==='https://api.resend.com/emails'){sends.push(body);return options.providerFails?json({message:'Simulated outage'},503):json({id:'email-test-id'});}
  throw new Error(`Unexpected network request blocked: ${url}`);
 }) as typeof fetch;
 return {sends,row:()=>row};
}
async function request(){return handler(new Request('https://room-test.invalid/community-notify',{method:'POST',headers:{Authorization:'Bearer fixture','Content-Type':'application/json'},body:JSON.stringify({id})}));}
Deno.test('mail failure persists failure without deleting the connection',async()=>{const f=fixture({providerFails:true});const r=await request();assertEquals(r.status,502);assertEquals(f.row().status,'failed');assertEquals(f.sends.length,1);assertStringIncludes(String(f.row().error),'Simulated outage');});
Deno.test('success sends only a link and stores delivery id',async()=>{const f=fixture();const r=await request();assertEquals(r.status,200);assertEquals(f.row().status,'sent');assertEquals(f.sends[0].to,['recipient@login.test.invalid']);assertStringIncludes(String(f.sends[0].text),'https://site.test.invalid/connections');assertEquals(String(f.sends[0].text).includes('@'),false);});
Deno.test('outsiders cannot trigger someone else’s notification',async()=>{const f=fixture({actor:'someone-else'});assertEquals((await request()).status,403);assertEquals(f.sends.length,0);});
Deno.test('already sent and concurrent delivery claims do not resend',async()=>{let f=fixture({status:'sent'});assertEquals((await request()).status,200);assertEquals(f.sends.length,0);f=fixture({claimLost:true});assertEquals((await request()).status,200);assertEquals(f.sends.length,0);});
Deno.test('obsolete request notification is cancelled after withdrawal',async()=>{const f=fixture({connectionStatus:'withdrawn'});assertEquals((await request()).status,200);assertEquals(f.row().status,'cancelled');assertEquals(f.sends.length,0);});
Deno.test('missing sender configuration fails without sending',async()=>{const f=fixture();Deno.env.delete('RESEND_API_KEY');const r=await request();assertEquals(r.status,502);assertEquals(f.row().status,'failed');assertEquals(f.sends.length,0);Deno.env.set('RESEND_API_KEY','test-resend');});
addEventListener('unload',()=>{globalThis.fetch=originalFetch;});
