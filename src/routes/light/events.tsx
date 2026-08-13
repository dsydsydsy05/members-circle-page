import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/light/events")({
  beforeLoad: () => {
    throw redirect({ to: "/events", replace: true });
  },
});
