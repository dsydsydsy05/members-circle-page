import { useMemo, useState } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { SiteFooter, SiteNav } from "@/components/SiteNav";
import { DoorSignal } from "@/components/BrandMark";
import { useCommunityMembers } from "@/lib/use-community-members";
import { projectsFromMembers } from "@/lib/use-projects";

export const Route = createFileRoute("/projects")({
  head: () => ({
    meta: [
      { title: "Projects · The Room" },
      { name: "description", content: "Projects named in public profiles by members of The Room." },
      { property: "og:title", content: "Built in The Room" },
      { property: "og:description", content: "What members are building now." },
      { property: "og:type", content: "website" },
    ],
    links: [{ rel: "canonical", href: "https://theroomcommunity.org/projects" }],
  }),
  component: ProjectsPage,
});

function ProjectsPage() {
  const { members, loading } = useCommunityMembers();
  const projects = projectsFromMembers(members);
  const tags = useMemo(
    () => Array.from(new Set(projects.flatMap((project) => project.tags))).slice(0, 6),
    [projects],
  );
  const [filter, setFilter] = useState("All");
  const visible =
    filter === "All" ? projects : projects.filter((project) => project.tags.includes(filter));

  return (
    <div className="depth-page">
      <SiteNav tone="light" />
      <main>
        <header className="depth-hero">
          <div className="page-shell depth-hero__grid">
            <div className="eyebrow">Projects / Public</div>
            <div className="depth-hero__main">
              <h1 className="section-title">Built in the room.</h1>
              <p>
                Only projects members have named in their public profiles appear here. Family
                Business remains available inside Member Space.
              </p>
            </div>
          </div>
        </header>
        <section className="page-section">
          <div className="page-shell">
            {tags.length > 0 && (
              <div
                className="flex flex-wrap gap-2 border-b border-black/20 pb-5"
                aria-label="Filter projects"
              >
                {["All", ...tags].map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setFilter(tag)}
                    aria-pressed={filter === tag}
                    className={`min-h-11 border px-4 text-[10px] font-semibold uppercase tracking-[.14em] ${filter === tag ? "border-[var(--signal)] bg-[var(--signal)]" : "border-black/20"}`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}
            {loading ? (
              <p className="empty-truth">Loading public projects…</p>
            ) : visible.length === 0 ? (
              <p className="empty-truth">No public project profiles match this view.</p>
            ) : (
              <div className="projects-list mt-0">
                {visible.map((project, index) => (
                  <article key={project.id} className="project-feature">
                    <div className="project-feature__copy">
                      <div>
                        <div className="eyebrow">
                          Project / {String(index + 1).padStart(3, "0")}
                        </div>
                        <h2 className="mt-8 text-[clamp(3rem,7vw,8rem)] font-medium uppercase leading-[.82] tracking-[-.07em]">
                          {project.name}
                        </h2>
                        <p className="mt-6">Publicly named by {project.builder}.</p>
                      </div>
                      <div>
                        <div className="project-feature__meta">
                          <span>
                            Member{" "}
                            {project.memberNo ? String(project.memberNo).padStart(3, "0") : "—"}
                          </span>
                          {project.context && <span>{project.context}</span>}
                          {project.tags.map((tag) => (
                            <span key={tag}>{tag}</span>
                          ))}
                        </div>
                        {project.website && (
                          <a
                            href={
                              /^https?:\/\//i.test(project.website)
                                ? project.website
                                : `https://${project.website}`
                            }
                            target="_blank"
                            rel="noreferrer"
                            className="text-link mt-8"
                          >
                            Project website ↗
                          </a>
                        )}
                      </div>
                    </div>
                    <div className="project-artifact" aria-hidden="true">
                      <div className="project-artifact__grid" />
                      <DoorSignal />
                      <div className="project-artifact__word">{project.name}</div>
                    </div>
                  </article>
                ))}
              </div>
            )}
          </div>
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
