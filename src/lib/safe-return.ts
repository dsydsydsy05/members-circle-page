const NFC_RETURN_PATH = /^\/nfc\/[A-Za-z0-9_-]{16,128}$/;

/** Where a sign-in or sign-up is allowed to send someone afterwards. */
const AUTH_RETURN_PATH = NFC_RETURN_PATH;

export function safeNfcReturnPath(value: unknown, fallback = "/onboarding") {
  return typeof value === "string" && NFC_RETURN_PATH.test(value) ? value : fallback;
}

/**
 * NFC visitors return to their tapped pass; all other visitors go to the membership application.
 */
export function safeAuthReturnPath(value: unknown, fallback = "/onboarding") {
  return typeof value === "string" && AUTH_RETURN_PATH.test(value) ? value : fallback;
}

export function safeAuthMode(value: unknown): "signin" | "signup" {
  return value === "signup" ? "signup" : "signin";
}
