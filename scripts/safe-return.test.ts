import { describe, it, expect } from "bun:test";
import { safeAuthReturnPath } from "../src/lib/safe-return";

describe("authentication destinations after Challenge removal", () => {
  it("sends retired Challenge destinations to membership", () => {
    expect(safeAuthReturnPath("/challenge")).toBe("/onboarding");
  });
  it("preserves NFC pass return destinations", () => {
    expect(safeAuthReturnPath("/nfc/1234567890abcdef")).toBe("/nfc/1234567890abcdef");
  });
  it("rejects external return destinations", () => {
    expect(safeAuthReturnPath("https://example.com/challenge")).toBe("/onboarding");
  });
});