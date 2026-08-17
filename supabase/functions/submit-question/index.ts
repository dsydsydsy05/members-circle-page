import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/cors.ts";
import {
  moderateText,
  normalizeModerationText,
  type ModerationDomain,
  type ModerationTerm,
} from "../_shared/moderation.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization) return json({ error: "Sign in to ask a question." }, 401);

    const url = Deno.env.get("SUPABASE_URL")!;
    const anonKey = Deno.env.get("SUPABASE_ANON_KEY")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const userClient = createClient(url, anonKey, {
      global: { headers: { Authorization: authorization } },
      auth: { persistSession: false },
    });
    const serviceClient = createClient(url, serviceKey, { auth: { persistSession: false } });

    const { data: userData, error: userError } = await userClient.auth.getUser();
    if (userError || !userData.user) return json({ error: "Your session has expired." }, 401);

    const payload = await request.json().catch(() => ({}));
    const body = typeof payload.body === "string" ? payload.body.trim() : "";
    if (body.length < 8 || body.length > 1000) {
      return json({ error: "Questions must be between 8 and 1,000 characters." }, 400);
    }

    const tenMinutesAgo = new Date(Date.now() - 10 * 60_000).toISOString();
    const { count } = await serviceClient
      .from("qa_questions")
      .select("id", { count: "exact", head: true })
      .eq("author_id", userData.user.id)
      .gte("created_at", tenMinutesAgo);
    if ((count ?? 0) >= 3) {
      return json({ error: "Please wait before sending another question." }, 429);
    }

    const [{ data: terms }, { data: domains }] = await Promise.all([
      serviceClient.from("moderation_terms").select("*").eq("active", true),
      serviceClient.from("moderation_domains").select("*").eq("active", true),
    ]);
    const result = moderateText(
      body,
      (terms ?? []) as ModerationTerm[],
      (domains ?? []) as ModerationDomain[],
    );

    if (!result.allowed) {
      const bytes = new TextEncoder().encode(normalizeModerationText(body).normalized);
      const hash = Array.from(new Uint8Array(await crypto.subtle.digest("SHA-256", bytes)))
        .map((value) => value.toString(16).padStart(2, "0"))
        .join("");
      await serviceClient.from("moderation_events").insert({
        actor_id: userData.user.id,
        category: result.category,
        source: result.source,
        content_hash: hash,
      });
      return json({ error: "This question does not meet The Room community guidelines." }, 422);
    }

    const normalized = normalizeModerationText(body).normalized;
    const yesterday = new Date(Date.now() - 24 * 60 * 60_000).toISOString();
    const { data: recent } = await serviceClient
      .from("qa_questions")
      .select("body")
      .eq("author_id", userData.user.id)
      .gte("created_at", yesterday)
      .neq("status", "deleted");
    if (
      (recent ?? []).some(
        (question) => normalizeModerationText(question.body).normalized === normalized,
      )
    ) {
      return json({ error: "You already asked this question recently." }, 409);
    }

    const { data: question, error } = await serviceClient
      .from("qa_questions")
      .insert({
        author_id: userData.user.id,
        body,
        status: "published",
        moderation_state: "passed",
      })
      .select("id, body, created_at")
      .single();
    if (error) throw error;
    return json({ question }, 201);
  } catch (error) {
    console.error(error);
    return json({ error: "The question could not be sent. Please try again." }, 500);
  }
});
