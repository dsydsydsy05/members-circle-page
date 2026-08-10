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

export const tierOrder: PartnerTier[] = ["diamond", "platinum", "gold", "silver", "ecosystem"];
