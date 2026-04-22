import type { EAPerformance, EACategory, EquityPoint } from "@/types/ea";

/* -------------------------------------------------------------------------- */
/* Backend response schema (https://EAdashboard-api.runbickers.com/ea-stats)  */
/* -------------------------------------------------------------------------- */

export interface ApiSourceFile {
  terminal_id: string;
  terminal_name: string;
  broker: string;
  account_updated_at: string;
  positions_updated_at: string;
  deals_updated_at: string;
  files_available: boolean;
}

export interface ApiAccount {
  terminal_id: string;
  terminal_name: string;
  broker: string;
  balance: number;
  equity: number;
  margin: number;
  free_margin: number;
  margin_level: number;
  profit: number;
  currency: string;
  server: string;
  login: string;
  name: string;
  time: string;
}

export interface ApiPosition {
  terminal_id: string;
  broker: string;
  ticket: string;
  symbol: string;
  type: "buy" | "sell" | string;
  volume: number;
  open_time: string;
  open_price: number;
  current_price: number;
  sl: number;
  tp: number;
  profit: number;
  swap: number;
  floating_total: number;
  magic: number;
  comment: string;
  ea_category: EACategory | string;
  strategy_name: string;
}

export interface ApiDeal {
  terminal_id: string;
  broker: string;
  ticket: string;
  time: string;
  entry: string;
  type: string;
  symbol: string;
  volume: number;
  price: number;
  profit: number;
  commission: number;
  swap: number;
  realized_total: number;
  magic: number;
  comment: string;
  position_id: string;
  order_ticket: string;
  sl: number;
  tp: number;
  ea_category: EACategory | string;
  strategy_name: string;
}

export interface ApiResponse {
  generated_at: string;
  source_files: ApiSourceFile[];
  warnings: string[];
  accounts: ApiAccount[];
  positions: ApiPosition[];
  recent_deals: ApiDeal[];
}

export interface DashboardData {
  rows: EAPerformance[];
  generatedAt: string | null;
  warnings: string[];
  sourceFiles: ApiSourceFile[];
  isMock: boolean;
}

/* -------------------------------------------------------------------------- */
/* Mock data (used when VITE_USE_MOCK === "true")                              */
/* -------------------------------------------------------------------------- */

function generateCurve(
  days: number,
  startBalance: number,
  drift: number,
  volatility: number,
  seed: number,
): EquityPoint[] {
  const points: EquityPoint[] = [];
  let balance = startBalance;
  let s = seed;
  const rand = () => {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };

  const now = Date.now();
  for (let i = days - 1; i >= 0; i--) {
    const date = new Date(now - i * 24 * 60 * 60 * 1000).toISOString();
    const ret = drift + volatility * (rand() - 0.5) * 2;
    balance = Math.max(100, balance * (1 + ret));
    const equity = balance + (rand() - 0.4) * balance * 0.01;
    const volume = Math.floor(rand() * 30 + 5);
    points.push({ date, balance: +balance.toFixed(2), equity: +equity.toFixed(2), volume });
  }
  return points;
}

const MOCK: EAPerformance[] = [
  {
    id: "arch-eightcap-4321",
    strategy: "Architect EA v4",
    eaCategory: "architect",
    broker: "Eightcap",
    accountNumber: "12344321",
    type: "LIVE",
    deposit: 10000,
    balance: 14820.45,
    equity: 14756.12,
    floatingPL: -64.33,
    withdrawals: 1500,
    gainPercent: 63.2,
    monthlyGainPercent: 4.8,
    trades: 1284,
    days: 312,
    profitFactor: 1.74,
    maxDrawdownPercent: 8.4,
    equityCurve: generateCurve(180, 10000, 0.0035, 0.012, 11),
    setFileUrl: "/setfiles/architect-v4-eightcap.set",
  },
  {
    id: "arch-blackbull-7788",
    strategy: "Architect EA v4 Aggressive",
    eaCategory: "architect",
    broker: "BlackBull",
    accountNumber: "55887788",
    type: "LIVE",
    deposit: 5000,
    balance: 8920.1,
    equity: 9012.55,
    floatingPL: 92.45,
    withdrawals: 0,
    gainPercent: 78.4,
    monthlyGainPercent: 7.2,
    trades: 942,
    days: 198,
    profitFactor: 1.62,
    maxDrawdownPercent: 14.1,
    equityCurve: generateCurve(180, 5000, 0.005, 0.018, 27),
    setFileUrl: "/setfiles/architect-v4-aggressive.set",
  },
  {
    id: "cp-fib-eightcap-1100",
    strategy: "Currency Pros — Fibonacci",
    eaCategory: "currencypros",
    broker: "Eightcap",
    accountNumber: "77881100",
    type: "LIVE",
    deposit: 8000,
    balance: 11240.75,
    equity: 11198.02,
    floatingPL: -42.73,
    withdrawals: 800,
    gainPercent: 50.5,
    monthlyGainPercent: 5.6,
    trades: 768,
    days: 240,
    profitFactor: 1.58,
    maxDrawdownPercent: 11.8,
    equityCurve: generateCurve(180, 8000, 0.0028, 0.014, 53),
    setFileUrl: "/setfiles/cp-fibonacci.set",
  },
  {
    id: "future-1",
    strategy: "Trend Hunter (Beta)",
    eaCategory: "other",
    broker: "Eightcap",
    accountNumber: "00114455",
    type: "DEMO",
    deposit: 10000,
    balance: 10210.0,
    equity: 10210.0,
    floatingPL: 0,
    withdrawals: 0,
    gainPercent: 2.1,
    monthlyGainPercent: 2.1,
    trades: 38,
    days: 21,
    profitFactor: 1.92,
    maxDrawdownPercent: 1.4,
    equityCurve: generateCurve(21, 10000, 0.001, 0.006, 91),
    setFileUrl: "/setfiles/trend-hunter-beta.set",
  },
];

/* -------------------------------------------------------------------------- */
/* Adapter: backend → dashboard rows                                          */
/* -------------------------------------------------------------------------- */

const VALID_CATEGORIES: EACategory[] = ["architect", "currencypros", "other"];

function normalizeCategory(raw: string | undefined): EACategory {
  if (raw && (VALID_CATEGORIES as string[]).includes(raw)) return raw as EACategory;
  return "other";
}

/**
 * Convert the backend response into `EAPerformance[]` rows.
 *
 * Strategy: one row per (terminal_id, magic+strategy_name). The account-level
 * fields (deposit/balance/equity/withdrawals/gain/...) are sourced from the
 * matching `accounts[]` entry; per-EA fields (floating P/L, trades, strategy
 * label, category) are aggregated from `positions[]` and `recent_deals[]`.
 *
 * Accounts that have NO positions and NO deals still produce a single
 * "Account Idle" row so the user sees the connected account.
 */
export function mapApiToDashboard(api: ApiResponse): EAPerformance[] {
  const rows: EAPerformance[] = [];

  for (const acc of api.accounts ?? []) {
    const accPositions = (api.positions ?? []).filter((p) => p.terminal_id === acc.terminal_id);
    const accDeals = (api.recent_deals ?? []).filter((d) => d.terminal_id === acc.terminal_id);

    // Group EAs by magic + strategy_name
    const groups = new Map<
      string,
      {
        magic: number;
        strategy: string;
        category: EACategory;
        positions: ApiPosition[];
        deals: ApiDeal[];
      }
    >();

    const keyOf = (magic: number, strategy: string) => `${magic}::${strategy}`;

    for (const p of accPositions) {
      const k = keyOf(p.magic, p.strategy_name);
      const g = groups.get(k);
      if (g) g.positions.push(p);
      else
        groups.set(k, {
          magic: p.magic,
          strategy: p.strategy_name || `Magic ${p.magic}`,
          category: normalizeCategory(p.ea_category),
          positions: [p],
          deals: [],
        });
    }
    for (const d of accDeals) {
      const k = keyOf(d.magic, d.strategy_name);
      const g = groups.get(k);
      if (g) g.deals.push(d);
      else
        groups.set(k, {
          magic: d.magic,
          strategy: d.strategy_name || `Magic ${d.magic}`,
          category: normalizeCategory(d.ea_category),
          positions: [],
          deals: [d],
        });
    }

    if (groups.size === 0) {
      // Account exists but no EA activity yet — show a single placeholder row.
      rows.push({
        id: `${acc.terminal_id}-idle`,
        strategy: "Account (no EA activity)",
        eaCategory: "other",
        broker: acc.broker || acc.terminal_name,
        accountNumber: acc.login,
        type: "LIVE",
        deposit: acc.balance,
        balance: acc.balance,
        equity: acc.equity,
        floatingPL: acc.profit,
        withdrawals: 0,
        gainPercent: 0,
        monthlyGainPercent: 0,
        trades: 0,
        days: 0,
        profitFactor: 0,
        maxDrawdownPercent: 0,
        equityCurve: [],
        setFileUrl: "",
      });
      continue;
    }

    for (const g of groups.values()) {
      const floatingPL = g.positions.reduce((s, p) => s + (p.floating_total ?? p.profit ?? 0), 0);
      const realized = g.deals.reduce((s, d) => s + (d.realized_total ?? d.profit ?? 0), 0);
      const trades = g.deals.length;

      // Account-level balance / equity is shared across EAs on the same terminal.
      // We don't yet have per-EA balance from the backend, so we expose account
      // totals on every row but the floating P/L is per-EA.
      rows.push({
        id: `${acc.terminal_id}-${g.magic}-${g.strategy}`,
        strategy: g.strategy,
        eaCategory: g.category,
        broker: acc.broker || acc.terminal_name,
        accountNumber: acc.login,
        type: "LIVE",
        deposit: acc.balance - realized,
        balance: acc.balance,
        equity: acc.equity,
        floatingPL: +floatingPL.toFixed(2),
        withdrawals: 0,
        gainPercent: 0,
        monthlyGainPercent: 0,
        trades,
        days: 0,
        profitFactor: 0,
        maxDrawdownPercent: 0,
        equityCurve: [],
        setFileUrl: "",
      });
    }
  }

  return rows;
}

/* -------------------------------------------------------------------------- */
/* Public fetchers                                                             */
/* -------------------------------------------------------------------------- */

/**
 * Mock toggle.
 *
 * Default = `false` (live API). Lovable's preview/published builds do NOT
 * inject `.env` values into `import.meta.env`, so we cannot rely on the env
 * variable to flip us into live mode — we must default to live and only fall
 * back to mock when the developer explicitly sets `VITE_USE_MOCK="true"`.
 */
export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";

/**
 * Live API base URL. We fall back to the production backend so the dashboard
 * works in any deployment without requiring env wiring.
 */
const DEFAULT_API_BASE = "https://EAdashboard-api.runbickers.com";

/** Returns the bundled mock dashboard payload. Used for `VITE_USE_MOCK=true` and as a fallback when the live API fails. */
export function getMockDashboardData(): DashboardData {
  return {
    rows: MOCK,
    generatedAt: new Date().toISOString(),
    warnings: [],
    sourceFiles: [],
    isMock: true,
  };
}

/**
 * Fetch the full dashboard payload (rows + metadata).
 *
 * - VITE_USE_MOCK="true"  → bundled mock data.
 * - VITE_USE_MOCK="false" → GET ${VITE_API_BASE}/ea-stats
 *
 * Throws on HTTP / network failure so the UI can render a "백엔드 연결 실패"
 * banner.
 */
export async function fetchDashboardData(): Promise<DashboardData> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return getMockDashboardData();
  }

  const base = (import.meta.env.VITE_API_BASE ?? DEFAULT_API_BASE).replace(/\/$/, "");

  const res = await fetch(`${base}/ea-stats`, {
    credentials: "omit",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch EA stats (${res.status} ${res.statusText})`);
  }

  const payload = (await res.json()) as ApiResponse;
  return {
    rows: mapApiToDashboard(payload),
    generatedAt: payload.generated_at ?? null,
    warnings: payload.warnings ?? [],
    sourceFiles: payload.source_files ?? [],
    isMock: false,
  };
}

/** Backwards-compatible thin wrapper returning just the rows. */
export async function fetchEAData(): Promise<EAPerformance[]> {
  const data = await fetchDashboardData();
  return data.rows;
}
