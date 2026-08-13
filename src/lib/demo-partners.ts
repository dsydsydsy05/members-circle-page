export type DemoPartner = {
  id: string;
  name: string;
  tier: string;
  blurb: string;
  logo_url: string;
  url: string;
  isDemo: true;
};

/**
 * Visual-only sponsor examples. These records never touch Supabase and can be
 * removed as soon as real partner records are ready.
 */
export const DEMO_PARTNERS: DemoPartner[] = [
  {
    id: "demo-apple",
    name: "Apple",
    tier: "Visual demo",
    blurb: "Example placement for a globally recognized technology brand.",
    logo_url: "/partners/demo/apple.svg",
    url: "https://www.apple.com/",
    isDemo: true,
  },
  {
    id: "demo-nvidia",
    name: "NVIDIA",
    tier: "Visual demo",
    blurb: "Example placement for computing, AI, and founder infrastructure.",
    logo_url: "/partners/demo/nvidia.svg",
    url: "https://www.nvidia.com/",
    isDemo: true,
  },
  {
    id: "demo-stripe",
    name: "Stripe",
    tier: "Visual demo",
    blurb: "Example placement for financial tools used by emerging companies.",
    logo_url: "/partners/demo/stripe.svg",
    url: "https://stripe.com/",
    isDemo: true,
  },
  {
    id: "demo-shopify",
    name: "Shopify",
    tier: "Visual demo",
    blurb: "Example placement for commerce and independent business builders.",
    logo_url: "/partners/demo/shopify.svg",
    url: "https://www.shopify.com/",
    isDemo: true,
  },
];

export function isDemoPartner(partner: { id: string }) {
  return partner.id.startsWith("demo-");
}
