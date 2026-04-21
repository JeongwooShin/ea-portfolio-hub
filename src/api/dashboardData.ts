import type { EAPerformance, EquityPoint } from "@/types/ea";

/**
 * Generates a synthetic equity curve for mock data.
 * @param days - number of daily points
 * @param startBalance - initial balance
 * @param drift - daily mean return (e.g. 0.004 = +0.4%/day)
 * @param volatility - daily stddev of returns
 * @param seed - deterministic seed
 */
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
    id: "arch-vantage-9911",
    strategy: "Architect EA v3 Conservative",
    eaCategory: "architect",
    broker: "Vantage",
    accountNumber: "33449911",
    type: "DEMO",
    deposit: 25000,
    balance: 27430.0,
    equity: 27430.0,
    floatingPL: 0,
    withdrawals: 0,
    gainPercent: 9.7,
    monthlyGainPercent: 1.9,
    trades: 421,
    days: 142,
    profitFactor: 2.11,
    maxDrawdownPercent: 3.2,
    equityCurve: generateCurve(140, 25000, 0.0012, 0.005, 41),
    setFileUrl: "/setfiles/architect-v3-conservative.set",
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
    id: "cp-brk-blackbull-2200",
    strategy: "Currency Pros — Breakout",
    eaCategory: "currencypros",
    broker: "BlackBull",
    accountNumber: "99002200",
    type: "LIVE",
    deposit: 6000,
    balance: 7180.34,
    equity: 7245.99,
    floatingPL: 65.65,
    withdrawals: 0,
    gainPercent: 19.7,
    monthlyGainPercent: 3.1,
    trades: 512,
    days: 168,
    profitFactor: 1.41,
    maxDrawdownPercent: 9.6,
    equityCurve: generateCurve(168, 6000, 0.002, 0.013, 67),
    setFileUrl: "/setfiles/cp-breakout.set",
  },
  {
    id: "cp-scalp-vantage-3300",
    strategy: "Currency Pros — Scalper",
    eaCategory: "currencypros",
    broker: "Vantage",
    accountNumber: "11223300",
    type: "PAUSED",
    deposit: 4000,
    balance: 4380.5,
    equity: 4380.5,
    floatingPL: 0,
    withdrawals: 200,
    gainPercent: 14.5,
    monthlyGainPercent: -1.2,
    trades: 2104,
    days: 220,
    profitFactor: 1.18,
    maxDrawdownPercent: 18.4,
    equityCurve: generateCurve(180, 4000, 0.0009, 0.02, 79),
    setFileUrl: "/setfiles/cp-scalper.set",
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
  {
    id: "future-2",
    strategy: "Reserved Slot",
    eaCategory: "other",
    broker: "BlackBull",
    accountNumber: "00007777",
    type: "PAUSED",
    deposit: 0,
    balance: 0,
    equity: 0,
    floatingPL: 0,
    withdrawals: 0,
    gainPercent: 0,
    monthlyGainPercent: 0,
    trades: 0,
    days: 0,
    profitFactor: 0,
    maxDrawdownPercent: 0,
    equityCurve: [],
    setFileUrl: "",
  },
];

/**
 * Fetch all EA performance entries.
 *
 * SWAPPING TO REAL BACKEND:
 *   Replace the body with:
 *     const res = await fetch("/api/ea-stats");
 *     if (!res.ok) throw new Error("Failed to fetch EA stats");
 *     return (await res.json()) as EAPerformance[];
 *   No other file in the app needs to change.
 */
export async function fetchEAData(): Promise<EAPerformance[]> {
  await new Promise((r) => setTimeout(r, 300));
  return MOCK;
}
