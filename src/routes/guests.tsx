import { createFileRoute } from "@tanstack/react-router";
import { LightGuestsPage } from "@/components/light/LightPublicPages";

export const Route = createFileRoute("/guests")({
  head: () => ({
    meta: [
      { property: "og:title", content: "Conversations · The Room" },
      {
        property: "og:description",
        content: "Guests invited into The Room for specific conversations.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Conversations · The Room" },
      { name: "description", content: "Guests invited into The Room for specific conversations." },
    ],
    links: [{ rel: "canonical", href: "https://theroomcommunity.org/guests" }],
  }),
  component: LightGuestsPage,
});
