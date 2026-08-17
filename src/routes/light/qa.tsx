import { createFileRoute, redirect } from "@tanstack/react-router";

export const Route = createFileRoute("/light/qa")({
  beforeLoad: () => {
    throw redirect({ to: "/qa", replace: true });
  },
});
