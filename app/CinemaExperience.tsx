"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import {
  ArrowLeft,
  CaretDown,
  CaretLeft,
  CaretRight,
  CaretUp,
  Lightbulb,
  Pause,
  Play,
} from "@phosphor-icons/react";
import {
  useEffect,
  useMemo,
  useRef,
  useState,
  type CSSProperties,
} from "react";
import {
  auditoriums,
  buildSeats,
  cinemas,
  getAuditoriumById,
  getSeatMetrics,
  type Seat,
} from "./cinema-data";
import { DataSourceAttribution } from "./data-source";

const CinemaScene = dynamic(
  () => import("./CinemaScene").then((module) => module.CinemaScene),
  {
    ssr: false,
    loading: () => (
      <div className="scene-loading" role="status" aria-live="polite">
        <div className="scene-loading-screen" />
        <span>Building the auditorium</span>
      </div>
    ),
  },
);

const idleViewCommand = { yaw: 0, pitch: 0, token: 0 };
type MobilePanelTab = "seats" | "info";

function getPreferredAuditorium(initialAuditoriumId?: string) {
  const requestedAuditorium =
    getAuditoriumById(initialAuditoriumId ?? "") ?? auditoriums[0];

  return (
    auditoriums.find(
      (item) =>
        item.cinemaId === requestedAuditorium.cinemaId &&
        item.name.startsWith("IMAX"),
    ) ?? requestedAuditorium
  );
}

function getDefaultSeatId(auditoriumId: string) {
  const auditorium =
    auditoriums.find((item) => item.id === auditoriumId) ?? auditoriums[0];
  const seats = buildSeats(auditorium);
  const centerRow = Math.floor(auditorium.rowCount / 2);
  const centerSeat =
    seats
      .filter((seat) => seat.status === "available")
      .sort(
        (left, right) =>
          Math.abs(left.row - centerRow) * 2 +
          Math.abs(left.x) -
          (Math.abs(right.row - centerRow) * 2 + Math.abs(right.x)),
      )[0] ?? seats[0];

  return centerSeat.id;
}

export function CinemaExperience({
  initialAuditoriumId,
}: {
  initialAuditoriumId?: string;
}) {
  const initialAuditorium = getPreferredAuditorium(initialAuditoriumId);
  const [auditoriumId, setAuditoriumId] = useState(initialAuditorium.id);
  const [selectedSeatId, setSelectedSeatId] = useState(() =>
    getDefaultSeatId(initialAuditorium.id),
  );
  const [filmMode, setFilmMode] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [playbackToken, setPlaybackToken] = useState(0);
  const [isSeatPanelCollapsed, setIsSeatPanelCollapsed] = useState(false);
  const [isMobilePanelOpen, setIsMobilePanelOpen] = useState(false);
  const [mobilePanelTab, setMobilePanelTab] =
    useState<MobilePanelTab>("seats");
  const [isMobile, setIsMobile] = useState(false);
  const seatMapRef = useRef<HTMLDivElement>(null);

  const auditorium =
    auditoriums.find((item) => item.id === auditoriumId) ?? auditoriums[0];
  const cinema =
    cinemas.find((item) => item.id === auditorium.cinemaId) ?? cinemas[0];
  const cinemaAuditoriums = auditoriums.filter(
    (item) => item.cinemaId === cinema.id,
  );
  const seats = useMemo(() => buildSeats(auditorium), [auditorium]);
  const selectedSeat =
    seats.find((seat) => seat.id === selectedSeatId) ??
    seats.find((seat) => seat.id === getDefaultSeatId(auditorium.id)) ??
    seats[0];
  const metrics = getSeatMetrics(auditorium, selectedSeat);
  const lightActionLabel = filmMode ? "Turn lights on" : "Turn lights off";

  useEffect(() => {
    const mediaQuery = window.matchMedia("(max-width: 767px)");
    const update = () => {
      const nextIsMobile = mediaQuery.matches;
      setIsMobile(nextIsMobile);
      if (nextIsMobile) setIsSeatPanelCollapsed(false);
    };
    update();
    mediaQuery.addEventListener("change", update);
    return () => mediaQuery.removeEventListener("change", update);
  }, []);

  useEffect(() => {
    const frame = window.requestAnimationFrame(() => {
      const seatMap = seatMapRef.current;
      if (!seatMap) return;
      seatMap.scrollLeft = Math.max(
        0,
        (seatMap.scrollWidth - seatMap.clientWidth) / 2,
      );
    });
    return () => window.cancelAnimationFrame(frame);
  }, [auditorium.id, isMobilePanelOpen, mobilePanelTab]);

  const switchAuditorium = (nextAuditoriumId: string) => {
    setAuditoriumId(nextAuditoriumId);
    setSelectedSeatId(getDefaultSeatId(nextAuditoriumId));
  };

  const selectSeat = (seat: Seat) => {
    if (seat.status === "occupied") return;
    setSelectedSeatId(seat.id);
  };

  const toggleFilmMode = () => {
    const nextFilmMode = !filmMode;
    setFilmMode(nextFilmMode);
    setPlaying(nextFilmMode);
    if (nextFilmMode) setPlaybackToken((current) => current + 1);
  };

  const togglePlayback = () => {
    const nextPlaying = !playing;
    if (!filmMode) setFilmMode(true);
    setPlaying(nextPlaying);
    if (nextPlaying) setPlaybackToken((current) => current + 1);
  };

  const showMobilePanelTab = (tab: MobilePanelTab) => {
    setMobilePanelTab(tab);
    setIsMobilePanelOpen(true);
  };

  return (
    <main className="cinema-app" data-dbd-zone="cinema-shell">
      <header className="topbar" data-dbd-zone="cinema-topbar">
        <Link
          className="back-to-cinemas"
          href="/"
          aria-label={`Back to theater list. Current theater: ${cinema.city}, ${cinema.name}`}
        >
          <ArrowLeft size={20} />
          <strong>
            {cinema.city} · {cinema.name}
          </strong>
        </Link>

        <div className="snack-check" aria-hidden="true">
          <span className="snack-popcorn">●●●</span>
          <strong>SNACK CHECK</strong>
          <span className="snack-soda">▰</span>
        </div>

      </header>

      <section
        className={`experience-layout ${
          isSeatPanelCollapsed ? "is-panel-collapsed" : ""
        }`}
        data-dbd-zone="cinema-workspace"
      >
        <div className="scene-shell" data-dbd-zone="cinema-scene">
          <CinemaScene
            auditorium={auditorium}
            seats={seats}
            selectedSeat={selectedSeat}
            filmMode={filmMode}
            playing={playing}
            playbackToken={playbackToken}
            viewCommand={idleViewCommand}
            isMobile={isMobile}
          />

          <button
            className="scene-seat-status"
            type="button"
            onClick={() => showMobilePanelTab("seats")}
            aria-live="polite"
            aria-label={`Open seat map. Current position: row ${selectedSeat.rowLabel}, seat ${selectedSeat.number}`}
            aria-controls="mobile-seat-panel"
            aria-expanded={
              isMobile
                ? isMobilePanelOpen && mobilePanelTab === "seats"
                : undefined
            }
            tabIndex={isMobile ? 0 : -1}
          >
            Row {selectedSeat.rowLabel} · Seat {selectedSeat.number}
          </button>

          <div className="scene-controls">
            <button
              className="film-picker film-play-control"
              type="button"
              data-dbd-component="button"
              data-dbd-variant="secondary"
              data-dbd-pattern="film-player"
              onClick={togglePlayback}
              aria-pressed={playing}
              aria-label={`${playing ? "Pause preview" : "Play preview"}: Seattle test reel`}
              title={`${playing ? "Pause preview" : "Play preview"}: Seattle test reel`}
            >
              {playing ? (
                <Pause size={18} weight="fill" />
              ) : (
                <Play size={18} weight="fill" />
              )}
              <strong>
                {playing ? "Pause preview" : "Play preview"}: Seattle test reel
              </strong>
            </button>

            <button
              className={`scene-light-toggle ${filmMode ? "is-dark" : ""}`}
              type="button"
              data-dbd-component="button"
              data-dbd-variant="icon-only"
              onClick={toggleFilmMode}
              aria-pressed={filmMode}
              aria-label={lightActionLabel}
              title={lightActionLabel}
            >
              <Lightbulb
                size={20}
                weight={filmMode ? "regular" : "fill"}
                aria-hidden="true"
              />
            </button>
          </div>

          <p className="gesture-hint">Drag to look around; your viewpoint stays at the selected seat</p>
        </div>

        {isMobilePanelOpen ? (
          <button
            className="mobile-sheet-dismiss-layer"
            type="button"
            aria-label="Collapse auditorium panel"
            aria-controls="mobile-seat-panel"
            onClick={() => setIsMobilePanelOpen(false)}
          />
        ) : null}

        <aside
          className={`seat-panel ${
            isSeatPanelCollapsed ? "is-collapsed" : ""
          } ${isMobilePanelOpen ? "is-mobile-open" : ""} mobile-tab-${mobilePanelTab}`}
          aria-label="Seat selection and viewing metrics"
          data-dbd-zone="cinema-seat-panel"
          data-dbd-pattern="panel-sheet"
        >
          <div
            className="mobile-sheet-header"
            onClick={(event) => {
              if ((event.target as HTMLElement).closest("button")) return;
              setIsMobilePanelOpen((current) => !current);
            }}
          >
            <div className="mobile-sheet-tabs" role="tablist" aria-label="Auditorium panel">
              <button
                type="button"
                role="tab"
                aria-selected={mobilePanelTab === "seats"}
                aria-controls="mobile-seat-panel"
                className={mobilePanelTab === "seats" ? "is-selected" : ""}
                onClick={() => showMobilePanelTab("seats")}
              >
                Seats
              </button>
              <button
                type="button"
                role="tab"
                aria-selected={mobilePanelTab === "info"}
                aria-controls="mobile-info-panel"
                className={mobilePanelTab === "info" ? "is-selected" : ""}
                onClick={() => showMobilePanelTab("info")}
              >
                Theater info
              </button>
            </div>
            <button
              className="mobile-sheet-toggle"
              type="button"
              onClick={() => setIsMobilePanelOpen((current) => !current)}
              aria-expanded={isMobilePanelOpen}
              aria-label={isMobilePanelOpen ? "Collapse auditorium panel" : "Expand auditorium panel"}
            >
              {isMobilePanelOpen ? (
                <CaretDown size={18} />
              ) : (
                <CaretUp size={18} />
              )}
            </button>
          </div>

          <button
            className="panel-collapse-toggle"
            type="button"
            onClick={() => setIsSeatPanelCollapsed((current) => !current)}
            aria-expanded={!isSeatPanelCollapsed}
            aria-label={
              isSeatPanelCollapsed
                ? "Expand seat map and viewing metrics"
                : "Collapse seat map and viewing metrics"
            }
          >
            {isSeatPanelCollapsed ? (
              <CaretLeft size={18} />
            ) : (
              <CaretRight size={18} />
            )}
          </button>

          <div
            className="seat-panel-content"
            hidden={
              isSeatPanelCollapsed || (isMobile && !isMobilePanelOpen)
            }
          >
            <div
              className="panel-info-content"
              id="mobile-info-panel"
              role={isMobile ? "tabpanel" : undefined}
              hidden={isMobile && mobilePanelTab !== "info"}
            >
            <div className="auditorium-heading">
              <div className="auditorium-title-row">
                {cinemaAuditoriums.length > 1 ? (
                  <label
                    className="auditorium-title-switcher"
                    data-dbd-pattern="auditorium-switcher"
                  >
                    <select
                      aria-label="Switch auditorium"
                      value={auditorium.id}
                      onChange={(event) =>
                        switchAuditorium(event.target.value)
                      }
                    >
                      {cinemaAuditoriums.map((item) => (
                        <option key={item.id} value={item.id}>
                          {item.name}
                        </option>
                      ))}
                    </select>
                    <CaretDown
                      className="auditorium-title-caret"
                      size={16}
                      aria-hidden="true"
                    />
                  </label>
                ) : (
                  <h1>{auditorium.name}</h1>
                )}
                <span
                  className={`seat-layout-source-tag ${
                    auditorium.seatLayout ? "is-captured" : "is-estimated"
                  }`}
                  data-dbd-component="tag"
                  role="status"
                >
                  {auditorium.seatLayout ? "Verified seat layout" : "Estimated seat layout"}
                </span>
              </div>
            </div>

            <section
              className="technical-summary"
              aria-label="Auditorium technical data"
              data-dbd-pattern="technical-summary"
            >
              <div>
                <span className="technical-label-stack">
                  <span>Screen</span>
                  {auditorium.screenDataAudit ? (
                    <span
                      className={`screen-data-confidence is-${auditorium.screenDataAudit.status}`}
                      title={auditorium.screenDataAudit.note}
                      aria-label={`Screen-data confidence: ${auditorium.screenDataAudit.label}. ${auditorium.screenDataAudit.note}`}
                    >
                      {auditorium.screenDataAudit.label}
                    </span>
                  ) : null}
                </span>
                <strong>
                  {auditorium.screenWidth.toFixed(1)} ×{" "}
                  {auditorium.screenHeight.toFixed(1)} m
                </strong>
                <small>
                  {(auditorium.screenWidth * auditorium.screenHeight).toFixed(0)}
                  ㎡ · {auditorium.screenAspect}
                </small>
              </div>
              <div>
                <span>Projection</span>
                <strong>{auditorium.projectionTechnology}</strong>
                <small>{auditorium.projectionDetails.join(" / ")}</small>
              </div>
              <div className="screen-surface-spec">
                <span>Screen optical model</span>
                <strong>{auditorium.screenSurface.name}</strong>
                <small>
                  Gain {auditorium.screenSurface.gain.toFixed(1)} / half-gain angle{" "}
                  {auditorium.screenSurface.halfGainAngle}° / digital perforation{" "}
                  {auditorium.screenSurface.perforationMm.toFixed(1)} mm
                </small>
              </div>
            </section>
            <DataSourceAttribution compact />
            </div>

            <div
              className="panel-seat-content"
              id="mobile-seat-panel"
              role={isMobile ? "tabpanel" : undefined}
              hidden={isMobile && mobilePanelTab !== "seats"}
            >
            <div className="screen-key">
              <span>Screen</span>
              <small>{auditorium.screenAspect}</small>
            </div>

            <div
              ref={seatMapRef}
              className={[
                "seat-map",
                auditorium.rowCount >= 19
                  ? "is-ultra-dense"
                  : auditorium.rowCount >= 15
                    ? "is-dense"
                    : "",
              ]
                .filter(Boolean)
                .join(" ")}
              role="group"
              aria-label="Seat map"
            >
              {Array.from({ length: auditorium.rowCount }, (_, row) => {
                const rowSeats = seats.filter((seat) => seat.row === row);
                return (
                  <div className="seat-row" key={row}>
                    <span className="row-label">{rowSeats[0]?.rowLabel}</span>
                    <div
                      className={`seat-row-buttons ${
                        auditorium.seatLayout ? "has-captured-layout" : ""
                      }`}
                      style={
                        auditorium.seatLayout
                          ? ({
                              gridTemplateColumns: `repeat(${auditorium.seatLayout.gridColumns}, 9px)`,
                              minWidth: `${
                                auditorium.seatLayout.gridColumns * 12
                              }px`,
                            } satisfies CSSProperties)
                          : undefined
                      }
                    >
                      {rowSeats.map((seat, index) => (
                        <button
                          type="button"
                          key={seat.id}
                          className={[
                            "seat-button",
                            seat.id === selectedSeat.id ? "is-selected" : "",
                            seat.status === "occupied" ? "is-occupied" : "",
                            !auditorium.seatLayout &&
                            index === rowSeats.length / 2
                              ? "after-aisle"
                              : "",
                          ]
                            .filter(Boolean)
                            .join(" ")}
                          style={
                            auditorium.seatLayout
                              ? { gridColumn: seat.gridSlot }
                              : undefined
                          }
                          onClick={() => selectSeat(seat)}
                          disabled={seat.status === "occupied"}
                          aria-label={`Row ${seat.rowLabel}, seat ${seat.number}${
                            seat.status === "occupied" ? ", unavailable" : ""
                          }`}
                          aria-pressed={seat.id === selectedSeat.id}
                        />
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="seat-legend" aria-label="Legend">
              <span>
                <i className="legend-available" /> Available
              </span>
              <span>
                <i className="legend-selected" /> Current
              </span>
              <span>
                <i className="legend-occupied" /> Unavailable
              </span>
            </div>

            <section
              className="seat-reading"
              data-dbd-pattern="seat-metrics"
            >
              <div className="reading-title">
                <span>
                  Row {selectedSeat.rowLabel} · Seat {selectedSeat.number}
                </span>
                <strong>{metrics.verdict}</strong>
              </div>
              <dl>
                <div>
                  <dt>Horizontal view</dt>
                  <dd>{metrics.horizontalFov.toFixed(0)}°</dd>
                </div>
                <div>
                  <dt>Elevation</dt>
                  <dd>{metrics.verticalAngle.toFixed(0)}°</dd>
                </div>
                <div>
                  <dt>Screen distance</dt>
                  <dd>{metrics.distance.toFixed(1)} m</dd>
                </div>
              </dl>
            </section>
            </div>

            <p
              className="data-note panel-info-note"
              hidden={isMobile && mobilePanelTab !== "info"}
              title={`Model note: ${auditorium.sourceNote} Metrics are geometric estimates.`}
            >
              Model note: {auditorium.sourceNote} Metrics are geometric estimates.
            </p>
          </div>
        </aside>
      </section>
    </main>
  );
}
