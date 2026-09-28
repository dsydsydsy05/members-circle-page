import type { EventRow } from "./use-site-content";

// Development-only projection of the authored, pending event migrations.
// Keep remote rows (including the first dinner) intact. Stop projecting as soon
// as 20260928092000_event_schedule has been applied to the connected database.
const boston: EventRow = {
  id: "b0512026-0918-4000-8000-000000000002",
  slug: "boston-founder-dinner-2026-09-18",
  title: "Founder Dinner",
  date_label: "September 18, 2026",
  city: "Boston",
  status: "past",
  cover_url: "/images/events/boston-founder-dinner-cover-19.png",
  detail_image_url: "/images/events/boston-founder-dinner-photo.jpg",
  summary: "Your story before your company.",
  body: "Nineteen founders around one table, with one rule: we get into your story before we get into your company.\n\nThank you to Briar Group for providing the space at the Glass House.\n\nThe Room is a members-only community that curates a small room of founders every month, for people who would rather be in the RIGHT room than in EVERY room.",
  sort_order: -100,
  archive_number: 2,
  attendance_label: "19 founders",
  image_alt: "Founders sharing dinner around one table at the Glass House in Boston",
  cover_caption: null,
  cover_display: "poster",
};
const upcomingDates: Record<string, string> = {
  "The Room Opening: Our First Guest": "Oct 15",
  "How to Raise Funding": "Nov 15",
  "How to Take a Company Public": "Dec 15",
};

export function previewPendingEvents(events: EventRow[]): EventRow[] {
  const existingBoston = events.find((event) => event.slug === boston.slug);
  if (existingBoston?.archive_number === 2) return events;
  const rows = events.map((event) => {
    if (event.slug === boston.slug) return { ...event, ...boston, id: event.id };
    if (event.slug === "waic-2026-founders-dinner")
      return {
        ...event,
        archive_number: 1,
        attendance_label: "30 guests",
        cover_display: "poster" as const,
        image_alt: "Guests gathering at The Room founder dinner in Shanghai",
      };
    if (event.status === "upcoming" && upcomingDates[event.title]) {
      return { ...event, date_label: upcomingDates[event.title] };
    }
    return event;
  });
  if (!existingBoston) rows.push(boston);
  return rows.sort((a, b) => a.sort_order - b.sort_order);
}
