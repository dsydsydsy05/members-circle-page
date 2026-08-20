import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/cors.ts";

type Decision = "approved" | "rejected";
type WaitlistEntry = {
  id: string;
  user_id: string | null;
  email: string;
  full_name: string;
  status: "pending" | Decision;
  decision_notification_status: "pending" | "processing" | "sent" | "failed";
  decision_notified_for: Decision | null;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

async function sendDecisionEmail(entry: WaitlistEntry, decision: Decision) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("WAITLIST_FROM_EMAIL");
  if (!apiKey || !from) {
    throw new Error("RESEND_API_KEY or WAITLIST_FROM_EMAIL is not configured.");
  }

  const siteUrl = Deno.env.get("PUBLIC_SITE_URL")?.replace(/\/$/, "");
  const name = escapeHtml(entry.full_name);
  const approved = decision === "approved";
  const needsAccountActivation = approved && !entry.user_id;
  const subject = approved
    ? "You’re in — Welcome to The Room"
    : "An update on your The Room application";
  const heading = approved ? "You’re in the room." : "An update from The Room.";
  const message = approved
    ? needsAccountActivation
      ? "Your Become a Member application has been approved. Sign in or create an account with this same email to activate Member access."
      : "Your Become a Member application has been approved. Your account now has Member access."
    : "Thank you for asking to join The Room. We are not able to offer Member access at this time.";
  const action =
    approved && siteUrl
      ? needsAccountActivation
        ? `${siteUrl}/auth?mode=signin`
        : `${siteUrl}/onboarding`
      : null;

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `waitlist-decision-${entry.id}-${decision}`,
      "User-Agent": "TheRoom-Waitlist/1.0",
    },
    body: JSON.stringify({
      from,
      to: [entry.email],
      subject,
      text: [
        `Hi ${entry.full_name},`,
        "",
        message,
        ...(action ? ["", `Enter The Room: ${action}`] : []),
        "",
        "The Room",
      ].join("\n"),
      html: `
        <div style="background:#f1f0ec;padding:32px;font-family:Arial,sans-serif;color:#11130f">
          <div style="max-width:600px;margin:0 auto;background:#fff;padding:36px;border-radius:24px">
            <p style="margin:0 0 24px;font:12px/1.4 monospace;letter-spacing:.14em;text-transform:uppercase;color:#779d42">The Room / Membership</p>
            <p style="margin:0 0 12px;color:#777">Hi ${name},</p>
            <h1 style="margin:0 0 22px;font-size:32px;line-height:1.1">${heading}</h1>
            <p style="margin:0;font-size:16px;line-height:1.65;color:#454640">${message}</p>
            ${
              action
                ? `<p style="margin:30px 0 0"><a href="${escapeHtml(action)}" style="display:inline-block;background:#11130f;color:#fff;text-decoration:none;padding:14px 20px;border-radius:999px;font:12px monospace;letter-spacing:.08em;text-transform:uppercase">Enter The Room ↗</a></p>`
                : ""
            }
            <p style="margin:34px 0 0;font:13px monospace">The Room</p>
          </div>
        </div>`,
    }),
  });

  const result = await response.json().catch(() => ({}));
  if (!response.ok) {
    const detail = typeof result?.message === "string" ? result.message : `HTTP ${response.status}`;
    throw new Error(`Resend rejected the notification: ${detail}`);
  }
  if (typeof result?.id !== "string") throw new Error("Resend returned no email id.");
  return result.id as string;
}

Deno.serve(async (request) => {
  if (request.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });
  if (request.method !== "POST") return json({ error: "Method not allowed" }, 405);

  try {
    const authorization = request.headers.get("Authorization");
    if (!authorization) return json({ error: "Admin sign-in required." }, 401);

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
    const entryId = typeof payload.entryId === "string" ? payload.entryId : "";
    const decision = payload.status as Decision;
    if (!entryId || (decision !== "approved" && decision !== "rejected")) {
      return json({ error: "A valid application and decision are required." }, 400);
    }

    const { data: reviewedEntry, error: reviewError } = await userClient.rpc(
      "admin_review_waitlist",
      {
        _entry_id: entryId,
        _status: decision,
        _admin_note: null,
      },
    );
    if (reviewError || !reviewedEntry) {
      const forbidden = reviewError?.message.toLowerCase().includes("forbidden");
      return json(
        { error: forbidden ? "Admin access required." : reviewError?.message },
        forbidden ? 403 : 400,
      );
    }
    const entry = reviewedEntry as unknown as WaitlistEntry;

    if (entry.decision_notification_status === "sent" && entry.decision_notified_for === decision) {
      return json({ entry, notificationSent: true, duplicate: true });
    }

    const { data: claimed, error: claimError } = await serviceClient
      .from("waitlist_entries")
      .update({
        decision_notification_status: "processing",
        decision_notification_error: null,
        decision_notified_for: decision,
      })
      .eq("id", entry.id)
      .select("*")
      .single<WaitlistEntry>();
    if (claimError) throw claimError;

    try {
      const notificationId = await sendDecisionEmail(claimed, decision);
      const { data: notifiedEntry, error: updateError } = await serviceClient
        .from("waitlist_entries")
        .update({
          decision_notification_status: "sent",
          decision_notification_id: notificationId,
          decision_notification_error: null,
          decision_notified_at: new Date().toISOString(),
          decision_notified_for: decision,
        })
        .eq("id", claimed.id)
        .select("*")
        .single<WaitlistEntry>();
      if (updateError) throw updateError;
      return json({ entry: notifiedEntry, notificationSent: true });
    } catch (emailError) {
      const detail = emailError instanceof Error ? emailError.message : "Email delivery failed.";
      console.error("Waitlist decision email failed:", detail);
      await serviceClient
        .from("waitlist_entries")
        .update({
          decision_notification_status: "failed",
          decision_notification_error: detail.slice(0, 500),
          decision_notified_for: decision,
        })
        .eq("id", claimed.id);
      return json({ entry: claimed, notificationSent: false }, 200);
    }
  } catch (error) {
    console.error(error);
    return json({ error: "The application could not be reviewed. Please try again." }, 500);
  }
});
