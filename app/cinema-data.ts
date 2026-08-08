import {
  cinemaListings,
  getCinemaListingByHallId,
  inventoryHalls,
  type InventoryHall,
} from "./cinema-inventory";
import seatLayoutsJson from "./seat-layouts.json";
import {
  getScreenDataAudit,
  type ScreenDataAudit,
} from "./screen-data-audit";

export type SeatStatus = "available" | "occupied";

export type Seat = {
  id: string;
  row: number;
  rowLabel: string;
  number: string;
  gridSlot: number;
  x: number;
  /** Finished floor elevation for this seating row. */
  y: number;
  z: number;
  status: SeatStatus;
};

type CapturedSeatLayout = {
  gridColumns: number;
  physicalSeats: number;
  inventorySeats: number | null;
  countMatchesInventory: boolean | null;
  hallName: string;
  capturedAt: string;
  sourceUrl: string;
  isPriority: boolean;
  priorityRank: number | null;
  priorityScore: number | null;
  rows: Array<{
    label: string;
    cells: Array<[seat: string, slot: number]>;
  }>;
};

const capturedSeatLayouts = seatLayoutsJson.layouts as unknown as Record<
  string,
  CapturedSeatLayout
>;

export type Auditorium = {
  id: string;
  cinemaId: string;
  name: string;
  format: string;
  screenWidth: number;
  screenHeight: number;
  screenBottom: number;
  screenZ: number;
  screenAspect: string;
  screenDataAudit: ScreenDataAudit | null;
  projectionTechnology: string;
  projectionDetails: string[];
  screenSurface: {
    name: string;
    gain: number;
    halfGainAngle: number;
    perforationMm: number;
    openAreaPercent: number;
    curvatureDepth: number;
  };
  rowCount: number;
  rowSpacing: number;
  rowRise: number;
  firstRowZ: number;
  rowSeatCounts: number[];
  seatingWidth: number;
  seatLayout: CapturedSeatLayout | null;
  sourceNote: string;
};

export type Cinema = {
  id: string;
  city: string;
  name: string;
  address: string;
  latitude: number | null;
  longitude: number | null;
};

export const cinemaSeatGeometry = {
  rowFloorBaseY: 0.4,
  centerGap: 0.9,
  centerSpacing: 0.82,
  cushionCenterAboveFloor: 0.37,
  cushionTopAboveFloor: 0.46,
  backCenterAboveFloor: 0.76,
  backrestReclineRadians: (16 * Math.PI) / 180,
  armrestAboveFloor: 0.65,
  seatedEyeHeightAboveCushion: 0.765,
} as const;

const estimatedRowSpacing = 1.2;
const estimatedFirstRowZ = -3.8;
const minimumFirstRowScreenDistance = 8;
const maximumFirstRowScreenDistance = 12;
const compactScreenWidth = 12;
const giantScreenWidth = 30;

function firstRowScreenDistance(screenWidth: number) {
  const widthProgress = Math.max(
    0,
    Math.min(
      1,
      (screenWidth - compactScreenWidth) /
        (giantScreenWidth - compactScreenWidth),
    ),
  );

  return (
    minimumFirstRowScreenDistance +
    widthProgress *
      (maximumFirstRowScreenDistance - minimumFirstRowScreenDistance)
  );
}

function approximateRows(hall: InventoryHall) {
  const screenWidth = hall.width ?? 18;
  const sourceSeats = hall.seats ?? 200;
  const rowCount = Math.max(8, Math.min(14, Math.round(sourceSeats / 22)));
  const maximumAcross = Math.max(
    14,
    Math.min(26, Math.round(screenWidth / 1.08)),
  );
  const averageAcross = Math.max(
    14,
    Math.min(maximumAcross, Math.round(sourceSeats / rowCount)),
  );

  return Array.from({ length: rowCount }, (_, row) => {
    const progression = Math.round((row / Math.max(rowCount - 1, 1)) * 4 - 2);
    const count = Math.max(12, Math.min(maximumAcross, averageAcross + progression));
    return count % 2 === 0 ? count : count + 1;
  });
}

function projectionDetails(hall: InventoryHall) {
  const details = [
    hall.projection || hall.brand,
    hall.ratio ? `${hall.ratio} screen ratio` : "Screen ratio unknown",
    hall.seats ? `${hall.seats} listed seats` : "Seat count unknown",
  ];

  if (hall.brand === "Dolby Cinema") {
    details.push("Dolby Atmos immersive audio");
  } else if (hall.brand === "IMAX") {
    details.push("IMAX sound system");
  } else {
    details.push("Premium large-format auditorium");
  }

  return details;
}

function hallToAuditorium(hall: InventoryHall): Auditorium {
  const cinema = getCinemaListingByHallId(hall.id);
  const screenWidth = hall.width ?? 18;
  const reportedAspectRatio = Number.parseFloat(hall.ratio.split(":")[0]);
  const estimatedAspectRatio = Number.isFinite(reportedAspectRatio)
    ? Math.max(reportedAspectRatio, 1.43)
    : 1.9;
  const screenHeight =
    hall.height ?? screenWidth / estimatedAspectRatio;
  const seatLayout = capturedSeatLayouts[hall.id] ?? null;
  const rowSeatCounts =
    seatLayout?.rows.map((row) => row.cells.length) ?? approximateRows(hall);
  const seatingColumns =
    seatLayout?.gridColumns ?? Math.max(...rowSeatCounts, 1);
  const seatingWidth =
    seatingColumns * cinemaSeatGeometry.centerSpacing +
    (seatLayout ? 0 : cinemaSeatGeometry.centerGap);
  const capturedCountNote =
    seatLayout && seatLayout.countMatchesInventory === false
      ? `; this captured layout contains ${seatLayout.physicalSeats} seats while the listed capacity is ${
          seatLayout.inventorySeats ?? "unknown"
        }`
      : "";
  const rowCount = rowSeatCounts.length;
  const estimatedFrontDistance = firstRowScreenDistance(screenWidth);

  return {
    id: hall.id,
    cinemaId: cinema?.id ?? `cinema-${hall.id}`,
    name:
      hall.brand === "Other PLF"
        ? "Premium large-format auditorium"
        : `${hall.brand} auditorium`,
    format: `${hall.brand} · ${hall.projection || "Projection unknown"}`,
    screenWidth,
    screenHeight,
    screenBottom: 1.5,
    screenZ: estimatedFirstRowZ - estimatedFrontDistance,
    screenAspect: hall.ratio || "Unknown ratio",
    screenDataAudit: getScreenDataAudit(hall),
    projectionTechnology: hall.projection || hall.brand,
    projectionDetails: projectionDetails(hall),
    screenSurface: {
      name: "Perforated high-gain screen (optical model)",
      gain: hall.brand === "IMAX" ? 1.4 : hall.brand === "Other PLF" ? 1.3 : 1.2,
      halfGainAngle: hall.brand === "IMAX" ? 85 : 90,
      perforationMm: 0.9,
      openAreaPercent: 4.16,
      curvatureDepth: Math.min(0.42, screenWidth / 90),
    },
    rowCount,
    rowSpacing: estimatedRowSpacing,
    rowRise: 0.48,
    firstRowZ: estimatedFirstRowZ,
    rowSeatCounts,
    seatingWidth,
    seatLayout,
    sourceNote: seatLayout
      ? `Screen and projection facts come from current public venue sources; seat slots come from a reusable captured layout${capturedCountNote}. Room depth, row spacing, elevation and viewing metrics remain geometric estimates.`
      : `Screen and projection facts come from current public venue sources. No reusable fixed seat plan is available, so this grid, room depth, row spacing, elevation and viewing metrics are illustrative estimates—not official auditorium geometry.`,
  };
}

export const cinemas: Cinema[] = cinemaListings.map((cinema) => ({
  id: cinema.id,
  city: cinema.city,
  name: cinema.name,
  address: cinema.address,
  latitude: cinema.latitude,
  longitude: cinema.longitude,
}));

export const auditoriums: Auditorium[] = inventoryHalls.map(hallToAuditorium);

export function getAuditoriumById(id: string) {
  const legacyId = id === "cnfm-imax" ? "hall-0019" : id;
  return auditoriums.find((auditorium) => auditorium.id === legacyId);
}

const occupiedSeatIds = new Set([
  "hall-0019-C-5",
  "hall-0019-C-6",
  "hall-0019-F-13",
  "hall-0019-G-3",
  "hall-0019-H-18",
]);

export function buildSeats(auditorium: Auditorium): Seat[] {
  if (auditorium.seatLayout) {
    const centerSlot = (auditorium.seatLayout.gridColumns + 1) / 2;

    return auditorium.seatLayout.rows.flatMap((layoutRow, row) =>
      layoutRow.cells.map(([seatNumber, gridSlot]) => {
        const id = `${auditorium.id}-${layoutRow.label}-${seatNumber}`;

        return {
          id,
          row,
          rowLabel: layoutRow.label,
          number: seatNumber,
          gridSlot,
          x:
            (gridSlot - centerSlot) *
            cinemaSeatGeometry.centerSpacing,
          y:
            cinemaSeatGeometry.rowFloorBaseY +
            row * auditorium.rowRise,
          z: auditorium.firstRowZ + row * auditorium.rowSpacing,
          status: "available",
        };
      }),
    );
  }

  return auditorium.rowSeatCounts.flatMap((count, row) => {
    const rowLabel = String.fromCharCode(65 + row);

    return Array.from({ length: count }, (_, index) => {
      const sideOffset =
        index < count / 2
          ? -cinemaSeatGeometry.centerGap / 2
          : cinemaSeatGeometry.centerGap / 2;
      const x =
        (index - (count - 1) / 2) * cinemaSeatGeometry.centerSpacing +
        sideOffset;
      const id = `${auditorium.id}-${rowLabel}-${index + 1}`;

      return {
        id,
        row,
        rowLabel,
        number: String(index + 1),
        gridSlot: index + 1,
        x,
        y:
          cinemaSeatGeometry.rowFloorBaseY +
          row * auditorium.rowRise,
        z: auditorium.firstRowZ + row * auditorium.rowSpacing,
        status: occupiedSeatIds.has(id) ? "occupied" : "available",
      };
    });
  });
}

export function getSeatEyeY(seat: Seat) {
  return (
    seat.y +
    cinemaSeatGeometry.cushionTopAboveFloor +
    cinemaSeatGeometry.seatedEyeHeightAboveCushion
  );
}

export function getSeatMetrics(auditorium: Auditorium, seat: Seat) {
  const eyeY = getSeatEyeY(seat);
  const screenCenterY = auditorium.screenBottom + auditorium.screenHeight / 2;
  const distance = Math.abs(seat.z - auditorium.screenZ);
  const horizontalFov =
    (2 * Math.atan(auditorium.screenWidth / (2 * distance)) * 180) / Math.PI;
  const verticalAngle =
    (Math.atan2(screenCenterY - eyeY, distance) * 180) / Math.PI;

  let verdict = "Balanced";
  let note = "The estimated screen share and elevation should feel natural for most films.";

  if (horizontalFov > 84) {
    verdict = "Maximum immersion";
    note = "The screen fills the estimated view; action feels intense and subtitles may take more scanning.";
  } else if (horizontalFov > 69) {
    verdict = "Immersive";
    note = "The estimated view feels enveloping while keeping most of the frame comfortable to scan.";
  } else if (horizontalFov < 47) {
    verdict = "Whole frame";
    note = "The full composition should be easier to read, with a more restrained sense of scale.";
  }

  if (Math.abs(seat.x) > auditorium.screenWidth * 0.3) {
    note = "This side position introduces a stronger estimated perspective shift for faces and subtitles.";
  }

  return {
    distance,
    horizontalFov,
    verticalAngle,
    verdict,
    note,
  };
}
