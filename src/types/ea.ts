/**
 * Type contract for the dashboard data layer.
 *
 * BACKEND CONTRACT:
 *   When wiring a real API, the endpoint must return `EAPerformance[]` matching
 *   this shape. Numeric fields are plain numbers (no formatting / units).
 *   Dates are ISO 8601 strings (UTC). `equityCurve` is sorted ascending by date.
 *
 * To swap mock data for a real API, edit ONLY src/api/dashboardData.ts.
 */

export type EAStatus = "LIVE" | "DEMO" | "PAUSED";
export type EACategory = "architect" | "currencypros" | "other";

export interface EquityPoint {
  date: string; // ISO 8601
  balance: number;
  equity: number;
  volume: number;
}

export interface EAPerformance {
  id: string;
  strategy: string;
  eaCategory: EACategory;
  broker: string;
  accountNumber: string;
  type: EAStatus;
  deposit: number;
  balance: number;
  equity: number;
  floatingPL: number;
  withdrawals: number;
  gainPercent: number;
  monthlyGainPercent: number;
  trades: number;
  days: number;
  profitFactor: number;
  maxDrawdownPercent: number;
  equityCurve: EquityPoint[];
  setFileUrl: string;
}

/** Display metadata for each EA category. Single source of truth for labels + colors. */
export const CATEGORY_META: Record<
  EACategory,
  { label: string; shortLabel: string; colorVar: string }
> = {
  architect: { label: "Architect EA", shortLabel: "Architect", colorVar: "var(--category-architect)" },
  currencypros: { label: "Currency Pros", shortLabel: "Currency Pros", colorVar: "var(--category-currencypros)" },
  other: { label: "Other", shortLabel: "Other", colorVar: "var(--category-other)" },
};

export const CATEGORY_ORDER: EACategory[] = ["architect", "currencypros", "other"];
