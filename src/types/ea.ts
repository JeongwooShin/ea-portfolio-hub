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
  /** Display name e.g. "Architect EA v4". */
  strategy: string;
  /** Logical grouping used by the EA Type filter. */
  eaCategory: EACategory;
  /** Broker label e.g. "Eightcap". */
  broker: string;
  /** Full account number — UI masks all but last 4 digits. */
  accountNumber: string;
  type: EAStatus;
  deposit: number;
  balance: number;
  equity: number;
  floatingPL: number;
  withdrawals: number;
  /** Total gain since inception, in percent. */
  gainPercent: number;
  /** Trailing 30-day gain, in percent. */
  monthlyGainPercent: number;
  trades: number;
  /** Days since first trade. */
  days: number;
  profitFactor: number;
  /** Maximum floating-loss drawdown reached, in percent (positive number). */
  maxDrawdownPercent: number;
  equityCurve: EquityPoint[];
  /** URL or relative path to the broker-specific .set file. */
  setFileUrl: string;
}
