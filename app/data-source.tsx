export const primaryCinemaDataSource = {
  id: "where-to-sit-20260803",
  title: "Seattle IMAX simulability audit",
  author: "Where to Sit",
  versionDate: "2026-08-03",
  url: "https://pacificsciencecenter.org/visit/imax/",
} as const;

export function DataSourceAttribution({
  compact = false,
}: {
  compact?: boolean;
}) {
  return (
    <p
      className={`source-attribution ${compact ? "is-compact" : ""}`}
      data-dbd-component="data-source-attribution"
    >
      <span>Evidence basis</span>
      <a
        href={primaryCinemaDataSource.url}
        target="_blank"
        rel="noreferrer"
      >
        Official venue pages + {primaryCinemaDataSource.title}
      </a>
      <small>checked 2026-08-03 · exact room geometry not yet verified</small>
    </p>
  );
}
