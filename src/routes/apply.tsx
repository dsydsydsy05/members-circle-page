import { createFileRoute, redirect } from "@tanstack/react-router";
import { supabase } from "@/integrations/supabase/client";

export const Route = createFileRoute("/apply")({
  ssr: false,
  head: () => ({
    meta: [
      { title: "Apply for membership · The Room" },
      {
        name: "description",
        content: "Create an account and apply to become a member of The Room.",
      },
      { property: "og:title", content: "Apply for membership · The Room" },
      { property: "og:description", content: "Applications to The Room are reviewed by our team." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  beforeLoad: async () => {
    const { data } = await supabase.auth.getUser();
    if (data.user) throw redirect({ to: "/onboarding" });
    throw redirect({ to: "/auth", search: { mode: "signup", next: "/onboarding" } });
  },
});
