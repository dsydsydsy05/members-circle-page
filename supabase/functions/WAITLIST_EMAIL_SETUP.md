# Waitlist administrator email

`submit-waitlist` saves the application first, then sends one administrator notification through
Resend. `review-waitlist` applies an approved or rejected decision, then emails the applicant. A
delivery failure is recorded on `waitlist_entries` and does not remove the application or roll back
the administrator's decision.

Public applications do not require an account. After approval, signing in with the same email
claims the application and activates Member access.

`supabase/config.toml` intentionally sets `verify_jwt = false` only for `submit-waitlist`. The
function validates public input itself and uses authenticated account data when a valid session is
present. `review-waitlist` remains protected by JWT and an internal admin-role check.

Required Edge Function secrets:

```sh
supabase secrets set RESEND_API_KEY=re_xxx
supabase secrets set 'WAITLIST_FROM_EMAIL=The Room <notifications@your-verified-domain.com>'
supabase secrets set 'WAITLIST_ADMIN_EMAILS=dsydongshiyu@gmail.com,1012720881@qq.com,test@theroomcommunity.org'
supabase secrets set PUBLIC_SITE_URL=https://your-public-site.example
```

The domain in `WAITLIST_FROM_EMAIL` must be verified in Resend. Apply all waitlist migrations,
including `20260820170000_public_waitlist_claim.sql`, then deploy both functions:

```sh
supabase functions deploy submit-waitlist
supabase functions deploy review-waitlist
```

No email-provider secret belongs in `.env` variables prefixed with `VITE_`; those are exposed to
the browser.
