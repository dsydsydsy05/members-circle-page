# The Room community update — local handoff

The September 18 Boston dinner uses the existing event list and story template. The additional featured-event composition and homepage changes were removed following review. The cover uses the supplied poster with its attendance corrected to 19 founders; the photograph is the supplied original. The archive uses the actual 19 founders. The original-invitation caption was removed at user request; the poster now reads “19 founders. One table.”

## Implemented

- Event metadata, Boston seed, original cover/photo, admin editing, and data-driven location/count/date in the existing story template.
- Public question filters, guest profile links, guest biographies, reporting, private versioned guest-review links, explicit approval/decline, revocation, and an administrative draft/approval/publication workflow.
- Member connection requests, explicit mutual contact-email sharing, incoming/outgoing/connected/blocked folders, pending counts, withdrawal, rejection cooldown, disconnect, block, report, and email notification outbox with administrative retry.
- Server checks prevent reading contact emails before mutual acceptance, publishing unapproved guest answers, and activating one's own membership via the legacy profile UPDATE grant. No private table has browser read/write grants.
- Profile story/topic fields and contact email setup. Login email is no longer prefilled as a contact email.

## Local validation

- `npm run typecheck` and `npm run build`: passed.
- `npm run test:community`: 22 integration scenarios using isolated PGlite PostgreSQL and the real new SQL migrations. The fixture recreates the relevant existing tables, grants and policies; this is not a full production database replay.
- `npx deno check supabase/functions/community-notify/index.ts supabase/functions/submit-question/index.ts`: passed.
- `npx deno test --allow-env scripts/test-community-notify.ts`: 6 tests of the real mail function with all HTTP requests intercepted, including provider failure, retry claims, obsolete requests, and authorization. No real mail is sent.
- `ROOM_PREVIEW_URL=http://127.0.0.1:5174 npm run test:community:browser`: 8 Playwright scenarios at 1440×1000 and 390×844, using isolated API fixtures. Includes original event template, Q&A/guest page, explicit guest approval, member request, accept, email access, and disconnect. Chrome must be installed and `npm run dev` running on the configured port.
- ESLint passed for newly added frontend modules. `git diff --check` passed.
- Screenshots are in `output/qa`; names used for member/guest previews are fixtures, not published community data.

## Deployment — not performed

No Supabase management/database credentials, service-role key, or Resend key are available in this session. Only public client configuration is present. Production migrations, function deployment, real mail delivery and live two-member acceptance are not verified.

1. Back up the database and check the linked project (`yortabtwbntfsggsnoix`) migration history. Do not blindly replay old migrations: the repository contains historical duplicate migration files.
2. Apply only the three new migrations in order: `20260928090000_room_stories.sql`, then `20260928091000_room_community.sql`, then `20260928092000_event_schedule.sql`, in a transaction per migration. Preserve existing rows. Guest answers without approval become drafts; review them in Admin → Q&A.
3. Configure Edge secrets: `RESEND_API_KEY`, `PUBLIC_SITE_URL=https://theroomcommunity.org`, and a verified-domain `COMMUNITY_FROM_EMAIL` (or existing `WAITLIST_FROM_EMAIL`). Supabase supplies its own URL/anon/service credentials to deployed functions. Never put service credentials in VITE variables.
4. Deploy `community-notify` and the updated `submit-question`. The notification endpoint validates a signed-in user and only permits the originating actor or an administrator. Keep platform JWT protection enabled for it.
5. Build/publish the frontend through the existing connected Lovable project. Do not change hosting provider or rewrite Git history. Push/sync alone is not proof of publication.
6. Verify Boston and the existing Shanghai event, mobile display, administrative drafts, expired/revoked review links, and direct unauthorized API reads. With two explicitly designated test accounts, verify acceptance/disconnect and private-email access. Send any real test notification only to designated test addresses.
7. Verify the verified sender/domain in Resend and delivery in the recipient inbox. A saved request is successful even if notification delivery fails; Admin → Moderation exposes the durable outbox and retry controls. There is no background retry scheduler in this version.
8. Staff create a review link in Admin → Q&A and share it privately with the named guest. Links are bearer capabilities, valid for seven days, carried in the URL fragment, and never sent automatically. Approval is attached to the exact answer version; text/byline changes invalidate it. Staff publish only after approval.

## Rollback and operational notes

If frontend rollout fails, unpublish the affected frontend release while retaining the tighter database email and approval checks. Do not restore the old member-wide email reveal function. Existing connections/approvals/reports remain in the database. Previously saved email copies cannot be recalled after disconnect.

Existing local changes to `src/routeTree.gen.ts` were preserved while the router regenerated entries for the three new routes. The user subsequently authorized committing and pushing this implementation for Lovable backend handoff; see `docs/LOVABLE_BACKEND_HANDOFF.md`. No real guest invitation or production publication has been verified.

## Schedule correction

Keep three Coming Soon entries, dated Oct 15, Nov 15, Dec 15 respectively. Shanghai keeps archive number 01; Boston is archive number 02 even though it is displayed first. These data updates remain pending production migration.

## Real local browser preview

The development server now projects the pending authored event data in `useEvents`, so the actual `/events` page and homepage show the new dinner and Oct/Nov/Dec schedule without Playwright request mocks. Remote event rows are retained. This projection is development-only, does not alter the database, and disables itself once Boston has archive number 02 in the database. Production remains database-driven and still requires the migrations above. This preview does not simulate member, authorization, or connection data.
