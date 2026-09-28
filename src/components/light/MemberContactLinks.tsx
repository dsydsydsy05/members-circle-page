import { ConnectControl } from "./CommunityControls";
export function MemberContactLinks({
  memberId,
  linkedinUrl,
  variant = "profile",
}: {
  memberId: string;
  linkedinUrl: string;
  emailMask: string;
  variant?: "profile" | "dossier";
}) {
  let safeLinkedIn = "";
  try {
    const url = new URL(/^https?:\/\//i.test(linkedinUrl) ? linkedinUrl : `https://${linkedinUrl}`);
    if (
      url.protocol === "https:" &&
      (url.hostname === "linkedin.com" || url.hostname.endsWith(".linkedin.com"))
    )
      safeLinkedIn = url.href;
  } catch {
    /* no public link */
  }
  return (
    <div className={`light-member-contact light-member-contact--${variant}`}>
      {safeLinkedIn && (
        <a href={safeLinkedIn} target="_blank" rel="noopener noreferrer">
          <span>LinkedIn</span>
          <strong>View profile ↗</strong>
        </a>
      )}
      <ConnectControl memberId={memberId} />
    </div>
  );
}
