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
