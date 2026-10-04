import { createFileRoute } from "@tanstack/react-router";
import { LightPartnersPage } from "@/components/light/LightPublicPages";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
      { property: "og:title", content: "Ecosystem Partners · The Room" },
      {
        property: "og:description",
        content: "Sponsors and ecosystem partners supporting The Room founder community.",
      },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Ecosystem Partners · The Room" },
      {
        name: "description",
        content: "Sponsors and ecosystem partners supporting The Room founder community.",
      },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://theroomcommunity.org/partners" }],
  }),
  component: LightPartnersPage,
});
