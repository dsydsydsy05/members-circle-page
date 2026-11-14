<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Build the Q&A feed and composer from AI Elements primitives to preserve accessible input and scrolling behavior.
- Store community replies separately from official answers so signed-in replies never bypass versioned guest approval.
- Validate and moderate community replies in authenticated TanStack server functions before privileged writes; public clients receive no author account IDs.
- Temporarily closed directory routes render a shared locked page without mounting directory fetchers; retain the directory views and admin editing for reopening.
- Read event listings directly from persisted content in every environment and refresh open listings periodically so admin changes do not leave stale announcements visible.
- Membership applications require a signed-in account and go through submit_member_application (stores answers on waitlist_entries and profiles); admins approve in the Applications tab. Why: the public waitlist closed and reviewers need full applicant details.
- Post-authentication destinations are allowlisted in src/lib/safe-return.ts: an NFC tap returns to its own /nfc path; anyone else lands on the membership application. Why: retired application destinations must not override the active entry flow or allow arbitrary redirects.
- Retired public application routes redirect to the homepage without mounting application forms or fetchers; historical application records remain persisted. Why: old bookmarks should not expose removed sections or destroy existing submissions.
- Guest public reads require is_published; new admin-created guests start unpublished, while existing public records retain visibility. Why: draft guest details must stay private without removing existing announcements.
- Avatar Storage SELECT is owner-scoped; display uses the owner's saved signed URL rather than granting visitors bucket-wide reads. Why: visitors may see shared profile photos without enumerating or signing other users' uploads.
