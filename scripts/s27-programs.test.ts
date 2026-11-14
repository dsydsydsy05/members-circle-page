import { describe, it, expect } from "bun:test";
import { S27_PROGRAMS, countdownParts } from "../src/lib/s27-programs";

describe("S27 application opening dates", () => {
  it("opens Hacker House December 1, 2026 at midnight China time", () => {
    expect(new Date(S27_PROGRAMS.hackerHouse.opensAt).toISOString()).toBe("2026-11-30T16:00:00.000Z");
    expect(countdownParts(S27_PROGRAMS.hackerHouse.opensAt, Date.parse("2026-11-30T15:59:59Z"))).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 1, reached: false });
  });
  it("opens Dali February 1, 2027 at midnight China time", () => {
    expect(new Date(S27_PROGRAMS.dali.opensAt).toISOString()).toBe("2027-01-31T16:00:00.000Z");
    expect(countdownParts(S27_PROGRAMS.dali.opensAt, Date.parse("2027-01-30T16:00:00Z"))).toEqual({ days: 1, hours: 0, minutes: 0, seconds: 0, reached: false });
  });
  it("never shows negative countdown values after opening", () => {
    expect(countdownParts(S27_PROGRAMS.dali.opensAt, Date.parse("2027-02-02T00:00:00Z"))).toEqual({ days: 0, hours: 0, minutes: 0, seconds: 0, reached: true });
  });
});