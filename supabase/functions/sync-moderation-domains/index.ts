import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/cors.ts";

const snapshot = "35db0ae94f7552dfd18218baffe74bd720a585f7";
const source = "StevenBlack/hosts";
const lists = {
  gambling: `https://raw.githubusercontent.com/StevenBlack/hosts/${snapshot}/alternates/gambling-only/hosts`,
  sexual: `https://raw.githubusercontent.com/StevenBlack/hosts/${snapshot}/alternates/porn-only/hosts`,
} as const;

function parseHosts(value: string) {
  const domains = new Set<string>();
  for (const line of value.split("\n")) {
    const clean = line.trim();
    if (!clean || clean.startsWith("#")) continue;
    const [address, domain] = clean.split(/\s+/, 2);
    if ((address === "0.0.0.0" || address === "127.0.0.1") && domain && domain !== "localhost") {
      domains.add(domain.toLowerCase());
    }
  }
  return Array.from(domains);
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization) return json({ error: "Unauthorized" }, 401);
    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const client = createClient(url, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    });
    const { data: userData } = await client.auth.getUser();
    if (!userData.user) return json({ error: "Unauthorized" }, 401);
    const { data: isAdmin } = await client.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (!isAdmin) return json({ error: "Forbidden" }, 403);

    const counts: Record<string, number> = {};
    for (const [category, sourceUrl] of Object.entries(lists)) {
      const response = await fetch(sourceUrl);
      if (!response.ok) throw new Error(`Could not fetch ${category} snapshot`);
      const domains = parseHosts(await response.text());
      const { data, error } = await client.rpc("admin_replace_moderation_domains", {
        _category: category,
        _domains: domains,
        _source: source,
        _source_url: sourceUrl,
      });
      if (error) throw error;
      counts[category] = data ?? domains.length;
    }
    return json({ ok: true, snapshot, counts });
  } catch (error) {
    console.error(error);
    return json({ error: "The domain snapshot could not be synchronized." }, 500);
  }
});
