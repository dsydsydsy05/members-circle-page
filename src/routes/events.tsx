import { createFileRoute } from "@tanstack/react-router";
import { LightEventsPage } from "@/components/light/LightPublicPages";

export const Route = createFileRoute("/events")({
  head: () => ({
    meta: [
      { title: "Events · The Room" },
      {
        name: "description",
        content: "Dinners, guest conversations and private gatherings announced by The Room.",
      },
      { property: "og:title", content: "What happens in The Room" },
      { property: "og:description", content: "Real conversations. No stages, no slides." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://theroomcommunity.org/events" }],
  }),
  component: LightEventsPage,
});
