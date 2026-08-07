"use client";

import Link from "next/link";
import {
  ArrowRight,
  CaretDown,
  Funnel,
  MagnifyingGlass,
  NavigationArrow,
} from "@phosphor-icons/react";
import { type CSSProperties, useEffect, useMemo, useState } from "react";
import {
  cinemaListings,
  haversineDistanceKm,
  type CinemaListing,
  type PremiumFormat,
} from "./cinema-inventory";
import {
  buildPinyinSearchIndex,
  matchesPinyinSearch,
} from "./search-utils.mjs";
import { DataSourceAttribution } from "./data-source";

type FormatFilter = "all" | PremiumFormat;
type UserLocation = { latitude: number; longitude: number };
type LocationStatus = "idle" | "locating" | "ready" | "denied" | "error";

const listScrollStorageKey = "where-to-sit-cinema-list-scroll-y";
const cinemaSearchIndexes = new Map(
  cinemaListings.map((cinema) => [
    cinema.id,
    buildPinyinSearchIndex(`${cinema.name} ${cinema.address}`),
  ]),
);

function formatLabel(format: PremiumFormat) {
  if (format === "Dolby Cinema") return "Dolby Cinema";
  if (format === "Other PLF") return "Premium large format";
  return "IMAX";
}

function getCinemaDistance(cinema: CinemaListing, location: UserLocation) {
  if (cinema.latitude === null || cinema.longitude === null) return null;
  return haversineDistanceKm(location, {
    latitude: cinema.latitude,
    longitude: cinema.longitude,
  });
}

function formatDistance(distanceKm: number) {
  const miles = distanceKm * 0.621371;
  return miles < 0.2 ? "Nearby" : `${miles.toFixed(miles < 10 ? 1 : 0)} mi`;
}

function CinemaRow({
  cinema,
  index,
  distance,
}: {
  cinema: CinemaListing;
  index: number;
  distance: number | null;
}) {
  const [isEntering, setIsEntering] = useState(false);
  const hall = cinema.featuredHall;
  const defaultHall =
    cinema.halls.find((item) => item.brand === "IMAX") ?? hall;

  return (
    <Link
      className={`cinema-result ${isEntering ? "is-entering" : ""}`}
      href={`/cinema/${defaultHall.id}`}
      aria-label={`View seats at ${cinema.name}`}
      aria-busy={isEntering}
      aria-disabled={isEntering}
      data-navigation-state={isEntering ? "loading" : "idle"}
      style={{ "--card-index": index } as CSSProperties}
      onClick={(event) => {
        if (isEntering) {
          event.preventDefault();
          return;
        }
        window.sessionStorage.setItem(
          listScrollStorageKey,
          String(window.scrollY),
        );
      }}
      onNavigate={() => setIsEntering(true)}
    >
      <div className="cinema-result-main">
        <div className="cinema-result-heading">
          <div>
            <div className="cinema-name-line">
              <h2>{cinema.name}</h2>
              {cinema.formats.map((format) => (
                <span className="format-tag" key={format}>
                  {formatLabel(format)}
                </span>
              ))}
            </div>
            <p>{cinema.address}</p>
          </div>
        </div>

        <div className="cinema-compact-meta">
          {distance !== null ? (
            <>
              <span className="cinema-distance">{formatDistance(distance)}</span>
              <i aria-hidden="true" />
            </>
          ) : null}
          <span>{hall.projection || hall.brand}</span>
          <i aria-hidden="true" />
          <span>
            {hall.width && hall.height
              ? `${hall.width.toFixed(1)} × ${hall.height.toFixed(1)} m screen`
              : "Estimated layout"}
          </span>
        </div>
      </div>

      <div className="cinema-result-action">
        <span
          className={`primary-link ${isEntering ? "is-loading" : ""}`}
          aria-hidden="true"
        >
          {isEntering ? (
            <>
              <span className="primary-link-spinner" aria-hidden="true" />
              <span>Entering</span>
            </>
          ) : (
            <>
              <span>View seats</span>
              <ArrowRight size={18} aria-hidden="true" />
            </>
          )}
        </span>
      </div>
    </Link>
  );
}

export function CinemaFinder() {
  const [formatFilter, setFormatFilter] = useState<FormatFilter>("all");
  const [query, setQuery] = useState("");
  const [userLocation, setUserLocation] = useState<UserLocation | null>(null);
  const [locationStatus, setLocationStatus] =
    useState<LocationStatus>("idle");

  const locateUser = () => {
    if (!("geolocation" in navigator)) {
      setLocationStatus("error");
      return;
    }

    setLocationStatus("locating");
    navigator.geolocation.getCurrentPosition(
      ({ coords }) => {
        setUserLocation({
          latitude: coords.latitude,
          longitude: coords.longitude,
        });
        setLocationStatus("ready");
      },
      (error) => {
        setLocationStatus(error.code === error.PERMISSION_DENIED ? "denied" : "error");
      },
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 },
    );
  };

  useEffect(() => {
    const savedScrollY = window.sessionStorage.getItem(listScrollStorageKey);
    if (savedScrollY === null) return;
    const scrollY = Number(savedScrollY);
    if (!Number.isFinite(scrollY)) {
      window.sessionStorage.removeItem(listScrollStorageKey);
      return;
    }

    const frame = window.requestAnimationFrame(() => {
      window.scrollTo({ top: scrollY, behavior: "auto" });
      window.sessionStorage.removeItem(listScrollStorageKey);
    });
    return () => window.cancelAnimationFrame(frame);
  }, []);

  const results = useMemo(
    () =>
      cinemaListings
        .filter(
          (cinema) =>
            formatFilter === "all" || cinema.formats.includes(formatFilter),
        )
        .filter((cinema) =>
          matchesPinyinSearch(
            cinemaSearchIndexes.get(cinema.id) ?? "",
            query,
          ),
        )
        .sort((left, right) => {
          if (userLocation) {
            return (
              (getCinemaDistance(left, userLocation) ?? Number.POSITIVE_INFINITY) -
              (getCinemaDistance(right, userLocation) ?? Number.POSITIVE_INFINITY)
            );
          }
          return (right.largestScreenArea ?? 0) - (left.largestScreenArea ?? 0);
        }),
    [formatFilter, query, userLocation],
  );

  return (
    <main className="finder-page">
      <section className="finder-intro">
        <div className="intro-copy">
          <span className="showtime-kicker"><i /> Seattle · IMAX</span>
          <h1>
            <span>See the view.</span>
            <em>Pick your seat.</em>
          </h1>
          <p>Seven theaters. One quick preview.</p>
        </div>

        <div className="concession-still-life" aria-hidden="true">
          <div className="concession-halo" />
          <div className="popcorn-box">
            <span /><span /><span /><span /><span /><span /><span />
            <i>WTS</i>
          </div>
          <div className="soda-cup"><span /><i>SEA</i></div>
          <div className="admit-ticket"><small>ADMIT ONE</small><strong>ROW · SEAT</strong></div>
          <div className="concession-star star-one">✦</div>
          <div className="concession-star star-two">✦</div>
        </div>
      </section>

      <section className="finder-workspace" aria-label="Seattle IMAX theaters">
        <div className="filter-bar minimal-filter-bar">
          <button
            className={`location-trigger ${locationStatus === "ready" ? "is-ready" : ""}`}
            type="button"
            onClick={locateUser}
            disabled={locationStatus === "locating"}
            aria-label="Use my location and sort theaters by distance"
          >
            <NavigationArrow size={18} weight={locationStatus === "ready" ? "fill" : "regular"} aria-hidden="true" />
            <span>
              <strong>
                {locationStatus === "locating"
                  ? "Locating…"
                  : locationStatus === "ready"
                    ? "Nearest first"
                    : "Near me"}
              </strong>
              {locationStatus === "denied" ? <small>Location blocked</small> : null}
              {locationStatus === "error" ? <small>Unavailable</small> : null}
            </span>
          </button>

          <div className="search-combobox">
            <label className="search-field">
              <MagnifyingGlass size={18} aria-hidden="true" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search theaters"
                aria-label="Search theaters"
              />
            </label>
          </div>

          <label className="format-field">
            <Funnel size={18} aria-hidden="true" />
            <select
              value={formatFilter}
              onChange={(event) =>
                setFormatFilter(event.target.value as FormatFilter)
              }
              aria-label="Format filter"
            >
              <option value="all">All formats</option>
              <option value="IMAX">IMAX</option>
              <option value="Dolby Cinema">Dolby Cinema</option>
              <option value="Other PLF">Premium large format</option>
            </select>
            <CaretDown className="select-caret" size={14} aria-hidden="true" />
          </label>
        </div>

        <div className="cinema-results">
          {results.length ? (
            results.map((cinema, index) => (
              <CinemaRow
                cinema={cinema}
                index={index}
                distance={userLocation ? getCinemaDistance(cinema, userLocation) : null}
                key={cinema.id}
              />
            ))
          ) : (
            <div className="empty-results" role="status">
              <MagnifyingGlass size={28} aria-hidden="true" />
              <strong>No theaters found</strong>
              <button
                type="button"
                onClick={() => {
                  setQuery("");
                  setFormatFilter("all");
                }}
              >
                Reset
              </button>
            </div>
          )}
        </div>

        <DataSourceAttribution compact />
      </section>
    </main>
  );
}
