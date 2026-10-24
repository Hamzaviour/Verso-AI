import type { Claim, ClaimStatus } from "./types";

const SIDE = 0.18;

// Agreement is computed, not asked for: the model only attributes claims to
// articles; where those articles sit on the spectrum decides the status.
export function classifyClaim(
  supportBias: number[],
  contradictCount: number,
  totalOutlets: number,
): ClaimStatus {
  if (contradictCount > 0) return "contested";
  const left = supportBias.filter((b) => b <= -SIDE).length;
  const right = supportBias.filter((b) => b >= SIDE).length;
  const n = supportBias.length;
  if ((left > 0 && right > 0) || (n >= 3 && n / totalOutlets >= 0.5)) return "agreed";
  if (left > 0 && right === 0 && n === left) return "one-sided-left";
  if (right > 0 && left === 0 && n === right) return "one-sided-right";
  return "partial";
}

export const STATUS_ORDER: ClaimStatus[] = [
  "agreed",
  "partial",
  "one-sided-left",
  "one-sided-right",
  "contested",
];

export function groupClaims(claims: Claim[]) {
  return {
    agreed: claims.filter((c) => c.status === "agreed"),
    partial: claims.filter((c) => c.status === "partial"),
    left: claims.filter((c) => c.status === "one-sided-left"),
    right: claims.filter((c) => c.status === "one-sided-right"),
    contested: claims.filter((c) => c.status === "contested"),
  };
}
