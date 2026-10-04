import { createFileRoute } from "@tanstack/react-router";
import { LightQAPage } from "@/components/light/LightQAPage";

export const Route = createFileRoute("/qa")({
  head: () => ({
    meta: [
      { title: "Q&A · The Room" },
      {
        name: "description",
        content: "Anonymous founder questions answered by guests and The Room team.",
      },
      { property: "og:title", content: "Questions worth asking · The Room" },
      { property: "og:type", content: "website" },
      { property: "og:description", content: "Anonymous questions and conversations with The Room community." },
      { name: "twitter:card", content: "summary_large_image" },
    ],
    links: [{ rel: "canonical", href: "https://theroomcommunity.org/qa" }],
  }),
  component: LightQAPage,
});
