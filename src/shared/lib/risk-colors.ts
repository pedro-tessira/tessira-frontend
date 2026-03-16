/**
 * Risk-based color system.
 *
 * Core principle: Color = Risk Level, NOT usage/allocation.
 * Risk is derived from FREE CAPACITY (100% − Allocation).
 *
 * Free Capacity thresholds:
 *   > 40%  → Healthy  → Green  (success)
 *   20-40% → Acceptable → Yellow (warning)
 *   10-20% → Warning  → Orange (orange)
 *   < 10%  → High Risk → Red   (destructive)
 */

// ── Free Capacity Risk ──────────────────────────────────

export type RiskLevel = "healthy" | "acceptable" | "warning" | "critical";

/** Derive risk level from free capacity percentage */
export function freeCapacityRisk(freeCapacityPct: number): RiskLevel {
  if (freeCapacityPct > 40) return "healthy";
  if (freeCapacityPct >= 20) return "acceptable";
  if (freeCapacityPct >= 10) return "warning";
  return "critical";
}

/** Derive risk level from allocation percentage */
export function allocationRisk(allocationPct: number): RiskLevel {
  return freeCapacityRisk(100 - allocationPct);
}

// ── Risk → Color mapping (Tailwind classes) ─────────────

const RISK_TEXT: Record<RiskLevel, string> = {
  healthy: "text-success",
  acceptable: "text-warning",
  warning: "text-orange",
  critical: "text-destructive",
};

const RISK_BG: Record<RiskLevel, string> = {
  healthy: "bg-success",
  acceptable: "bg-warning",
  warning: "bg-orange",
  critical: "bg-destructive",
};

const RISK_BG_SUBTLE: Record<RiskLevel, string> = {
  healthy: "bg-success/10",
  acceptable: "bg-warning/10",
  warning: "bg-orange/10",
  critical: "bg-destructive/10",
};

const RISK_BORDER: Record<RiskLevel, string> = {
  healthy: "border-success/30",
  acceptable: "border-warning/30",
  warning: "border-orange/30",
  critical: "border-destructive/30",
};

const RISK_HSL: Record<RiskLevel, string> = {
  healthy: "hsl(var(--success))",
  acceptable: "hsl(var(--warning))",
  warning: "hsl(var(--orange))",
  critical: "hsl(var(--destructive))",
};

const RISK_LABEL: Record<RiskLevel, string> = {
  healthy: "Healthy",
  acceptable: "Acceptable",
  warning: "Warning",
  critical: "High Risk",
};

export function riskText(level: RiskLevel) { return RISK_TEXT[level]; }
export function riskBg(level: RiskLevel) { return RISK_BG[level]; }
export function riskBgSubtle(level: RiskLevel) { return RISK_BG_SUBTLE[level]; }
export function riskBorder(level: RiskLevel) { return RISK_BORDER[level]; }
export function riskHsl(level: RiskLevel) { return RISK_HSL[level]; }
export function riskLabel(level: RiskLevel) { return RISK_LABEL[level]; }

// ── Health Score Risk ───────────────────────────────────

export function healthScoreRisk(score: number, max = 10): RiskLevel {
  const pct = (score / max) * 100;
  if (pct >= 75) return "healthy";
  if (pct >= 55) return "acceptable";
  if (pct >= 35) return "warning";
  return "critical";
}

// ── Coverage / Knowledge Risk ───────────────────────────

export function coverageRisk(coveragePct: number): RiskLevel {
  if (coveragePct >= 75) return "healthy";
  if (coveragePct >= 55) return "acceptable";
  if (coveragePct >= 35) return "warning";
  return "critical";
}

export function spofRisk(spofCount: number): RiskLevel {
  if (spofCount === 0) return "healthy";
  if (spofCount === 1) return "warning";
  return "critical";
}

export function busFactorRisk(busFactor: number): RiskLevel {
  if (busFactor >= 3) return "healthy";
  if (busFactor >= 2) return "acceptable";
  return "critical";
}

// ── Delivery Risk ───────────────────────────────────────

export function deliveryRisk(riskScore: number): RiskLevel {
  if (riskScore >= 70) return "critical";
  if (riskScore >= 50) return "warning";
  if (riskScore >= 30) return "acceptable";
  return "healthy";
}

// ── Capacity Trend ──────────────────────────────────────

export function capacityTrendColor(direction: "up" | "down" | "stable"): string {
  if (direction === "up") return "text-orange"; // increasing load = subtle warning
  if (direction === "down") return "text-success"; // decreasing load = positive
  return "text-muted-foreground";
}
