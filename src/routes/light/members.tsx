import { createFileRoute } from "@tanstack/react-router";
import { LightMembersPage } from "@/components/light/LightMembersPage";

export const Route = createFileRoute("/light/members")({
  head: () => ({
    meta: [
      { title: "Members — The Room" },
      {
        name: "description",
        content: "Meet the founders, builders and people in The Room.",
      },
    ],
  }),
  component: LightMembersPage,
});
