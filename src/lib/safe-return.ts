const NFC_RETURN_PATH = /^\/nfc\/[A-Za-z0-9_-]{16,128}$/;

export function safeNfcReturnPath(value: unknown, fallback = "/onboarding") {
  return typeof value === "string" && NFC_RETURN_PATH.test(value) ? value : fallback;
}

export function safeAuthMode(value: unknown): "signin" | "signup" {
  return value === "signup" ? "signup" : "signin";
}
