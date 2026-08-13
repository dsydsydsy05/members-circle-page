import { createFileRoute } from "@tanstack/react-router";
import { LightAboutPage } from "@/components/light/LightPublicPages";

export const Route = createFileRoute("/about")({
  head: () => ({
    meta: [
      { title: "About · The Room" },
      { name: "description", content: "The Room is a founder community born in Boston in 2026." },
      { property: "og:title", content: "About · The Room" },
      {
        property: "og:description",
        content: "Founders don’t need more noise. They need the right room.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://theroomcommunity.org/about" }],
  }),
  component: LightAboutPage,
});
