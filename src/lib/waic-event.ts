import type { EventRow } from "@/lib/use-site-content";

export const WAIC_EVENT_SLUG = "waic-2026-founders-dinner";

export const waicPastEvent: EventRow = {
  id: "7a1c2026-0718-4d1e-9a1c-202607180001",
  slug: WAIC_EVENT_SLUG,
  title: "WAIC 2026 Founder’s Dinner",
  date_label: "July 18, 2026",
  city: "Shanghai, China",
  status: "past",
  cover_url: "/images/events/waic-founders-dinner-cover.png",
  detail_image_url: "/images/events/waic-founders-dinner-detail.jpg",
  summary:
    "Thirty founders, investors, and researchers gathered for a candid evening during WAIC week.",
  body: `SHANGHAI — July 18, 2026 — During the World Artificial Intelligence Conference (WAIC), the room had the privilege of hosting an invitation-only Founder's Dinner, bringing together 30 accomplished founders, investors, and researchers from across the AI ecosystem. We were humbled by the response: nearly 400 applications came in for just 30 seats, and narrowing the list down was genuinely difficult — a reflection, we believe, not of the room itself, but of how much this community values candid, high-quality conversation during WAIC week.

The evening's guests represented a remarkable range of backgrounds and achievements. Among them were senior executives from leading global technology companies, including one from a formerly NYSE-listed enterprise; PhD researchers from Tsinghua University's top AI labs; partners from top-tier investment institutions; influential technology creators; LP investors backing leading venture capital funds; current leaders of established family businesses; and one of the world's youngest founders to bring a product into clinical trials.

At the room, our aim has always been simple: to create spaces where exceptional people can speak openly and learn from one another. We're grateful to everyone who applied and attended — more than the credentials at the table, what made the evening special was the openness of the conversations, and we hope to carry that spirit into future gatherings hosted by the room.`,
  sort_order: 1,
};

export function includeWaicPastEvent(events: EventRow[]) {
  const match = events.find(
    (event) =>
      event.slug === WAIC_EVENT_SLUG || event.title.toLowerCase().includes("waic 2026 founder"),
  );

  if (!match) return [...events, waicPastEvent];

  return events.map((event) =>
    event.id === match.id
      ? {
          ...waicPastEvent,
          ...event,
          slug: event.slug || waicPastEvent.slug,
          cover_url: event.cover_url || waicPastEvent.cover_url,
          detail_image_url: event.detail_image_url || waicPastEvent.detail_image_url,
          summary: event.summary || waicPastEvent.summary,
          body: event.body || waicPastEvent.body,
        }
      : event,
  );
}
