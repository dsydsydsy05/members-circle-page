import { createFileRoute } from "@tanstack/react-router";
import { LightMembersPage } from "@/components/light/LightMembersPage";

export const Route = createFileRoute("/light/members")({
  head: () => ({
    meta: [
      { property: "og:title", content: "Members — The Room" },
      {
        property: "og:description",
        content: "Meet the founders, builders and people in The Room.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { title: "Members — The Room" },
      {
        name: "description",
        content: "Meet the founders, builders and people in The Room.",
      },
    ],
  }),
  component: LightMembersPage,
});
