import { useQuery, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";

export type EventRow = {
  id: string;
  slug?: string | null;
  title: string;
  date_label: string;
  city: string;
  status: string;
  cover_url: string | null;
  detail_image_url?: string | null;
  summary?: string | null;
  body?: string | null;
  sort_order: number;
};

export type GuestRow = {
  id: string;
  name: string;
  title: string;
  event: string;
  date_label: string;
  sort_order: number;
};

export type PhotoRow = {
  id: string;
  src: string;
  caption: string;
  sort_order: number;
};

export type FactoryRow = {
  id: string;
  name: string;
  category: string;
  location: string;
  moq: string;
  sample_time: string;
  contact: string;
  notes: string;
  website: string | null;
  sort_order: number;
};

export type PartnerRow = {
  id: string;
  name: string;
  tier: string;
  blurb: string;
  url: string | null;
  logo_url: string | null;
  sort_order: number;
};

const LEGACY_DEMO_PARTNER_NAMES = new Set([
  "NOVAWORKS",
  "ATLAS CAPITAL",
  "HELIOS LABS",
  "MERIDIAN",
  "FORMFACTOR",
  "KILN&CO",
  "PIXELGRAM",
  "NORTHBOUND",
  "OPENSTACK",
  "CIRCLE HOUSE",
]);

function isLegacyDemoPartner(partner: PartnerRow) {
  const isSeedFixture =
    partner.url === "https://example.com" && LEGACY_DEMO_PARTNER_NAMES.has(partner.name);
  const isLegacyNyuFixture =
    partner.name === "NYU CEC" && partner.logo_url === "/partners/nyu-entrepreneurship.svg";

  return isSeedFixture || isLegacyNyuFixture;
}

export const CONTENT_TABLES = [
  "events",
  "guests",
  "event_photos",
  "factories",
  "partners",
] as const;
export type ContentTable = (typeof CONTENT_TABLES)[number];

function contentQuery<T>(table: ContentTable) {
  return {
    queryKey: ["site-content", table] as const,
    queryFn: async (): Promise<T[]> => {
      const { data, error } = await supabase
        .from(table)
        .select("*")
        .order("sort_order", { ascending: true })
        .order("created_at", { ascending: true });
      if (error) throw error;
      return (data ?? []) as unknown as T[];
    },
    staleTime: 30_000,
  };
}

export function useEvents() {
  return useQuery(contentQuery<EventRow>("events"));
}
export function useGuests() {
  return useQuery(contentQuery<GuestRow>("guests"));
}
export function useEventPhotos() {
  return useQuery(contentQuery<PhotoRow>("event_photos"));
}
export function useFactories() {
  return useQuery(contentQuery<FactoryRow>("factories"));
}
export function usePartners() {
  return useQuery({
    ...contentQuery<PartnerRow>("partners"),
    select: (partners) => partners.filter((partner) => !isLegacyDemoPartner(partner)),
  });
}

export function useInvalidateContent() {
  const qc = useQueryClient();
  return (table: ContentTable) => qc.invalidateQueries({ queryKey: ["site-content", table] });
}
