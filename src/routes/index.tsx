import { createFileRoute } from "@tanstack/react-router";
import { LightHome } from "@/components/light/LightHome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Room — A quieter place to build" },
      {
        name: "description",
        content: "A private community for founders, builders and people creating what’s next.",
      },
      { property: "og:title", content: "The Room — A quieter place to build" },
      { property: "og:description", content: "Join the room, now." },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theroomcommunity.org/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://theroomcommunity.org/" }],
  }),
  component: LightHome,
});
