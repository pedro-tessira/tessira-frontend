/**
 * Risk-based color system for Signals decision engine.
 *
 * Three separate color scales for different signal dimensions:
 *
 * ALLOCATION (utilization band):
 *   < 60%   → Red    (underutilized)
 *   60–85%  → Green  (healthy)
 *   85–95%  → Yellow (high)
 *   > 95%   → Red    (overloaded)
 *
 * COVERAGE (knowledge depth):
 *   < 60%   → Red
 *   60–75%  → Yellow
 *   ≥ 75%   → Green
 *
 * SPOF (single-point-of-failure):
 *   ≥ 3     → Red
 *   1–2     → Yellow
 *   0       → Green
 */

// ── Generic Risk Level ──────────────────────────────────

export type RiskLevel = "healthy" | "acceptable" | "warning" | "critical";

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

// ── Allocation Risk (band-based) ───────────────────────
// <60% → critical (underutilized), 60-85% → healthy, 85-95% → warning, >95% → critical (overloaded)

export function allocationRisk(allocationPct: number): RiskLevel {
  if (allocationPct < 60) return "critical";
  if (allocationPct <= 85) return "healthy";
  if (allocationPct <= 95) return "warning";
  return "critical";
}

/** Free capacity risk (legacy compat) — derived from allocation */
export function freeCapacityRisk(freeCapacityPct: number): RiskLevel {
  return allocationRisk(100 - freeCapacityPct);
}

// ── Coverage Risk ──────────────────────────────────────
// <60% → critical, 60-75% → warning, ≥75% → healthy

export function coverageRisk(coveragePct: number): RiskLevel {
  if (coveragePct >= 75) return "healthy";
  if (coveragePct >= 60) return "warning";
  return "critical";
}

// ── SPOF Risk ──────────────────────────────────────────
// 0 → healthy, 1-2 → warning, ≥3 → critical

export function spofRisk(spofCount: number): RiskLevel {
  if (spofCount === 0) return "healthy";
  if (spofCount <= 2) return "warning";
  return "critical";
}

// ── Health Score Risk ──────────────────────────────────

export function healthScoreRisk(score: number, max = 10): RiskLevel {
  const pct = (score / max) * 100;
  if (pct >= 75) return "healthy";
  if (pct >= 55) return "acceptable";
  if (pct >= 35) return "warning";
  return "critical";
}

// ── Bus Factor Risk ────────────────────────────────────

export function busFactorRisk(busFactor: number): RiskLevel {
  if (busFactor >= 3) return "healthy";
  if (busFactor >= 2) return "acceptable";
  return "critical";
}

// ── Delivery Risk ──────────────────────────────────────

export function deliveryRisk(riskScore: number): RiskLevel {
  if (riskScore >= 70) return "critical";
  if (riskScore >= 50) return "warning";
  if (riskScore >= 30) return "acceptable";
  return "healthy";
}

// ── Capacity Trend ─────────────────────────────────────

export function capacityTrendColor(direction: "up" | "down" | "stable"): string {
  if (direction === "up") return "text-orange"; // increasing load = subtle warning
  if (direction === "down") return "text-success"; // decreasing load = positive
  return "text-muted-foreground";
}
