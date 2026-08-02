export type PartnerTier = "diamond" | "platinum" | "gold" | "silver" | "ecosystem";

export type Partner = {
  id: string;
  name: string;
  tier: PartnerTier;
  blurb: string;
  url: string;
  logoUrl?: string | null;
};

export const tierMeta: Record<
  PartnerTier,
  { label: string; note: string; cols: string; height: string }
> = {
  diamond: {
    label: "Diamond",
    note: "Title sponsor · exclusive year-round partner",
    cols: "grid-cols-1",
    height: "h-44 sm:h-56",
  },
  platinum: {
    label: "Platinum",
    note: "Lead sponsor",
    cols: "grid-cols-1 sm:grid-cols-2",
    height: "h-36 sm:h-44",
  },
  gold: {
    label: "Gold",
    note: "Event sponsor",
    cols: "grid-cols-2 sm:grid-cols-3",
    height: "h-28 sm:h-32",
  },
  silver: {
    label: "Silver",
    note: "Supporting partner",
    cols: "grid-cols-2 sm:grid-cols-4",
    height: "h-24 sm:h-28",
  },
  ecosystem: {
    label: "Ecosystem Partner",
    note: "Tools & community partners",
    cols: "grid-cols-2 sm:grid-cols-4",
    height: "h-24 sm:h-28",
  },
};

export const tierOrder: PartnerTier[] = [
  "diamond",
  "platinum",
  "gold",
  "silver",
  "ecosystem",
];

export const partners: Partner[] = [
  {
    id: "p1",
    name: "NOVAWORKS",
    tier: "diamond",
    blurb: "Global manufacturing platform for emerging brands.",
    url: "https://example.com",
  },
  {
    id: "p2",
    name: "ATLAS CAPITAL",
    tier: "platinum",
    blurb: "Early-stage fund backing consumer builders.",
    url: "https://example.com",
  },
  {
    id: "p3",
    name: "HELIOS LABS",
    tier: "platinum",
    blurb: "Materials R&D for performance apparel.",
    url: "https://example.com",
  },
  {
    id: "p4",
    name: "MERIDIAN",
    tier: "gold",
    blurb: "Cross-border logistics, simplified.",
    url: "https://example.com",
  },
  {
    id: "p5",
    name: "FORMFACTOR",
    tier: "gold",
    blurb: "Industrial design studio.",
    url: "https://example.com",
  },
  {
    id: "p6",
    name: "KILN&CO",
    tier: "gold",
    blurb: "Small-batch ceramics and homeware.",
    url: "https://example.com",
  },
  {
    id: "p7",
    name: "PIXELGRAM",
    tier: "silver",
    blurb: "Creative production for launches.",
    url: "https://example.com",
  },
  {
    id: "p8",
    name: "NORTHBOUND",
    tier: "silver",
    blurb: "Retail buying collective.",
    url: "https://example.com",
  },
  {
    id: "p9",
    name: "OPENSTACK",
    tier: "ecosystem",
    blurb: "Developer tools for commerce teams.",
    url: "https://example.com",
  },
  {
    id: "p10",
    name: "CIRCLE HOUSE",
    tier: "ecosystem",
    blurb: "Community space and event host.",
    url: "https://example.com",
  },
];
