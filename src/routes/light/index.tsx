import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/light/")({
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true });
  },
});
