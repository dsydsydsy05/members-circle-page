import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { useMemo, useState } from "react";
import { MemberPortalShell } from "@/components/light/LightMemberPortal";
import { getFactoryImportFallback } from "@/lib/factory-list.functions";
import { useFactories } from "@/lib/use-site-content";

export const Route = createFileRoute("/resources")({
  head: () => ({
    meta: [
      { title: "Factory List · The Room" },
      {
        name: "description",
        content:
          "Members-only vetted factory & supplier list, sourced from the The Room community.",
      },
      { property: "og:title", content: "Factory List · The Room" },
      {
        property: "og:description",
        content: "Vetted factories and suppliers, contributed by members.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: ResourcesPage,
});

function ResourcesPage() {
  const [search, setSearch] = useState("");
  const { data: factories = [], isLoading: factoriesLoading } = useFactories();
  const verifiedFactories = factories.filter(
    (factory) => factory.name.trim() && !factory.website?.includes("example.com"),
  );
  const fallbackFn = useServerFn(getFactoryImportFallback);
  const { data: fallbackFactories = [], isLoading: fallbackLoading } = useQuery({
    queryKey: ["factory-import-fallback"],
    queryFn: () => fallbackFn({ data: undefined }),
    enabled: !factoriesLoading && verifiedFactories.length === 0,
    staleTime: Infinity,
  });
  const visibleFactories = verifiedFactories.length > 0 ? verifiedFactories : fallbackFactories;
  const filteredFactories = useMemo(() => {
    const query = search.trim().toLocaleLowerCase();
    if (!query) return visibleFactories;

    return visibleFactories.filter((factory) =>
      [
        factory.name,
        factory.category,
        factory.moq,
        factory.sample_time,
        factory.contact,
        factory.notes,
      ]
        .join(" ")
        .toLocaleLowerCase()
        .includes(query),
    );
  }, [search, visibleFactories]);
  const loading = factoriesLoading || (verifiedFactories.length === 0 && fallbackLoading);
  return (
    <MemberPortalShell className="portal-page">
      <main className="light-member-main mx-auto w-full max-w-[1720px] px-4 pb-16 pt-8 sm:px-8 sm:pt-10 xl:px-12">
        <div className="text-xs uppercase tracking-[0.22em] text-[#718f3e]">Members only</div>
        <h1 className="mt-2 text-4xl font-semibold tracking-tight sm:text-5xl">Factory List</h1>
        <p className="mt-3 max-w-2xl text-muted-foreground">
          A working list of factories, mills and workshops used and vouched for by members.
        </p>

        <div className="mt-10">
          {loading ? (
            <div className="border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              Loading factory list…
            </div>
          ) : visibleFactories.length === 0 ? (
            <div className="border border-dashed border-border p-10 text-center text-sm text-muted-foreground">
              No verified factories are currently published.
            </div>
          ) : (
            <div className="overflow-hidden rounded-[2rem] border border-black/10 bg-[#e9e8e3] p-2.5 shadow-[0_18px_60px_rgba(22,24,20,0.06)] sm:p-3">
              <div className="flex flex-col gap-3 px-3 pb-2.5 pt-1 sm:px-4 md:flex-row md:items-center md:justify-between">
                <span className="font-mono text-[10px] uppercase tracking-[0.2em] text-[#657e39]">
                  Supplier directory
                </span>
                <div className="flex w-full items-center gap-3 md:w-auto">
                  <label className="group flex min-w-0 flex-1 items-center gap-2 rounded-full border border-black/10 bg-[#f7f6f2] px-3.5 py-2 transition-colors focus-within:border-[#8ca855] focus-within:bg-white md:w-64 md:flex-none">
                    <span className="font-mono text-[10px] text-[#789744]" aria-hidden="true">
                      ⌕
                    </span>
                    <span className="sr-only">Search factory list</span>
                    <input
                      type="search"
                      value={search}
                      onChange={(event) => setSearch(event.target.value)}
                      placeholder="Search suppliers"
                      className="min-w-0 flex-1 bg-transparent font-mono text-[10px] tracking-[0.08em] text-black/70 outline-none placeholder:text-black/35"
                    />
                  </label>
                  <span className="shrink-0 font-mono text-[10px] uppercase tracking-[0.18em] text-black/45">
                    {String(filteredFactories.length).padStart(2, "0")} records
                  </span>
                </div>
              </div>

              {filteredFactories.length === 0 ? (
                <div className="rounded-[1.4rem] bg-[#f7f6f2] px-5 py-14 text-center font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">
                  No suppliers match “{search.trim()}”
                </div>
              ) : (
                <>
                  <div className="space-y-2 lg:hidden">
                    {filteredFactories.map((f, index) => (
                      <article key={f.id} className="rounded-[1.25rem] bg-[#f7f6f2] p-4">
                        <div className="flex items-start justify-between gap-4 border-b border-black/8 pb-3">
                          <div className="font-medium leading-snug text-black/90">
                            {f.website ? (
                              <a
                                href={f.website}
                                target="_blank"
                                rel="noreferrer"
                                className="decoration-[#91ad5c] underline-offset-4 hover:underline"
                              >
                                {f.name} <span className="text-[#789744]">↗</span>
                              </a>
                            ) : (
                              f.name
                            )}
                          </div>
                          <span className="shrink-0 font-mono text-[10px] text-[#789744]">
                            {String(index + 1).padStart(2, "0")}
                          </span>
                        </div>
                        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3 text-xs">
                          {[
                            ["Category", f.category],
                            ["MOQ", f.moq],
                            ["Sample time", f.sample_time],
                            ["Contact", f.contact],
                          ].map(([label, value]) => (
                            <div key={label} className="min-w-0">
                              <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-black/40">
                                {label}
                              </dt>
                              <dd className="mt-1 break-words leading-relaxed text-black/62">
                                {value || "—"}
                              </dd>
                            </div>
                          ))}
                          <div className="col-span-2">
                            <dt className="font-mono text-[9px] uppercase tracking-[0.14em] text-black/40">
                              Notes
                            </dt>
                            <dd className="mt-1 leading-relaxed text-black/55">{f.notes || "—"}</dd>
                          </div>
                        </dl>
                      </article>
                    ))}
                  </div>

                  <div className="hidden rounded-[1.4rem] lg:block">
                    <table className="w-full table-fixed border-separate border-spacing-x-0 border-spacing-y-1.5 text-sm">
                      <thead className="font-mono text-[10px] uppercase tracking-[0.16em] text-black/45">
                        <tr>
                          <th className="w-[4%] px-3 py-2 text-left font-normal">No.</th>
                          <th className="w-[17%] px-3 py-2 text-left font-normal">Name</th>
                          <th className="w-[16%] px-3 py-2 text-left font-normal">Category</th>
                          <th className="w-[9%] px-3 py-2 text-left font-normal">MOQ</th>
                          <th className="w-[13%] px-3 py-2 text-left font-normal">Sample time</th>
                          <th className="w-[17%] px-3 py-2 text-left font-normal">Contact</th>
                          <th className="w-[24%] px-3 py-2 text-left font-normal">Notes</th>
                        </tr>
                      </thead>
                      <tbody>
                        {filteredFactories.map((f, index) => (
                          <tr
                            key={f.id}
                            className="group transition-transform duration-200 ease-out hover:-translate-y-px"
                          >
                            <td className="rounded-l-[1.1rem] bg-[#f7f6f2] px-3 py-4 align-top font-mono text-[10px] text-[#789744] transition-colors duration-200 group-hover:bg-white">
                              {String(index + 1).padStart(2, "0")}
                            </td>
                            <td className="break-words bg-[#f7f6f2] px-3 py-4 align-top font-medium leading-snug text-black/90 transition-colors duration-200 group-hover:bg-white">
                              {f.website ? (
                                <a
                                  href={f.website}
                                  target="_blank"
                                  rel="noreferrer"
                                  className="inline-flex items-start gap-1.5 decoration-[#91ad5c] underline-offset-4 hover:underline"
                                >
                                  <span>{f.name}</span>
                                  <span className="mt-0.5 text-[10px] text-[#789744] transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5">
                                    ↗
                                  </span>
                                </a>
                              ) : (
                                f.name
                              )}
                            </td>
                            <td className="break-words bg-[#f7f6f2] px-3 py-4 align-top text-[12px] leading-relaxed text-black/58 transition-colors duration-200 group-hover:bg-white xl:text-[13px]">
                              {f.category || "—"}
                            </td>
                            <td className="break-words bg-[#f7f6f2] px-3 py-4 align-top font-mono text-[10px] leading-relaxed text-black/65 transition-colors duration-200 group-hover:bg-white xl:text-[11px]">
                              {f.moq || "—"}
                            </td>
                            <td className="break-words bg-[#f7f6f2] px-3 py-4 align-top text-[12px] leading-relaxed text-black/58 transition-colors duration-200 group-hover:bg-white xl:text-[13px]">
                              {f.sample_time || "—"}
                            </td>
                            <td className="break-words whitespace-pre-line bg-[#f7f6f2] px-3 py-4 align-top font-mono text-[9px] leading-relaxed text-black/58 transition-colors duration-200 group-hover:bg-white xl:text-[10px]">
                              {f.contact || "—"}
                            </td>
                            <td className="break-words rounded-r-[1.1rem] bg-[#f7f6f2] px-3 py-4 align-top text-[11px] leading-relaxed text-black/52 transition-colors duration-200 group-hover:bg-white xl:text-[12px]">
                              {f.notes || "—"}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </main>
    </MemberPortalShell>
  );
}
