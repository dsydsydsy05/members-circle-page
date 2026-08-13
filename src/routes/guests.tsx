import { createFileRoute } from "@tanstack/react-router";
import { LightGuestsPage } from "@/components/light/LightPublicPages";

export const Route = createFileRoute("/guests")({
  head: () => ({
    meta: [
      { title: "Conversations · The Room" },
      { name: "description", content: "Guests invited into The Room for specific conversations." },
    ],
    links: [{ rel: "canonical", href: "https://theroomcommunity.org/guests" }],
  }),
  component: LightGuestsPage,
});
