import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/light/guests")({
  beforeLoad: () => {
    throw redirect({ to: "/guests", replace: true });
  },
});
