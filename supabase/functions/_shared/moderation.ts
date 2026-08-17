import sexualTerms from "./vendor/dsojevic-sexual-en.json" with { type: "json" };

export type ModerationTerm = {
  id?: string;
  term: string;
  language: "zh" | "en" | "any";
  category: "sexual" | "gambling" | "other";
  effect: "block" | "allow";
  match_mode: "word" | "phrase" | "substring";
  severity: number;
  source?: string;
};

export type ModerationDomain = {
  id?: string;
  domain: string;
  category: "sexual" | "gambling";
  source?: string;
};

type VendorTerm = {
  id: string;
  match: string;
  severity: number;
  allow_partial: boolean;
  exceptions: string[];
};

export type ModerationResult =
  { allowed: true } | { allowed: false; category: string; source: string; termId?: string };

const gamblingPhrases = [
  "online casino",
  "sports betting",
  "betting site",
  "place a bet",
  "casino bonus",
  "deposit bonus",
  "betting odds",
  "crypto casino",
  "real money gambling",
  "gambling link",
  "真人下注",
  "在线赌场",
  "博彩网站",
];

function escapeRegExp(value: string) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function normalizeModerationText(input: string) {
  const normalized = input
    .normalize("NFKC")
    .toLowerCase()
    .replace(/[\u200B-\u200D\u2060\uFEFF]/g, "")
    .replace(
      /[013457]/g,
      (value) =>
        ({
          "0": "o",
          "1": "i",
          "3": "e",
          "4": "a",
          "5": "s",
          "7": "t",
        })[value] ?? value,
    )
    .replace(/(.)\1{3,}/g, "$1$1")
    .replace(/[\s_.,/#!$%^&*;:{}=\-`~()[\]"'<>|\\]+/g, " ")
    .trim();

  return {
    normalized,
    compact: normalized.replace(/\s+/g, ""),
  };
}

function hasCustomTerm(text: string, compact: string, term: ModerationTerm) {
  const needle = normalizeModerationText(term.term);
  if (!needle.normalized) return false;
  if (term.match_mode === "substring") return compact.includes(needle.compact);
  if (term.match_mode === "phrase") {
    return text.includes(needle.normalized) || compact.includes(needle.compact);
  }
  return new RegExp(`(^|[^a-z0-9])${escapeRegExp(needle.normalized)}([^a-z0-9]|$)`, "i").test(text);
}

function vendorTermMatches(text: string, compact: string, term: VendorTerm) {
  const variants = term.match
    .split("|")
    .map((value) => value.trim())
    .filter(Boolean);
  const exceptions = term.exceptions.map((value) => value.replaceAll("*", ""));

  for (const variant of variants) {
    const clean = normalizeModerationText(variant.replaceAll("*", ""));
    if (!clean.normalized) continue;
    const exceptionHit = exceptions.some((value) => {
      const exception = normalizeModerationText(value);
      return exception.normalized && text.includes(exception.normalized);
    });
    if (exceptionHit) continue;

    if (variant.includes(" ")) {
      if (text.includes(clean.normalized) || compact.includes(clean.compact)) return true;
    } else if (term.allow_partial) {
      if (text.includes(clean.normalized)) return true;
    } else if (
      new RegExp(`(^|[^a-z0-9])${escapeRegExp(clean.normalized)}([^a-z0-9]|$)`, "i").test(text)
    ) {
      return true;
    }
  }
  return false;
}

function domainsIn(value: string) {
  const matches = value.matchAll(/(?:https?:\/\/)?(?:www\.)?([a-z0-9-]+(?:\.[a-z0-9-]+)+)/gi);
  return Array.from(matches, (match) => match[1]?.toLowerCase()).filter(Boolean) as string[];
}

export function moderateText(
  input: string,
  customTerms: ModerationTerm[] = [],
  blockedDomains: ModerationDomain[] = [],
): ModerationResult {
  const { normalized, compact } = normalizeModerationText(input);
  const activeAllow = customTerms.filter((term) => term.effect === "allow");
  const allowMatches = activeAllow.filter((term) => hasCustomTerm(normalized, compact, term));
  const effective = allowMatches.reduce(
    (value, term) => {
      const needle = normalizeModerationText(term.term);
      return {
        normalized: needle.normalized
          ? value.normalized.replaceAll(needle.normalized, " ")
          : value.normalized,
        compact: needle.compact ? value.compact.replaceAll(needle.compact, "") : value.compact,
      };
    },
    { normalized, compact },
  );
  const customBlock = customTerms.find(
    (term) =>
      term.effect === "block" && hasCustomTerm(effective.normalized, effective.compact, term),
  );
  if (customBlock) {
    return {
      allowed: false,
      category: customBlock.category,
      source: customBlock.source ?? "custom",
      termId: customBlock.id,
    };
  }

  if (
    gamblingPhrases.some((phrase) =>
      hasCustomTerm(effective.normalized, effective.compact, {
        term: phrase,
        language: "any",
        category: "gambling",
        effect: "block",
        match_mode: "phrase",
        severity: 4,
      }),
    )
  ) {
    return { allowed: false, category: "gambling", source: "the-room-curated" };
  }

  const vendorMatch = (sexualTerms as VendorTerm[]).find((term) =>
    vendorTermMatches(effective.normalized, effective.compact, term),
  );
  if (vendorMatch) {
    return {
      allowed: false,
      category: "sexual",
      source: "dsojevic/profanity-list",
      termId: vendorMatch.id,
    };
  }

  const domains = domainsIn(input);
  const domainMatch = blockedDomains.find((entry) =>
    domains.some((domain) => domain === entry.domain || domain.endsWith(`.${entry.domain}`)),
  );
  if (domainMatch) {
    return {
      allowed: false,
      category: domainMatch.category,
      source: domainMatch.source ?? "domain-list",
      termId: domainMatch.id,
    };
  }

  return { allowed: true };
}
