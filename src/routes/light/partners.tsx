import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/light/partners")({
  beforeLoad: () => {
    throw redirect({ to: "/partners", replace: true });
  },
});
