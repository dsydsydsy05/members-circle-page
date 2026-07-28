import { useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { guests } from "@/lib/community-data";

export const Route = createFileRoute("/guests")({
  head: () => ({
    meta: [
      { title: "Guests · The Room" },
      { name: "description", content: "Founders and operators we've hosted at The Room events." },
      { property: "og:title", content: "Guests · The Room" },
      { property: "og:description", content: "Fireside chats, closed Q&As, and workshops with our guests." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: GuestsPage,
});

function GuestsPage() {
  const [active, setActive] = useState<string | null>(null);

  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-4xl px-6 py-16">
        <div className="text-xs uppercase tracking-[0.22em] text-primary">Guests</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">
          People we've <span className="text-primary">hosted</span>
        </h1>
        <p className="mt-3 text-muted-foreground">
          Small-format conversations with people we admire. No stages, no slides.
        </p>

        <ul className="mt-10 divide-y divide-border overflow-hidden rounded-2xl bg-card ring-1 ring-border">
          {guests.map((g) => {
            const on = active === g.id;
            return (
              <li
                key={g.id}
                className={`grid grid-cols-1 gap-2 px-6 py-5 transition-colors sm:grid-cols-[1fr_auto] sm:items-center ${
                  on ? "bg-primary/5" : ""
                }`}
              >
                <div className="flex items-center gap-3">
                  <span
                    className={`h-6 w-[3px] rounded-full transition-colors ${on ? "bg-primary" : "bg-transparent"}`}
                    aria-hidden
                  />
                  <div>
                    <button
                      type="button"
                      aria-pressed={on}
                      onClick={() => setActive(on ? null : g.id)}
                      className={`text-left text-lg font-semibold tracking-tight transition-colors hover:text-primary ${
                        on ? "text-primary" : ""
                      }`}
                    >
                      {g.name}
                    </button>
                    <div className="text-sm text-muted-foreground">{g.title}</div>
                  </div>
                </div>
                <div className="text-right sm:pl-6">
                  <div className={`text-sm transition-colors ${on ? "text-primary" : ""}`}>{g.event}</div>
                  <div className="text-xs text-muted-foreground">{g.date}</div>
                </div>
              </li>
            );
          })}
        </ul>
      </main>
      <SiteFooter />
    </div>
  );
}
