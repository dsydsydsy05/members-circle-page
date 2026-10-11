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
- Post-authentication destinations are allowlisted in src/lib/safe-return.ts: an NFC tap returns to its own /nfc path, a sign-up started from the Challenge returns to /challenge, anyone else lands on the membership application. Why: each entry point must reach its own form without opening the site to arbitrary redirect targets.
- The membership application page carries no Challenge content; the Challenge is reachable only from its own entry points. Why: the two applications are separate audiences and one page must not push the other.
