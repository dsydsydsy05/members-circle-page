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

function searchText(profile: Record<string, unknown>) {
  return [
    profile.full_name,
    profile.position,
    profile.startup,
    profile.school,
    profile.about,
    ...(Array.isArray(profile.tags) ? profile.tags : []),
  ]
    .filter(Boolean)
    .join(" · ")
    .replace(/\s+/g, " ")
    .trim();
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization) return json({ error: "Unauthorized" }, 401);
    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    });
    const serviceClient = createClient(url, serviceKey, { auth: { persistSession: false } });
    const { data: userData } = await userClient.auth.getUser();
    if (!userData.user) return json({ error: "Unauthorized" }, 401);

    const payload = await request.json().catch(() => ({}));
    const profileId = typeof payload.profileId === "string" ? payload.profileId : userData.user.id;
    const { data: isAdmin } = await userClient.rpc("has_role", {
      _user_id: userData.user.id,
      _role: "admin",
    });
    if (profileId !== userData.user.id && !isAdmin) return json({ error: "Forbidden" }, 403);

    const { data: profile, error: profileError } = await serviceClient
      .from("profiles")
      .select("id, full_name, position, startup, school, about, tags, onboarded")
      .eq("id", profileId)
      .single();
    if (profileError) throw profileError;
    if (!profile.onboarded) return json({ ok: true, skipped: true });

    const text = searchText(profile);
    const ai = new Supabase.ai.Session("gte-small");
    const embedding = await ai.run(text, { mean_pool: true, normalize: true });
    const { error } = await serviceClient.from("profile_search_documents").upsert({
      profile_id: profileId,
      search_text: text,
      embedding,
      embedded_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    });
    if (error) throw error;
    await serviceClient.from("member_embedding_jobs").delete().eq("profile_id", profileId);
    return json({ ok: true });
  } catch (error) {
    console.error(error);
    return json({ error: "The search index could not be refreshed." }, 500);
  }
});
