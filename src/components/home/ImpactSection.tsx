type Metric = { value: number; label: string };

export function ImpactSection({
  memberCount,
  eventCount,
  projectCount,
}: {
  memberCount: number;
  eventCount: number;
  projectCount: number;
}) {
  const metrics: Metric[] = [
    memberCount > 0 ? { value: memberCount, label: "Onboarded members / public profiles" } : null,
    projectCount > 0 ? { value: projectCount, label: "Projects named by members" } : null,
    eventCount > 0 ? { value: eventCount, label: "Events currently announced" } : null,
  ].filter((metric): metric is Metric => metric !== null);

  if (metrics.length === 0) return null;

  return (
    <section className="impact-section page-section" aria-labelledby="impact-title">
      <div className="page-shell">
        <div className="impact-head">
          <div>
            <div className="eyebrow">02 / What we’ve done</div>
            <h2 id="impact-title" className="section-title mt-8">
              Proof, not noise.
            </h2>
          </div>
          <p>Live counts from The Room’s current member and content systems. Nothing estimated.</p>
        </div>
        <div className="impact-grid reveal-in">
          {metrics.map((metric) => (
            <div key={metric.label} className="impact-item">
              <strong>{String(metric.value).padStart(2, "0")}</strong>
              <span>{metric.label}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
