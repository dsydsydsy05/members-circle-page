import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/cors.ts";

declare const Supabase: {
  ai: {
    Session: new (model: string) => {
      run: (
        input: string,
        options: { mean_pool: boolean; normalize: boolean },
      ) => Promise<number[]>;
    };
  };
};

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const payload = await request.json().catch(() => ({}));
    const query = typeof payload.query === "string" ? payload.query.trim().slice(0, 240) : "";
    if (query.length < 2) return json({ ids: [], semantic: false });

    const ai = new Supabase.ai.Session("gte-small");
    const embedding = await ai.run(query, { mean_pool: true, normalize: true });
    const client = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!,
      { auth: { persistSession: false } },
    );
    const { data, error } = await client.rpc("match_member_profiles", {
      query_embedding: embedding,
      query_text: query,
      match_count: 30,
    });
    if (error) throw error;
    return json({
      ids: (data ?? []).map((row: { profile_id: string }) => row.profile_id),
      semantic: true,
    });
  } catch (error) {
    console.error(error);
    return json({ ids: [], semantic: false, error: "Semantic search is temporarily unavailable." });
  }
});
