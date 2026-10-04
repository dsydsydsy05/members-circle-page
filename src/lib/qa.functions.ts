import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { requireSupabaseAuth } from "@/integrations/supabase/auth-middleware";

export const submitCommunityReply = createServerFn({ method: "POST" })
  .middleware([requireSupabaseAuth])
  .inputValidator((input) =>
    z
      .object({ questionId: z.string().uuid(), body: z.string().trim().min(1).max(2000) })
      .parse(input),
  )
  .handler(async ({ data, context }) => {
    const { data: question, error: questionError } = await context.supabase
      .from("qa_questions")
      .select("id")
      .eq("id", data.questionId)
      .eq("status", "published")
      .eq("moderation_state", "passed")
      .maybeSingle();
    if (questionError || !question) throw new Error("This question is no longer available.");
    const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
    const { moderateText, normalizeModerationText } = await import("./qa-moderation.server");
    const cutoff = new Date(Date.now() - 10 * 60_000).toISOString();
    const [recent, terms, domains, profile] = await Promise.all([
      supabaseAdmin
        .from("qa_replies")
        .select("body")
        .eq("author_id", context.userId)
        .gte("created_at", cutoff),
      supabaseAdmin.from("moderation_terms").select("*").eq("active", true),
      supabaseAdmin.from("moderation_domains").select("*").eq("active", true),
      context.supabase.from("profiles").select("full_name").eq("id", context.userId).maybeSingle(),
    ]);
    if (recent.error || terms.error || domains.error || profile.error)
      throw new Error("Replies are temporarily unavailable. Please try again.");
    if (recent.data.length >= 10) throw new Error("Please wait before sending another reply.");
    const normalized = normalizeModerationText(data.body).normalized;
    if (recent.data.some((reply) => normalizeModerationText(reply.body).normalized === normalized))
      throw new Error("You already sent this reply recently.");
    const result = moderateText(
      data.body,
      terms.data as Parameters<typeof moderateText>[1],
      domains.data as Parameters<typeof moderateText>[2],
    );
    if (!result.allowed) {
      const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(normalized));
      const contentHash = Array.from(new Uint8Array(digest), (byte) =>
        byte.toString(16).padStart(2, "0"),
      ).join("");
      const { error } = await supabaseAdmin
        .from("moderation_events")
        .insert({
          actor_id: context.userId,
          category: result.category,
          source: result.source,
          content_hash: contentHash,
        });
      if (error) console.error("Reply moderation audit failed", error.code);
      throw new Error("This reply does not meet The Room community guidelines.");
    }
    const { data: reply, error } = await supabaseAdmin
      .from("qa_replies")
      .insert({
        question_id: data.questionId,
        author_id: context.userId,
        author_name: profile.data?.full_name?.trim() || "Community participant",
        body: data.body,
      })
      .select("id, question_id, author_name, body, created_at")
      .single();
    if (error) throw new Error("Your reply could not be sent. Please try again.");
    return reply;
  });
