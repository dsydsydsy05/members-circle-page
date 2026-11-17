import { createFileRoute } from "@tanstack/react-router";
import { LightHome } from "@/components/light/LightHome";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "The Room — Be in the right room" },
      {
        name: "description",
        content: "A community for founders, builders and people creating what’s next.",
      },
      { property: "og:title", content: "The Room — Be in the right room" },
      {
        property: "og:description",
        content: "A community for founders, builders and people creating what’s next.",
      },
      { property: "og:type", content: "website" },
      { property: "og:url", content: "https://theroomcommunity.org/" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [
      { rel: "canonical", href: "https://theroomcommunity.org/" },
      // Lettering for the S27 card covers, matching the program pages.
      {
        rel: "stylesheet",
        href: "https://fonts.googleapis.com/css2?family=Della+Respira&family=VT323&display=swap",
      },
    ],
  }),
  component: LightHome,
});
