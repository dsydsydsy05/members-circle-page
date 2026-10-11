import { createFileRoute } from "@tanstack/react-router";

/**
 * Notifies the admin when a signed-in user submits a Challenge application.
 * The caller must be the applicant: we verify the bearer token, load their
 * own pending application (RLS scopes it to them), and only send if it was
 * submitted recently and not yet notified. Recipient, sender and template
 * are fixed server-side — the browser cannot choose them.
 */

const ADMIN_NOTIFY_EMAIL = "theroomcommunityofficial@gmail.com";
const ADMIN_PAGE_URL = "https://www.theroomcommunity.org/admin";
const RECENT_WINDOW_MS = 15 * 60 * 1000;

function escapeHtml(value: string) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

export const Route = createFileRoute("/api/public/challenge-application-notify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const authorization = request.headers.get("Authorization");
        if (!authorization) {
          return Response.json({ error: "Sign-in required." }, { status: 401 });
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

        // RLS limits this to the caller's own application row.
        const { data: application, error: appError } = await userClient
          .from("challenge_applications")
          .select("id, full_name, school, grade, email, status, updated_at, admin_notified_at")
          .eq("user_id", userData.user.id)
          .maybeSingle();

        if (appError || !application) {
          return Response.json({ error: "No application found." }, { status: 404 });
        }
        if (application.admin_notified_at) {
          return Response.json({ status: "already_notified" });
        }
        const updatedAt = Date.parse(application.updated_at);
        if (!Number.isFinite(updatedAt) || Date.now() - updatedAt > RECENT_WINDOW_MS) {
          return Response.json({ error: "Application was not submitted just now." }, { status: 409 });
        }

        const apiKey = process.env["RESEND_API_KEY"];
        const from = process.env["WAITLIST_FROM_EMAIL"];
        if (!apiKey || !from) {
          return Response.json({ error: "Email sending is not configured." }, { status: 500 });
        }

        const name = application.full_name || "Unknown";
        const subject = `New Challenge application — ${name}`;
        const text = [
          `A new application for The Ultimate Entrepreneurial Challenge just came in.`,
          ``,
          `Name: ${name}`,
          `School: ${application.school || "-"}`,
          `Grade: ${application.grade || "-"}`,
          `Email: ${application.email || "-"}`,
          ``,
          `Review it in the admin dashboard: ${ADMIN_PAGE_URL}`,
        ].join("\n");

        const row = (label: string, value: string) =>
          `<tr><td style="padding:6px 14px 6px 0;font:11px monospace;letter-spacing:.1em;text-transform:uppercase;color:#777;vertical-align:top">${label}</td><td style="padding:6px 0;font-size:15px;color:#11130f">${escapeHtml(value)}</td></tr>`;

        const html = `
          <div style="background:#f1f0ec;padding:32px;font-family:Arial,sans-serif;color:#11130f">
            <div style="max-width:600px;margin:0 auto;background:#fff;padding:36px;border-radius:24px">
              <p style="margin:0 0 24px;font:12px/1.4 monospace;letter-spacing:.14em;text-transform:uppercase;color:#7BA23F">The Room / Challenge</p>
              <h1 style="margin:0 0 22px;font-size:28px;line-height:1.15">New Challenge application</h1>
              <table style="border-collapse:collapse;margin:0 0 26px">
                ${row("Name", name)}
                ${row("School", application.school || "-")}
                ${row("Grade", application.grade || "-")}
                ${row("Email", application.email || "-")}
              </table>
              <p style="margin:0"><a href="${ADMIN_PAGE_URL}" style="display:inline-block;background:#11130f;color:#fff;text-decoration:none;padding:14px 20px;border-radius:999px;font:12px monospace;letter-spacing:.08em;text-transform:uppercase">Review in admin ↗</a></p>
            </div>
          </div>`;

        const sendResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            Authorization: `Bearer ${apiKey}`,
            "Content-Type": "application/json",
            "User-Agent": "TheRoom-ChallengeNotify/1.0",
          },
          body: JSON.stringify({
            from,
            to: [ADMIN_NOTIFY_EMAIL],
            reply_to: application.email || undefined,
            subject,
            text,
            html,
          }),
        });

        if (!sendResponse.ok) {
          const detail = await sendResponse.text().catch(() => "");
          return Response.json(
            { error: `Email send failed (${sendResponse.status}).`, detail: detail.slice(0, 200) },
            { status: 502 },
          );
        }

        // Mark as notified so resubmissions don't send again.
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        await supabaseAdmin
          .from("challenge_applications")
          .update({ admin_notified_at: new Date().toISOString() })
          .eq("id", application.id)
          .is("admin_notified_at", null);

        return Response.json({ status: "sent" });
      },
    },
  },
});
