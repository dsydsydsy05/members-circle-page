import { createFileRoute, redirect } from "@tanstack/react-router";

// The waitlist has closed; old links now lead to the membership application.
export const Route = createFileRoute("/waitlist")({
  beforeLoad: () => {
    throw redirect({ to: "/apply" });
  },
});
