import { Activity, Lock, RefreshCw, TrendingDown, TrendingUp, Wallet } from "lucide-react";
import { useAuth, GATE_DISABLED } from "@/store/auth";
import { useEffect, useState, type ReactNode } from "react";
import type { EAPerformance } from "@/types/ea";
import type { DashboardData, DashboardMeta } from "@/api/dashboardData";
import { formatCompact, plToneClass } from "@/utils/format";
import { cn } from "@/lib/utils";

interface Props {
  data: EAPerformance[];
  totals: DashboardData["totals"] | null;
  generatedAt: string | null;
  meta: DashboardMeta | null;
  isRefreshing: boolean;
  onRefresh: () => void;
  /** Extra controls rendered next to the refresh button (e.g. nickname editor). */
  extraActions?: ReactNode;
}

function formatTimeAgo(secondsAgo: number): string {
  if (secondsAgo < 60) return `${secondsAgo}초 전`;
  const m = Math.floor(secondsAgo / 60);
  if (m < 60) return `${m}분 전`;
  const h = Math.floor(m / 60);
  return `${h}시간 전`;
}

export function AggregatedStatsHeader({
  data,
  totals,
  generatedAt,
  meta,
  isRefreshing,
  onRefresh,
  extraActions,
}: Props) {
  const fallbackFloating = data.reduce((s, d) => s + d.floatingPL, 0);

  const accountSeen = new Set<string>();
  let fallbackEquity = 0;
  for (const d of data) {
    const key = `${d.broker}::${d.accountNumber}`;
    if (accountSeen.has(key)) continue;
    accountSeen.add(key);
    fallbackEquity += d.equity;
  }

  const totalEquity = totals?.totalEquity ?? fallbackEquity;
  const totalFloating = totals?.floatingPL ?? fallbackFloating;
  const activeEAs = totals?.activeEAs ?? data.filter((d) => d.type === "LIVE").length;

  // Re-render every second so "X초 전" and the countdown stay accurate.
  const [, tick] = useState(0);
  useEffect(() => {
    const id = window.setInterval(() => tick((n) => n + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  let lastUpdatedLabel = "—";
  let timeAgoLabel = "";
  let secondsSinceUpdate = 0;
  if (generatedAt) {
    const d = new Date(generatedAt);
    if (!Number.isNaN(d.getTime())) {
      lastUpdatedLabel = d.toLocaleTimeString();
      secondsSinceUpdate = Math.max(0, Math.floor((Date.now() - d.getTime()) / 1000));
      timeAgoLabel = ` (${formatTimeAgo(secondsSinceUpdate)})`;
    }
  }

  // Cache freshness sub-label.
  let cacheLabel = "";
  if (meta) {
    if (meta.cacheHit) {
      // next_refresh_in is taken at fetch time; subtract elapsed seconds.
      const remaining = Math.max(0, meta.nextRefreshInSec - secondsSinceUpdate);
      cacheLabel = `(서버 캐시, ${remaining}초 후 자동 갱신)`;
    } else {
      cacheLabel = "(방금 백엔드에서 직접 읽음)";
    }
  }

  const stats = [
    {
      label: "Total Equity",
      value: formatCompact(totalEquity),
      icon: Wallet,
      tone: "text-foreground",
    },
    {
      label: "Floating P/L",
      value: totalFloating === 0 ? "—" : formatCompact(totalFloating),
      icon: totalFloating >= 0 ? TrendingUp : TrendingDown,
      tone: plToneClass(totalFloating),
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

        <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 sm:gap-3">
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

          <div className="flex flex-col items-end gap-1">
            <div className="flex items-center gap-2">
              {extraActions}
              <button
                type="button"
                onClick={onRefresh}
                disabled={isRefreshing}
                className={cn(
                  "inline-flex items-center gap-2 rounded-md border border-border bg-panel-elevated px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-positive/50 hover:text-positive disabled:cursor-not-allowed disabled:opacity-60",
                )}
              >
                <RefreshCw className={cn("h-3.5 w-3.5", isRefreshing && "animate-spin")} />
                새로고침
              </button>
              {!GATE_DISABLED && <LockButton />}
            </div>
            <div className="text-[10px] tabular-nums text-muted-foreground">
              마지막 갱신: {lastUpdatedLabel}
              {timeAgoLabel}
              {cacheLabel && (
                <span className="ml-1 text-muted-foreground/70">{cacheLabel}</span>
              )}
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}

function LockButton() {
  const lock = useAuth((s) => s.lock);
  return (
    <button
      type="button"
      onClick={lock}
      title="잠금"
      className="inline-flex items-center gap-2 rounded-md border border-border bg-panel-elevated px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-negative/50 hover:text-negative"
    >
      <Lock className="h-3.5 w-3.5" />
      잠금
    </button>
  );
}
