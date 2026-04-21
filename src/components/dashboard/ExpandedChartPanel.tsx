import { useMemo, useState } from "react";
import {
  Area,
  Bar,
  CartesianGrid,
  ComposedChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import type { EAPerformance, EquityPoint } from "@/types/ea";
import { chartColors } from "@/theme/colors";
import { formatCompact, formatDate, formatPercent, plToneClass } from "@/utils/format";
import { cn } from "@/lib/utils";

type MainTab = "Chart" | "Performance" | "Terminal";
type ChartMetric = "BALANCE" | "PROFIT" | "GROWTH" | "FLOATING";
type TimeRange = "1D" | "1W" | "1M" | "3M" | "6M" | "ALL";

const RANGE_DAYS: Record<TimeRange, number | null> = {
  "1D": 1,
  "1W": 7,
  "1M": 30,
  "3M": 90,
  "6M": 180,
  ALL: null,
};

interface Props {
  ea: EAPerformance;
}

export function ExpandedChartPanel({ ea }: Props) {
  const [mainTab, setMainTab] = useState<MainTab>("Chart");
  const [metric, setMetric] = useState<ChartMetric>("BALANCE");
  const [range, setRange] = useState<TimeRange>("ALL");

  const filtered = useMemo(() => {
    const days = RANGE_DAYS[range];
    if (days === null || ea.equityCurve.length === 0) return ea.equityCurve;
    return ea.equityCurve.slice(-days);
  }, [ea.equityCurve, range]);

  const chartData = useMemo(() => transformData(filtered, metric), [filtered, metric]);

  const drawdownMarkers = useMemo(() => findDrawdowns(filtered), [filtered]);

  return (
    <div className="border-t border-border bg-panel-elevated">
      <div className="px-6 py-4">
        {/* Main tabs */}
        <div className="flex items-center gap-1 border-b border-border">
          {(["Chart", "Performance", "Terminal"] as MainTab[]).map((t) => (
            <button
              key={t}
              onClick={() => setMainTab(t)}
              className={cn(
                "border-b-2 px-3 py-2 text-xs font-semibold uppercase tracking-wider transition-colors",
                mainTab === t
                  ? "border-positive text-positive"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {t}
            </button>
          ))}
        </div>

        {mainTab === "Chart" && (
          <div className="pt-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <div className="flex flex-wrap gap-1">
                {(
                  [
                    ["BALANCE", "Balance"],
                    ["PROFIT", "Profit"],
                    ["GROWTH", "Growth Rate %"],
                    ["FLOATING", "Floating P/L"],
                  ] as [ChartMetric, string][]
                ).map(([k, label]) => (
                  <button
                    key={k}
                    onClick={() => setMetric(k)}
                    className={cn(
                      "rounded px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider transition-colors",
                      metric === k
                        ? "bg-positive/15 text-positive"
                        : "text-muted-foreground hover:bg-panel hover:text-foreground",
                    )}
                  >
                    {label}
                  </button>
                ))}
              </div>
              <div className="flex gap-1">
                {(Object.keys(RANGE_DAYS) as TimeRange[]).map((r) => (
                  <button
                    key={r}
                    onClick={() => setRange(r)}
                    className={cn(
                      "rounded px-2 py-1 text-[11px] font-semibold transition-colors",
                      range === r
                        ? "bg-foreground/10 text-foreground"
                        : "text-muted-foreground hover:text-foreground",
                    )}
                  >
                    {r}
                  </button>
                ))}
              </div>
            </div>

            {chartData.length === 0 ? (
              <div className="flex h-[280px] items-center justify-center text-xs text-muted-foreground">
                No data available
              </div>
            ) : (
              <div className="h-[320px] w-full">
                <ResponsiveContainer width="100%" height="100%">
                  <ComposedChart
                    data={chartData}
                    margin={{ top: 10, right: 16, left: 0, bottom: 0 }}
                  >
                    <defs>
                      <linearGradient id={`grad-${ea.id}`} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor={chartColors.positive} stopOpacity={0.35} />
                        <stop offset="100%" stopColor={chartColors.positive} stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <CartesianGrid stroke={chartColors.grid} strokeDasharray="2 4" />
                    <XAxis
                      dataKey="date"
                      tick={{ fill: chartColors.axis, fontSize: 10 }}
                      tickFormatter={(v) => formatDate(v).replace(", ", " ")}
                      stroke={chartColors.grid}
                      minTickGap={40}
                    />
                    <YAxis
                      yAxisId="main"
                      tick={{ fill: chartColors.axis, fontSize: 10 }}
                      tickFormatter={(v) =>
                        metric === "GROWTH" ? `${v.toFixed(0)}%` : formatCompact(v)
                      }
                      stroke={chartColors.grid}
                      width={60}
                    />
                    <YAxis
                      yAxisId="vol"
                      orientation="right"
                      tick={{ fill: chartColors.axis, fontSize: 10 }}
                      stroke={chartColors.grid}
                      width={30}
                    />
                    <Tooltip
                      contentStyle={{
                        background: chartColors.tooltipBg,
                        border: `1px solid ${chartColors.tooltipBorder}`,
                        borderRadius: 6,
                        fontSize: 11,
                      }}
                      labelFormatter={(v) => formatDate(v as string)}
                      formatter={(value: number, name: string) => [
                        metric === "GROWTH"
                          ? `${value.toFixed(2)}%`
                          : formatCompact(value),
                        name,
                      ]}
                    />
                    <Area
                      yAxisId="main"
                      type="monotone"
                      dataKey="value"
                      name={metricLabel(metric)}
                      stroke={chartColors.positive}
                      strokeWidth={1.75}
                      fill={`url(#grad-${ea.id})`}
                    />
                    <Bar
                      yAxisId="vol"
                      dataKey="volume"
                      name="Trades"
                      fill={chartColors.volumeBar}
                      opacity={0.7}
                      maxBarSize={6}
                    />
                    {drawdownMarkers.map((d) => (
                      <ReferenceLine
                        key={d.date}
                        yAxisId="main"
                        x={d.date}
                        stroke={chartColors.drawdownLine}
                        strokeDasharray="3 3"
                        strokeWidth={1}
                        label={{
                          value: `−${d.dd.toFixed(1)}%`,
                          position: "top",
                          fill: chartColors.negative,
                          fontSize: 9,
                        }}
                      />
                    ))}
                  </ComposedChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {mainTab === "Performance" && <PerformanceTable ea={ea} />}

        {mainTab === "Terminal" && (
          <div className="py-8 text-center text-xs text-muted-foreground">
            Live terminal feed will appear here once backend streaming is connected.
          </div>
        )}
      </div>
    </div>
  );
}

function metricLabel(m: ChartMetric): string {
  switch (m) {
    case "BALANCE":
      return "Balance";
    case "PROFIT":
      return "Profit";
    case "GROWTH":
      return "Growth %";
    case "FLOATING":
      return "Floating P/L";
  }
}

function transformData(curve: EquityPoint[], metric: ChartMetric) {
  if (curve.length === 0) return [];
  const start = curve[0].balance;
  return curve.map((p) => {
    let value: number;
    switch (metric) {
      case "BALANCE":
        value = p.balance;
        break;
      case "PROFIT":
        value = p.balance - start;
        break;
      case "GROWTH":
        value = ((p.balance - start) / start) * 100;
        break;
      case "FLOATING":
        value = p.equity - p.balance;
        break;
    }
    return { date: p.date, value, volume: p.volume };
  });
}

function findDrawdowns(curve: EquityPoint[]): { date: string; dd: number }[] {
  if (curve.length < 2) return [];
  const result: { date: string; dd: number }[] = [];
  let peak = curve[0].balance;
  let lastMarkedIdx = -10;
  curve.forEach((p, i) => {
    if (p.balance > peak) peak = p.balance;
    const dd = ((peak - p.balance) / peak) * 100;
    if (dd > 5 && i - lastMarkedIdx > 20) {
      result.push({ date: p.date, dd });
      lastMarkedIdx = i;
    }
  });
  return result.slice(0, 4);
}

function PerformanceTable({ ea }: { ea: EAPerformance }) {
  const rows: [string, string, string?][] = [
    ["Deposit", formatCompact(ea.deposit)],
    ["Balance", formatCompact(ea.balance)],
    ["Equity", formatCompact(ea.equity)],
    ["Floating P/L", formatCompact(ea.floatingPL), plToneClass(ea.floatingPL)],
    ["Withdrawals", formatCompact(ea.withdrawals)],
    ["Total Gain", formatPercent(ea.gainPercent), plToneClass(ea.gainPercent)],
    ["Monthly Gain", formatPercent(ea.monthlyGainPercent), plToneClass(ea.monthlyGainPercent)],
    ["Trades", String(ea.trades)],
    ["Days Live", String(ea.days)],
    ["Profit Factor", ea.profitFactor.toFixed(2)],
    ["Max Drawdown", `−${ea.maxDrawdownPercent.toFixed(2)}%`, "text-negative"],
  ];
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-2 pt-4 sm:grid-cols-3 lg:grid-cols-4">
      {rows.map(([label, value, tone]) => (
        <div key={label} className="flex items-center justify-between border-b border-border/50 py-1.5">
          <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
            {label}
          </span>
          <span className={cn("tabular-nums text-xs font-semibold", tone ?? "text-foreground")}>
            {value}
          </span>
        </div>
      ))}
    </div>
  );
}
