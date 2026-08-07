import auditJson from "./screen-data-audit.json";
import type { InventoryHall } from "./cinema-inventory";

export type ScreenDataConfidence = "high" | "medium" | "low";
export type ScreenDataVerification =
  | "verified"
  | "version_consistent"
  | "needs_review"
  | "conflict";

export type ScreenDataAudit = {
  checkedAt: string;
  confidence: ScreenDataConfidence;
  status: ScreenDataVerification;
  label: string;
  note: string;
  referenceWidth: number;
  referenceHeight: number;
  areaDifferencePercent: number;
  sources: string[];
};

type AuditOverride = {
  confidence: ScreenDataConfidence;
  status: ScreenDataVerification;
  label: string;
  note: string;
  sources: string[];
};

const measurements = auditJson.measurements as unknown as Record<
  string,
  [width: number, height: number]
>;
const overrides = auditJson.overrides as unknown as Record<
  string,
  AuditOverride
>;

function genericAssessment(areaDifferencePercent: number) {
  if (areaDifferencePercent <= 1) {
    return {
      confidence: "medium" as const,
      status: "version_consistent" as const,
      label: "Medium confidence",
      note:
        "Two public measurements differ by no more than 1% in area, but no independent official geometry is available.",
    };
  }

  if (areaDifferencePercent <= 5) {
    return {
      confidence: "low" as const,
      status: "needs_review" as const,
      label: "Needs review",
      note:
        "Public measurements differ by 1–5% in area and require venue documentation or an on-site measurement.",
    };
  }

  return {
    confidence: "low" as const,
    status: "conflict" as const,
    label: "Conflicting data",
    note:
      "Public measurements differ by more than 5% in area and should not be treated as precise without venue documentation.",
  };
}

export function getScreenDataAudit(
  hall: InventoryHall,
): ScreenDataAudit | null {
  const reference = measurements[hall.id];
  if (!reference || !hall.width || !hall.height) return null;

  const [referenceWidth, referenceHeight] = reference;
  const currentArea = hall.width * hall.height;
  const referenceArea = referenceWidth * referenceHeight;
  const areaDifferencePercent = Math.abs(
    ((currentArea - referenceArea) / referenceArea) * 100,
  );
  const assessment = overrides[hall.id] ?? genericAssessment(areaDifferencePercent);

  return {
    checkedAt: auditJson.checkedAt,
    confidence: assessment.confidence,
    status: assessment.status,
    label: assessment.label,
    note: assessment.note,
    referenceWidth,
    referenceHeight,
    areaDifferencePercent,
    sources: "sources" in assessment ? assessment.sources : [],
  };
}
