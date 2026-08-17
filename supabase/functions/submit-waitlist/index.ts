import { createClient } from "npm:@supabase/supabase-js@2";
import { corsHeaders, json } from "../_shared/cors.ts";

const DEFAULT_ADMIN_EMAILS = [
  "dsydongshiyu@gmail.com",
  "1012720881@qq.com",
  "test@theroomcommunity.org",
];

type WaitlistEntry = {
  id: string;
  user_id: string;
  email: string;
  full_name: string;
  status: "pending" | "approved" | "rejected";
  admin_notification_status: "pending" | "processing" | "sent" | "failed";
  created_at: string;
};

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function adminRecipients() {
  const configured = Deno.env
    .get("WAITLIST_ADMIN_EMAILS")
    ?.split(",")
    .map((email) => email.trim().toLowerCase())
    .filter(Boolean);
  return configured?.length ? [...new Set(configured)] : DEFAULT_ADMIN_EMAILS;
}

async function sendAdminEmail(entry: WaitlistEntry) {
  const apiKey = Deno.env.get("RESEND_API_KEY");
  const from = Deno.env.get("WAITLIST_FROM_EMAIL");
  if (!apiKey || !from) {
    throw new Error("RESEND_API_KEY or WAITLIST_FROM_EMAIL is not configured.");
  }

  const applicantName = escapeHtml(entry.full_name);
  const applicantEmail = escapeHtml(entry.email);
  const siteUrl = Deno.env.get("PUBLIC_SITE_URL")?.replace(/\/$/, "");
  const adminUrl = siteUrl ? `${siteUrl}/admin` : null;
  const submittedAt = new Date(entry.created_at).toISOString();

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json",
      "Idempotency-Key": `waitlist-${entry.id}`,
      "User-Agent": "TheRoom-Waitlist/1.0",
    },
    body: JSON.stringify({
      from,
      to: adminRecipients(),
      reply_to: entry.email,
      subject: `New waitlist application — ${entry.full_name}`,
      text: [
        "A new Become a Member application has arrived.",
        "",
        `Name: ${entry.full_name}`,
        `Email: ${entry.email}`,
        `Submitted: ${submittedAt}`,
        ...(adminUrl ? ["", `Review: ${adminUrl}`] : []),
      ].join("\n"),
      html: `
        <div style="background:#f1f0ec;padding:32px;font-family:Arial,sans-serif;color:#11130f">
          <div style="max-width:600px;margin:0 auto;background:#fff;padding:36px;border-radius:24px">
            <p style="margin:0 0 24px;font:12px/1.4 monospace;letter-spacing:.14em;text-transform:uppercase;color:#779d42">The Room / Waitlist</p>
            <h1 style="margin:0 0 28px;font-size:30px;line-height:1.1">New member application.</h1>
            <table style="width:100%;border-collapse:collapse;font-size:15px">
              <tr><td style="padding:12px 0;border-top:1px solid #deddd8;color:#777">Name</td><td style="padding:12px 0;border-top:1px solid #deddd8;text-align:right;font-weight:600">${applicantName}</td></tr>
              <tr><td style="padding:12px 0;border-top:1px solid #deddd8;color:#777">Email</td><td style="padding:12px 0;border-top:1px solid #deddd8;text-align:right"><a href="mailto:${applicantEmail}" style="color:#11130f">${applicantEmail}</a></td></tr>
              <tr><td style="padding:12px 0;border-top:1px solid #deddd8;color:#777">Submitted</td><td style="padding:12px 0;border-top:1px solid #deddd8;text-align:right">${submittedAt}</td></tr>
            </table>
            ${
              adminUrl
                ? `<p style="margin:30px 0 0"><a href="${escapeHtml(adminUrl)}" style="display:inline-block;background:#11130f;color:#fff;text-decoration:none;padding:14px 20px;border-radius:999px;font:12px monospace;letter-spacing:.08em;text-transform:uppercase">Review application ↗</a></p>`
                : ""
            }
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
    if (!authorization) return json({ error: "Sign in to join the waitlist." }, 401);

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
    const fullName = typeof payload.fullName === "string" ? payload.fullName.trim() : "";
    if (fullName.length < 1 || fullName.length > 80) {
      return json({ error: "Name must be between 1 and 80 characters." }, 400);
    }

    const { data: submittedEntry, error: submitError } = await userClient.rpc("submit_waitlist", {
      _full_name: fullName,
    });
    if (submitError || !submittedEntry) {
      throw submitError ?? new Error("Waitlist entry was not created.");
    }
    const entry = submittedEntry as unknown as WaitlistEntry;

    if (entry.admin_notification_status === "sent") {
      return json({ entry, notificationSent: true, duplicate: true });
    }

    const { data: claimed, error: claimError } = await serviceClient
      .from("waitlist_entries")
      .update({ admin_notification_status: "processing", admin_notification_error: null })
      .eq("id", entry.id)
      .in("admin_notification_status", ["pending", "failed"])
      .select("*")
      .maybeSingle<WaitlistEntry>();
    if (claimError) throw claimError;
    if (!claimed) {
      return json({ entry, notificationSent: false, notificationInProgress: true });
    }

    try {
      const notificationId = await sendAdminEmail(claimed);
      const { data: sentEntry, error: updateError } = await serviceClient
        .from("waitlist_entries")
        .update({
          admin_notification_status: "sent",
          admin_notification_id: notificationId,
          admin_notification_error: null,
          admin_notified_at: new Date().toISOString(),
        })
        .eq("id", claimed.id)
        .select("*")
        .single<WaitlistEntry>();
      if (updateError) throw updateError;
      return json({ entry: sentEntry, notificationSent: true }, 201);
    } catch (emailError) {
      const detail = emailError instanceof Error ? emailError.message : "Email delivery failed.";
      console.error("Waitlist email failed:", detail);
      await serviceClient
        .from("waitlist_entries")
        .update({
          admin_notification_status: "failed",
          admin_notification_error: detail.slice(0, 500),
        })
        .eq("id", claimed.id);
      return json({ entry: claimed, notificationSent: false }, 201);
    }
  } catch (error) {
    console.error(error);
    return json({ error: "The waitlist application could not be sent. Please try again." }, 500);
  }
});
