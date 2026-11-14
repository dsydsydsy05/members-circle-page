import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/challenge")({
  beforeLoad: () => {
    throw redirect({ to: "/", replace: true });
  },
});
