import { Activity, TrendingUp, TrendingDown, Wallet } from "lucide-react";
import type { EAPerformance } from "@/types/ea";
import { formatCompact, plToneClass } from "@/utils/format";

interface Props {
  data: EAPerformance[];
}

export function AggregatedStatsHeader({ data }: Props) {
  // Equity / withdrawals are ACCOUNT-level. Multiple EA rows can share the same
  // account (broker + accountNumber), so de-duplicate before summing to avoid
  // counting the same balance N times.
  const accountSeen = new Set<string>();
  let totalEquity = 0;
  let totalWithdrawn = 0;
  for (const d of data) {
    const key = `${d.broker}::${d.accountNumber}`;
    if (accountSeen.has(key)) continue;
    accountSeen.add(key);
    totalEquity += d.equity;
    totalWithdrawn += d.withdrawals;
  }
  // Floating P/L is per-EA, so sum across rows directly.
  const totalFloating = data.reduce((s, d) => s + d.floatingPL, 0);
  const activeEAs = data.filter((d) => d.type === "LIVE").length;

  const stats = [
    {
      label: "Total Equity",
      value: formatCompact(totalEquity),
      icon: Wallet,
      tone: "text-foreground",
    },
    {
      label: "Floating P/L",
      value: formatCompact(totalFloating),
      icon: totalFloating >= 0 ? TrendingUp : TrendingDown,
      tone: plToneClass(totalFloating),
    },
    {
      label: "Total Withdrawn",
      value: formatCompact(totalWithdrawn),
      icon: Wallet,
      tone: "text-muted-foreground",
    },
    {
      label: "Active EAs",
      value: String(activeEAs),
      icon: Activity,
      tone: "text-positive",
    },
  ];

  return (
    <header className="border-b border-border bg-panel">
      <div className="mx-auto flex max-w-[1600px] flex-col gap-4 px-6 py-4 lg:flex-row lg:items-center lg:justify-between">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-md bg-positive/15 text-positive">
            <Activity className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-foreground">
              EA Portfolio Dashboard
            </h1>
            <p className="text-xs text-muted-foreground">
              Multi-account live trading performance
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 gap-2 sm:grid-cols-4 sm:gap-3">
          {stats.map((s) => (
            <div
              key={s.label}
              className="flex items-center gap-3 rounded-md border border-border bg-panel-elevated px-3 py-2"
            >
              <s.icon className={`h-4 w-4 ${s.tone}`} />
              <div className="min-w-0">
                <div className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  {s.label}
                </div>
                <div className={`tabular-nums text-sm font-semibold ${s.tone}`}>
                  {s.value}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </header>
  );
}
