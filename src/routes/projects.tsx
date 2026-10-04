import { createFileRoute } from "@tanstack/react-router";
import { LightProjectsPage } from "@/components/light/LightPublicPages";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { property: "og:title", content: "Projects · The Room" },
      { property: "og:description", content: "What members of The Room are building." },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Projects · The Room" },
      { name: "description", content: "What members of The Room are building." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://theroomcommunity.org/projects" }],
  }),
  component: LightProjectsPage,
});
