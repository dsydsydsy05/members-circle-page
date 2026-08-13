import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/light/about")({
  beforeLoad: () => {
    throw redirect({ to: "/about", replace: true });
  },
});
