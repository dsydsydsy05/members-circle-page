import { createClient } from "npm:@supabase/supabase-js@2";
import { json } from "../_shared/cors.ts";

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return json({});
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);
  const url = Deno.env.get("SUPABASE_URL")!,
    anon = Deno.env.get("SUPABASE_ANON_KEY")!;
  const userClient = createClient(url, anon, {
    global: { headers: { Authorization: request.headers.get("Authorization") || "" } },
    auth: { persistSession: false },
  });
  const {
    data: { user },
  } = await userClient.auth.getUser();
  if (!user) return json({ error: "Sign in required" }, 401);
  const admin = createClient(url, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });
  const payload = await request.json().catch(() => ({}));
  if (typeof payload.id !== "string" || !/^[0-9a-f-]{36}$/i.test(payload.id))
    return json({ error: "Invalid notification" }, 400);
  const { data: n, error } = await admin
    .from("community_notifications")
    .select("*")
    .eq("id", payload.id)
    .maybeSingle();
  if (error || !n) return json({ error: "Notification unavailable" }, 404);
  const { data: isAdmin } = await userClient.rpc("has_role", { _user_id: user.id, _role: "admin" });
  if (n.actor_id !== user.id && !isAdmin) return json({ error: "Not allowed" }, 403);
  if (n.status === "sent" || n.status === "cancelled") return json({ status: n.status });
  if (n.status === "processing" && Date.parse(n.updated_at) > Date.now() - 300_000)
    return json({ status: "processing" });
  // Atomic compare-and-set prevents simultaneous retries sending the same message.
  const { data: claimed } = await admin
    .from("community_notifications")
    .update({
      status: "processing",
      updated_at: new Date().toISOString(),
      attempts: n.attempts + 1,
    })
    .eq("id", n.id)
    .eq("status", n.status)
    .eq("updated_at", n.updated_at)
    .select("id")
    .maybeSingle();
  if (!claimed) return json({ status: "processing" });
  try {
    const { data: c, error: ce } = await admin
      .from("member_connections")
      .select("status")
      .eq("id", n.connection_id)
      .single();
    if (ce) throw ce;
    if (c.status !== (n.kind === "request" ? "pending" : "accepted")) {
      await admin
        .from("community_notifications")
        .update({ status: "cancelled", updated_at: new Date().toISOString() })
        .eq("id", n.id);
      return json({ status: "cancelled" });
    }
    const apiKey = Deno.env.get("RESEND_API_KEY"),
      from = Deno.env.get("COMMUNITY_FROM_EMAIL") || Deno.env.get("WAITLIST_FROM_EMAIL"),
      site = Deno.env.get("PUBLIC_SITE_URL");
    if (!apiKey || !from || !site || !site.startsWith("https://"))
      throw new Error(
        "Verified sender, RESEND_API_KEY and HTTPS PUBLIC_SITE_URL must be configured.",
      );
    const { data: recipient, error: re } = await admin.auth.admin.getUserById(n.recipient_id);
    if (re || !recipient.user?.email) throw new Error("Recipient notification email unavailable.");
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "Idempotency-Key": `room-community-${n.id}`,
      },
      body: JSON.stringify({
        from,
        to: [recipient.user.email],
        subject:
          n.kind === "request"
            ? "A new introduction in The Room"
            : "Your introduction was accepted",
        text: [
          n.kind === "request"
            ? "A member would like to connect with you. Review their profile and reason before deciding."
            : "Your connection request has been accepted. You can now view your shared contact emails in The Room.",
          `${site.replace(/\/$/, "")}/connections`,
          "Private contact emails are never included in this notification.",
          "The Room",
        ].join("\n\n"),
      }),
    });
    const sent = await response.json();
    if (!response.ok || typeof sent.id !== "string")
      throw new Error(sent.message || `Email provider returned ${response.status}`);
    const { error: saveError } = await admin
      .from("community_notifications")
      .update({
        status: "sent",
        error: null,
        provider_id: sent.id,
        updated_at: new Date().toISOString(),
      })
      .eq("id", n.id);
    if (saveError) throw saveError;
    return json({ status: "sent" });
  } catch (e) {
    await admin
      .from("community_notifications")
      .update({
        status: "failed",
        error: (e instanceof Error ? e.message : "Delivery failed").slice(0, 500),
        updated_at: new Date().toISOString(),
      })
      .eq("id", n.id);
    return json(
      {
        status: "failed",
        error: "Email delivery failed. The request is saved; the team can retry delivery.",
      },
      502,
    );
  }
});
