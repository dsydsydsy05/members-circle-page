import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

/**
 * Admin-only bulk sender for the member welcome email.
 * Recipients come from list_member_welcome_recipients() (approved waitlist
 * emails + member profile emails, deduplicated, minus already-emailed).
 * Every successful send is logged in member_welcome_emails so repeats never
 * duplicate. The caller must be an authenticated admin (has_role).
 */

const bodySchema = z.object({ dryRun: z.boolean().optional() });

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

const SITE_URL = "https://www.theroomcommunity.org";
const REPLY_TO = "theroomcommunityofficial@gmail.com";

function buildEmail() {
  const subject = "Welcome to The Room — your membership is confirmed";
  const text = [
    "Hi there,",
    "",
    "Great news — you've been accepted as a member of The Room.",
    "",
    "Here's what you can do right now:",
    "- Explore the community and meet fellow members at theroomcommunity.org",
    "- Complete your profile so members can find you — and connect with the people you want to know",
    "- Post your business questions in the Q&A. We bring in exceptional entrepreneurs to select and answer them.",
    "",
    "And coming soon: member-only benefits.",
    "",
    "Got news to share — a launch, a milestone, something you're building? Email us at theroomcommunityofficial@gmail.com. If we can help you spread the word, we will.",
    "",
    `Sign up or sign in with the email you applied with: ${SITE_URL}`,
    "",
    "See you in the right room,",
    "The Room",
  ].join("\n");

  const bullets = [
    "Explore the community and meet fellow members at theroomcommunity.org",
    "Complete your profile so members can find you — and connect with the people you want to know",
    "Post your business questions in the Q&A. We bring in exceptional entrepreneurs to select and answer them.",
  ]
    .map(
      (item) =>
        `<li style="margin:0 0 12px;font-size:15px;line-height:1.6;color:#454640">${escapeHtml(item)}</li>`,
    )
    .join("");

  const html = `
    <div style="background:#f1f0ec;padding:32px;font-family:Arial,sans-serif;color:#11130f">
      <div style="max-width:600px;margin:0 auto;background:#fff;padding:36px;border-radius:24px">
        <p style="margin:0 0 24px;font:12px/1.4 monospace;letter-spacing:.14em;text-transform:uppercase;color:#7BA23F">The Room / Membership</p>
        <p style="margin:0 0 12px;color:#777">Hi there,</p>
        <h1 style="margin:0 0 22px;font-size:32px;line-height:1.1">You're in the room.</h1>
        <p style="margin:0 0 22px;font-size:16px;line-height:1.65;color:#454640">Great news — you've been accepted as a member of The Room.</p>
        <p style="margin:0 0 14px;font-size:13px;line-height:1.5;font-weight:bold;letter-spacing:.06em;text-transform:uppercase;color:#11130f">What you can do right now</p>
        <ul style="margin:0 0 22px;padding-left:20px">${bullets}</ul>
        <p style="margin:0 0 22px;font-size:16px;line-height:1.65;color:#454640">And coming soon: member-only benefits.</p>
        <p style="margin:0 0 22px;font-size:16px;line-height:1.65;color:#454640">Got news to share — a launch, a milestone, something you're building? Email us at <a href="mailto:${REPLY_TO}" style="color:#7BA23F">${REPLY_TO}</a>. If we can help you spread the word, we will.</p>
        <p style="margin:30px 0 0"><a href="${SITE_URL}" style="display:inline-block;background:#11130f;color:#fff;text-decoration:none;padding:14px 20px;border-radius:999px;font:12px monospace;letter-spacing:.08em;text-transform:uppercase">Enter The Room ↗</a></p>
        <p style="margin:34px 0 0;font:13px monospace">See you in the right room,<br/>The Room</p>
      </div>
    </div>`;

  return { subject, text, html };
}

async function sendWelcomeBatches(emails: string[], from: string) {
  const apiKey = process.env["RESEND_API_KEY"];
  if (!apiKey) throw new Error("Email sending is not configured.");

  const { subject, text, html } = buildEmail();
  const messages = emails.map((email) => ({
    from,
    to: [email],
    reply_to: REPLY_TO,
    subject,
    text,
    html,
  }));

  let sent = 0;
  const errors: string[] = [];
  const sentRows: { email: string; resend_id: string | null }[] = [];
  const batchSize = 100;

  for (let i = 0; i < messages.length; i += batchSize) {
    const batch = messages.slice(i, i + batchSize);
    const response = await fetch("https://api.resend.com/emails/batch", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
        "User-Agent": "TheRoom-MemberWelcome/1.0",
      },
      body: JSON.stringify(batch),
    });
    const result = (await response.json().catch(() => null)) as
      | { data?: { id?: string }[]; message?: string }
      | { id?: string }[]
      | null;
    if (!response.ok) {
      const detail =
        result && !Array.isArray(result) && typeof result.message === "string"
          ? result.message
          : `HTTP ${response.status}`;
      errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${detail}`);
      continue;
    }
    const ids = Array.isArray(result) ? result : (result?.data ?? []);
    batch.forEach((message, index) => {
      const id = ids[index] && typeof ids[index].id === "string" ? ids[index].id : null;
      sent += 1;
      sentRows.push({ email: message.to[0], resend_id: id });
    });
  }

  return { sent, sentRows, errors };
}

export const Route = createFileRoute("/api/public/send-member-welcome")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authorization = request.headers.get("Authorization");
        if (!authorization) {
          return Response.json({ error: "Admin sign-in required." }, { status: 401 });
        }

        const url = process.env["SUPABASE_URL"];
        const anonKey = process.env["SUPABASE_PUBLISHABLE_KEY"];
        if (!url || !anonKey) {
          return Response.json({ error: "Backend is not configured." }, { status: 500 });
        }

        const { createClient } = await import("@supabase/supabase-js");
        const userClient = createClient(url, anonKey, {
          global: { headers: { Authorization: authorization } },
          auth: { persistSession: false },
        });

        const { data: userData, error: userError } = await userClient.auth.getUser();
        if (userError || !userData.user) {
          return Response.json({ error: "Your session has expired." }, { status: 401 });
        }

        const { data: isAdmin, error: roleError } = await userClient.rpc("has_role", {
          _user_id: userData.user.id,
          _role: "admin",
        });
        if (roleError || !isAdmin) {
          return Response.json({ error: "Admin access required." }, { status: 403 });
        }

        const parsed = bodySchema.safeParse(await request.json().catch(() => ({})));
        const dryRun = parsed.success ? parsed.data.dryRun === true : false;

        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data: recipients, error: recipientsError } = await supabaseAdmin.rpc(
          "list_member_welcome_recipients",
        );
        if (recipientsError || !recipients) {
          return Response.json(
            { error: recipientsError?.message ?? "Could not list recipients." },
            { status: 500 },
          );
        }

        const emails = (recipients as { email: string }[])
          .map((r) => r.email)
          .filter((email) => typeof email === "string" && email.includes("@"));

        if (dryRun) {
          return Response.json({ dryRun: true, count: emails.length, recipients: emails });
        }

        const from = process.env["WAITLIST_FROM_EMAIL"];
        if (!from) {
          return Response.json({ error: "Sender address is not configured." }, { status: 500 });
        }

        const { sent, sentRows, errors } = await sendWelcomeBatches(emails, from);

        if (sentRows.length > 0) {
          const { error: logError } = await supabaseAdmin
            .from("member_welcome_emails")
            .upsert(sentRows, { onConflict: "email" });
          if (logError) errors.push(`Send log update failed: ${logError.message}`);
        }

        return Response.json({ sent, skipped: emails.length - sent, errors });
      },
    },
  },
});
