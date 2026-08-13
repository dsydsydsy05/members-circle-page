import { createFileRoute, Outlet } from "@tanstack/react-router";

/** Compatibility subtree for old /light bookmarks. */
export const Route = createFileRoute("/light")({
  component: LightLayout,
});

function LightLayout() {
  return <Outlet />;
}
