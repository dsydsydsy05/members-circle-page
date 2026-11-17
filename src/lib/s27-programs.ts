// Fields marked "To be announced" are not confirmed yet; replace them here and both pages update.
export const S27_PROGRAMS = {
  hackerHouse: {
    title: "S27 Hacker House",
    opensAt: "2026-12-01T00:00:00+08:00",
    openingLabel: "December 1, 2026",
    openingStamp: "2026-12-01 00:00 CST",
    closingLabel: "To be announced",
    location: "To be announced",
    programDates: "To be announced",
    category: "Hacker House",
    description: "Applications open December 1.",
    detail: "S27 Hacker House applications open on December 1, 2026.",
    path: "/hacker-house",
  },
  dali: {
    title: "S27 Dali Founder Residency",
    opensAt: "2027-02-01T00:00:00+08:00",
    openingLabel: "February 1, 2027",
    openingStamp: "2027-02-01 00:00 CST",
    closingLabel: "To be announced",
    location: "Dali, Yunnan",
    programDates: "14 days · dates to be announced",
    category: "Dali · 14 days",
    description: "14 days in Dali for founders and digital nomads.",
    detail:
      "A 14-day stay in Dali for founders and digital nomads. Applications open February 1, 2027.",
    path: "/dali",
  },
} as const;

export function countdownParts(opensAt: string, now: number) {
  const total = Math.max(0, Math.floor((Date.parse(opensAt) - now) / 1000));
  return {
    days: Math.floor(total / 86400),
    hours: Math.floor((total % 86400) / 3600),
    minutes: Math.floor((total % 3600) / 60),
    seconds: total % 60,
    reached: now >= Date.parse(opensAt),
  };
}
