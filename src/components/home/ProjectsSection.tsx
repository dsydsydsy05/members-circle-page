import { Link } from "@tanstack/react-router";
import { DoorSignal } from "@/components/BrandMark";
import type { CommunityProject } from "@/lib/use-projects";

const normalizeUrl = (url: string) => (/^https?:\/\//i.test(url) ? url : `https://${url}`);

export function ProjectsSection({ projects }: { projects: CommunityProject[] }) {
  if (!projects.length) return null;
  return (
    <section className="projects-section page-section" aria-labelledby="projects-title">
      <div className="page-shell">
        <div className="eyebrow">03 / Projects</div>
        <h2 id="projects-title" className="section-title mt-8">
          What’s being built.
        </h2>
        <div className="projects-list">
          {projects.slice(0, 3).map((project, index) => (
            <article key={project.id} className="project-feature reveal-in">
              <div className="project-feature__copy">
                <div>
                  <div className="eyebrow">Project / {String(index + 1).padStart(3, "0")}</div>
                  <h3>{project.name}</h3>
                  <p>Named in {project.builder}’s public member profile.</p>
                </div>
                <div>
                  <div className="project-feature__meta">
                    <span>
                      Built by member{" "}
                      {project.memberNo ? String(project.memberNo).padStart(3, "0") : "—"}
                    </span>
                    {project.context && <span>{project.context}</span>}
                    {project.tags.map((tag) => (
                      <span key={tag}>{tag}</span>
                    ))}
                  </div>
                  {project.website && (
                    <a
                      href={normalizeUrl(project.website)}
                      target="_blank"
                      rel="noreferrer"
                      className="text-link mt-8"
                    >
                      Visit project ↗
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
        <Link to="/projects" className="text-link mt-10">
          View all projects ↗
        </Link>
      </div>
    </section>
  );
}
