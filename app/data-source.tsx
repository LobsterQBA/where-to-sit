export const primaryCinemaDataSource = {
  id: "where-to-sit-20260807",
  title: "Venue evidence list",
  author: "Where to Sit",
  versionDate: "2026-08-07",
  url: "https://github.com/LobsterQBA/where-to-sit/blob/main/app/cinema-inventory.json",
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
        {primaryCinemaDataSource.title}
      </a>
      <small>
        checked 2026-08-07 · coordinates ©{" "}
        <a href="https://www.openstreetmap.org/copyright" target="_blank" rel="noreferrer">
          OpenStreetMap contributors
        </a>
        {" "}· exact room geometry not yet verified
      </small>
    </p>
  );
}
