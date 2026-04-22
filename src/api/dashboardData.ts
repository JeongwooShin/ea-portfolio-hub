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

export interface ApiStrategy {
  id: string;
  terminal_id: string;
  terminal_name?: string;
  broker: string;
  ea_category: EACategory | string;
  strategy_name: string;
  account_login: string;
  account_balance: number;
  account_equity: number;
  account_profit: number;
  open_positions: number;
  open_volume: number;
  floating_profit: number;
  floating_swap: number;
  floating_total: number;
  closed_deals: number;
  realized_profit: number;
  realized_commission: number;
  realized_swap: number;
  realized_total: number;
  gross_profit: number;
  gross_loss: number;
  profit_factor: number | null;
  first_seen_at: string | null;
  last_seen_at: string | null;
  last_closed_at: string | null;
  symbols: string[];
  magic_numbers: number[];
}

export interface ApiCacheInfo {
  hit?: boolean;
  age_seconds?: number;
  ttl_seconds?: number;
  next_refresh_in?: number;
}

export interface ApiResponse {
  generated_at: string;
  source_files: ApiSourceFile[];
  warnings: string[];
  accounts: ApiAccount[];
  positions: ApiPosition[];
  recent_deals: ApiDeal[];
  strategies?: ApiStrategy[];
  cache?: ApiCacheInfo;
}

export interface DashboardMeta {
  generatedAt: string;
  cacheHit: boolean;
  cacheAgeSec: number;
  ttlSec: number;
  nextRefreshInSec: number;
}

export interface DashboardData {
  rows: EAPerformance[];
  generatedAt: string | null;
  warnings: string[];
  sourceFiles: ApiSourceFile[];
  isMock: boolean;
  /** Aggregated values that should NOT be re-derived from rows. */
  totals: {
    totalEquity: number;
    floatingPL: number;
    activeEAs: number;
    /** Set to null when backend doesn't provide withdrawal data. */
    totalWithdrawn: number | null;
  };
  /** Cache / freshness info from the backend. */
  meta: DashboardMeta;
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
    realizedPL: 4820.45,
    withdrawals: 1500,
    withdrawalsAvailable: true,
    depositAvailable: true,
    lastSeenAt: new Date().toISOString(),
    openPositions: 2,
    gainPercent: 63.2,
    monthlyGainPercent: 4.8,
    monthlyGainAvailable: true,
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
    realizedPL: 3920.1,
    withdrawals: 0,
    withdrawalsAvailable: true,
    depositAvailable: true,
    lastSeenAt: new Date().toISOString(),
    openPositions: 3,
    gainPercent: 78.4,
    monthlyGainPercent: 7.2,
    monthlyGainAvailable: true,
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
    realizedPL: 3240.75,
    withdrawals: 800,
    withdrawalsAvailable: true,
    depositAvailable: true,
    lastSeenAt: new Date().toISOString(),
    openPositions: 1,
    gainPercent: 50.5,
    monthlyGainPercent: 5.6,
    monthlyGainAvailable: true,
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
    realizedPL: 210,
    withdrawals: 0,
    withdrawalsAvailable: true,
    depositAvailable: true,
    lastSeenAt: new Date().toISOString(),
    openPositions: 0,
    gainPercent: 2.1,
    monthlyGainPercent: 2.1,
    monthlyGainAvailable: true,
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

function normalizeCategory(raw: string | undefined | null): EACategory {
  if (raw && (VALID_CATEGORIES as string[]).includes(raw)) return raw as EACategory;
  return "other";
}

const ACTIVE_WINDOW_MS = 24 * 60 * 60 * 1000;

function isStrategyActive(s: ApiStrategy, generatedAt: number): boolean {
  if ((s.open_positions ?? 0) > 0) return true;
  if (!s.last_seen_at) return false;
  const ts = new Date(s.last_seen_at).getTime();
  if (Number.isNaN(ts)) return false;
  return generatedAt - ts <= ACTIVE_WINDOW_MS;
}

/**
 * Convert the backend response into `EAPerformance[]` rows.
 *
 * One row = one entry in `strategies[]` (the backend already aggregates
 * positions + deals into per-strategy rollups). Account-level fields
 * (balance/equity/withdrawals) are duplicated across strategies that share
 * the same account — that's expected; the dedup happens in the header card.
 */
export function mapApiToDashboard(api: ApiResponse): {
  rows: EAPerformance[];
  totals: DashboardData["totals"];
} {
  const generatedAtMs = api.generated_at ? new Date(api.generated_at).getTime() : Date.now();
  const strategies = api.strategies ?? [];

  const rows: EAPerformance[] = strategies.map((s) => {
    const cat = normalizeCategory(s.ea_category);
    const balance = s.account_balance ?? 0;
    const realized = s.realized_total ?? 0;
    const gainPercent = balance !== 0 ? (realized / balance) * 100 : 0;
    const tail = (s.terminal_id ?? "").slice(-4).toUpperCase();

    return {
      id: s.id,
      strategy: tail ? `${s.strategy_name} · ${tail}` : s.strategy_name,
      originalStrategy: s.strategy_name,
      eaCategory: cat,
      broker: s.broker,
      accountNumber: s.account_login,
      type: "LIVE",
      deposit: 0,
      depositAvailable: false,
      balance,
      equity: s.account_equity ?? 0,
      floatingPL: +(s.floating_total ?? 0).toFixed(2),
      realizedPL: +realized.toFixed(2),
      withdrawals: 0,
      withdrawalsAvailable: false,
      lastSeenAt: s.last_seen_at,
      openPositions: s.open_positions ?? 0,
      gainPercent: balance !== 0 ? +gainPercent.toFixed(2) : 0,
      monthlyGainPercent: 0,
      monthlyGainAvailable: false,
      trades: s.closed_deals ?? 0,
      days: 0,
      profitFactor: s.profit_factor ?? 0,
      maxDrawdownPercent: 0,
      equityCurve: [],
      setFileUrl: "",
    };
  });

  // Fallback: no strategies → at least surface raw accounts so the user sees them.
  if (rows.length === 0) {
    for (const acc of api.accounts ?? []) {
      rows.push({
        id: `${acc.terminal_id}-idle`,
        strategy: "Account (no EA activity)",
        eaCategory: "other",
        broker: acc.broker || acc.terminal_name,
        accountNumber: acc.login,
        type: "LIVE",
        deposit: 0,
        depositAvailable: false,
        balance: acc.balance,
        equity: acc.equity,
        floatingPL: acc.profit,
        realizedPL: 0,
        withdrawals: 0,
        withdrawalsAvailable: false,
        lastSeenAt: acc.time ?? null,
        openPositions: 0,
        gainPercent: 0,
        monthlyGainPercent: 0,
        monthlyGainAvailable: false,
        trades: 0,
        days: 0,
        profitFactor: 0,
        maxDrawdownPercent: 0,
        equityCurve: [],
        setFileUrl: "",
      });
    }
  }

  // Account-level totals — sum directly from accounts[] and positions[] so we
  // never multiply by the number of strategies sharing an account.
  const totalEquity = (api.accounts ?? []).reduce((sum, a) => sum + (a.equity ?? 0), 0);
  const floatingPL = (api.positions ?? []).reduce(
    (sum, p) => sum + (p.floating_total ?? p.profit ?? 0),
    0,
  );
  const activeEAs = strategies.filter((s) => isStrategyActive(s, generatedAtMs)).length;

  return {
    rows,
    totals: {
      totalEquity: +totalEquity.toFixed(2),
      floatingPL: +floatingPL.toFixed(2),
      activeEAs,
      totalWithdrawn: null, // not provided by backend yet
    },
  };
}

/* -------------------------------------------------------------------------- */
/* Public fetchers                                                             */
/* -------------------------------------------------------------------------- */

// TEMP: 백엔드 CSV 연결 일시 중단 — 항상 mock 데이터 사용.
// 내일 복구 시 아래 한 줄을 원래대로 되돌릴 것:
//   export const USE_MOCK = import.meta.env.VITE_USE_MOCK === "true";
export const USE_MOCK = true;

const DEFAULT_API_BASE = "https://EAdashboard-api.runbickers.com";

export const REFRESH_INTERVAL_SEC = (() => {
  const raw = Number(import.meta.env.VITE_REFRESH_INTERVAL_SEC);
  return Number.isFinite(raw) && raw > 0 ? raw : 30;
})();

export function getMockDashboardData(): DashboardData {
  const totalEquity = MOCK.reduce((s, r) => s + r.equity, 0);
  const floatingPL = MOCK.reduce((s, r) => s + r.floatingPL, 0);
  const generatedAt = new Date().toISOString();
  return {
    rows: MOCK,
    generatedAt,
    warnings: [],
    sourceFiles: [],
    isMock: true,
    totals: {
      totalEquity: +totalEquity.toFixed(2),
      floatingPL: +floatingPL.toFixed(2),
      activeEAs: MOCK.filter((r) => r.type === "LIVE").length,
      totalWithdrawn: MOCK.reduce((s, r) => s + r.withdrawals, 0),
    },
    meta: {
      generatedAt,
      cacheHit: false,
      cacheAgeSec: 0,
      ttlSec: 0,
      nextRefreshInSec: REFRESH_INTERVAL_SEC,
    },
  };
}

export async function fetchDashboardData(opts?: { force?: boolean }): Promise<DashboardData> {
  if (USE_MOCK) {
    await new Promise((r) => setTimeout(r, 200));
    return getMockDashboardData();
  }

  const base = (import.meta.env.VITE_API_BASE ?? DEFAULT_API_BASE).replace(/\/$/, "");
  const url = opts?.force
    ? `${base}/ea-stats?force=1&_=${Date.now()}`
    : `${base}/ea-stats`;

  const res = await fetch(url, {
    credentials: "omit",
    headers: { Accept: "application/json" },
    cache: opts?.force ? "no-store" : "default",
  });
  if (!res.ok) {
    throw new Error(`Failed to fetch EA stats (${res.status} ${res.statusText})`);
  }

  const payload = (await res.json()) as ApiResponse;
  const { rows, totals } = mapApiToDashboard(payload);
  const generatedAt = payload.generated_at ?? new Date().toISOString();
  const cache = payload.cache ?? {};
  return {
    rows,
    generatedAt: payload.generated_at ?? null,
    warnings: payload.warnings ?? [],
    sourceFiles: payload.source_files ?? [],
    isMock: false,
    totals,
    meta: {
      generatedAt,
      cacheHit: Boolean(cache.hit),
      cacheAgeSec: Number.isFinite(cache.age_seconds) ? Number(cache.age_seconds) : 0,
      ttlSec: Number.isFinite(cache.ttl_seconds) ? Number(cache.ttl_seconds) : 0,
      nextRefreshInSec: Number.isFinite(cache.next_refresh_in)
        ? Number(cache.next_refresh_in)
        : REFRESH_INTERVAL_SEC,
    },
  };
}

export async function fetchEAData(): Promise<EAPerformance[]> {
  const data = await fetchDashboardData();
  return data.rows;
}
