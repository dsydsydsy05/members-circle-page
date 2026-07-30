import { createFileRoute } from "@tanstack/react-router";
import { SiteNav, SiteFooter } from "@/components/SiteNav";
import { MemberGate } from "@/components/MemberGate";
import { useFactories } from "@/lib/use-site-content";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Factory List · The Room" },
      { name: "description", content: "Members-only vetted factory & supplier list, sourced from the The Room community." },
      { property: "og:title", content: "Factory List · The Room" },
      { property: "og:description", content: "Vetted factories and suppliers, contributed by members." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const { data: factories = [] } = useFactories();
  return (
    <div className="min-h-screen">
      <SiteNav />
      <main className="mx-auto max-w-5xl px-6 py-16">
        <div className="text-xs uppercase tracking-[0.22em] text-muted-foreground">Members only</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Factory List</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          A working list of factories, mills and workshops used and vouched for by members.
        </p>

        <div className="mt-10">
          <MemberGate title="Factory List">
            <div className="overflow-hidden rounded-2xl bg-card ring-1 ring-border">
              <table className="w-full text-sm">
                <thead className="bg-secondary text-xs uppercase tracking-wider text-muted-foreground">
                  <tr>
                    <th className="px-5 py-3 text-left">Name</th>
                    <th className="px-5 py-3 text-left">Category</th>
                    <th className="px-5 py-3 text-left">Location</th>
                    <th className="px-5 py-3 text-left">MOQ</th>
                    <th className="px-5 py-3 text-left">Notes</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {factories.map((f) => (
                    <tr key={f.id} className="hover:bg-secondary/40">
                      <td className="px-5 py-4 font-medium">
                        <a href={f.website ?? "#"} target="_blank" rel="noreferrer" className="hover:underline">{f.name}</a>
                      </td>
                      <td className="px-5 py-4 text-muted-foreground">{f.category}</td>
                      <td className="px-5 py-4 text-muted-foreground">{f.location}</td>
                      <td className="px-5 py-4 text-muted-foreground">{f.moq}</td>
                      <td className="px-5 py-4 text-muted-foreground">{f.notes}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </MemberGate>
        </div>
      </main>
      <SiteFooter />
    </div>
  );
}
