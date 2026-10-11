const NFC_RETURN_PATH = /^\/nfc\/[A-Za-z0-9_-]{16,128}$/;

/** Where a sign-in or sign-up is allowed to send someone afterwards. */
const AUTH_RETURN_PATH = /^(?:\/nfc\/[A-Za-z0-9_-]{16,128}|\/challenge)$/;

export function safeNfcReturnPath(value: unknown, fallback = "/onboarding") {
  return typeof value === "string" && NFC_RETURN_PATH.test(value) ? value : fallback;
}

/**
 * Post-authentication destination. Someone who started on the Challenge page goes straight back to
 * the Challenge application; anyone else lands on the membership application.
 */
export function safeAuthReturnPath(value: unknown, fallback = "/onboarding") {
  return typeof value === "string" && AUTH_RETURN_PATH.test(value) ? value : fallback;
}

export function safeAuthMode(value: unknown): "signin" | "signup" {
  return value === "signup" ? "signup" : "signin";
}
