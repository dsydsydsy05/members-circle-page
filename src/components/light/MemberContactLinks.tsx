import { useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/lib/use-auth";

function externalUrl(value: string) {
  return /^https?:\/\//i.test(value) ? value : `https://${value}`;
}

function revealError(message: string) {
  if (message.includes("MEMBER_EMAIL_DAILY_LIMIT")) {
    return "Daily reveal limit reached.";
  }
  if (message.includes("MEMBER_EMAIL_SLOW_DOWN")) {
    return "Wait a moment before revealing another email.";
  }
  if (message.includes("MEMBER_EMAIL_MEMBERS_ONLY")) {
    return "Available to members only.";
  }
  return "Email could not be revealed.";
}

export function MemberContactLinks({
  memberId,
  linkedinUrl,
  emailMask,
  variant = "profile",
}: {
  memberId: string;
  linkedinUrl: string;
  emailMask: string;
  variant?: "profile" | "dossier";
}) {
  const { isSignedIn, isMember } = useAuth();
  const [email, setEmail] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const canReveal = isSignedIn && isMember;

  if (!linkedinUrl && !emailMask) return null;

  const reveal = async () => {
    if (!canReveal || busy) return;
    setBusy(true);
    setError(null);
    const { data, error } = await supabase.rpc("reveal_member_contact_email", {
      _profile_id: memberId,
    });
    setBusy(false);
    if (error) {
      setError(revealError(error.message));
      return;
    }
    if (!data) {
      setError("No contact email has been added.");
      return;
    }
    setEmail(data);
  };

  const signInTarget = `/auth?mode=signin&next=${encodeURIComponent(
    typeof window === "undefined" ? `/member/${memberId}` : window.location.pathname,
  )}`;

  return (
    <div className={`light-member-contact light-member-contact--${variant}`}>
      {linkedinUrl ? (
        <a href={externalUrl(linkedinUrl)} target="_blank" rel="noopener noreferrer">
          <span>LinkedIn</span>
          <strong>View profile</strong>
          <em aria-hidden="true">↗</em>
        </a>
      ) : null}

      {emailMask ? (
        <div className="light-member-contact__email">
          <span>Email / Protected</span>
          {email ? (
            <a href={`mailto:${email}`} className="light-member-contact__revealed">
              {email}
            </a>
          ) : canReveal ? (
            <button type="button" onClick={reveal} disabled={busy}>
              <strong>{emailMask}</strong>
              <em>{busy ? "Revealing…" : "Reveal email"}</em>
            </button>
          ) : !isSignedIn ? (
            <a href={signInTarget} className="light-member-contact__signin">
              <strong>{emailMask}</strong>
              <em>Sign in to reveal</em>
            </a>
          ) : (
            <span className="light-member-contact__locked">
              <strong>{emailMask}</strong>
              <em>Members can reveal</em>
            </span>
          )}
          {error ? <small role="status">{error}</small> : null}
        </div>
      ) : null}
    </div>
  );
}
