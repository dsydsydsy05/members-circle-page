import { createFileRoute } from "@tanstack/react-router";
import { LightPartnersPage } from "@/components/light/LightPublicPages";

export const Route = createFileRoute("/partners")({
  head: () => ({
    meta: [
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
