import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { toast } from "sonner";
import {
  fetchDashboardData,
  getMockDashboardData,
  REFRESH_INTERVAL_SEC,
  type DashboardData,
} from "@/api/dashboardData";
import type { EAPerformance, EACategory } from "@/types/ea";
import { CATEGORY_ORDER } from "@/types/ea";
import { useFilters } from "@/store/filters";
import { useNicknames } from "@/store/nicknames";
import { AggregatedStatsHeader } from "./AggregatedStatsHeader";
import { FilterBar } from "./FilterBar";
import { CategoryTabs } from "./CategoryTabs";
import { EATableRow } from "./EATableRow";
import { GroupSeparator } from "./GroupSeparator";
import { NicknameEditorDialog } from "./NicknameEditorDialog";

interface Column {
  key: string;
  label: string;
  align?: "right" | "center";
  /** Tailwind classes controlling column visibility per breakpoint. */
  responsive?: string;
}

const COLUMNS: Column[] = [
  { key: "strategy", label: "Strategy" },
  { key: "type", label: "Type" },
  { key: "broker", label: "Broker", responsive: "hidden md:table-cell" },
  { key: "deposit", label: "Deposit", align: "right", responsive: "hidden lg:table-cell" },
  { key: "balance", label: "Balance", align: "right" },
  { key: "floating", label: "Floating P/L", align: "right" },
  { key: "realized", label: "Realized P/L", align: "right" },
  { key: "withdrawals", label: "Withdrawals", align: "right", responsive: "hidden lg:table-cell" },
  { key: "gain", label: "Gain %", align: "right" },
  { key: "monthly", label: "Monthly %", align: "right", responsive: "hidden md:table-cell" },
  { key: "trades", label: "Trades", align: "right" },
  { key: "days", label: "Days", align: "right", responsive: "hidden lg:table-cell" },
  { key: "pf", label: "Profit Factor", align: "right", responsive: "hidden md:table-cell" },
  { key: "dd", label: "Max FL %", align: "right", responsive: "hidden lg:table-cell" },
  { key: "set", label: "Set Files", align: "center", responsive: "hidden md:table-cell" },
  { key: "track", label: "Track Record", align: "center" },
];

export function Dashboard() {
  const [data, setData] = useState<EAPerformance[] | null>(null);
  const [meta, setMeta] = useState<
    | (Pick<DashboardData, "generatedAt" | "warnings" | "sourceFiles" | "isMock" | "meta"> & {
        totals: DashboardData["totals"];
      })
    | null
  >(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [isRefreshing, setIsRefreshing] = useState(false);
  const { category, broker, status, search } = useFilters();
  const nicknameMap = useNicknames((s) => s.map);
  const aliveRef = useRef(true);

  const load = useCallback(async (force: boolean) => {
    setIsRefreshing(true);
    try {
      const d = await fetchDashboardData({ force });
      if (!aliveRef.current) return;
      setData(d.rows);
      setMeta({
        generatedAt: d.generatedAt,
        warnings: d.warnings,
        sourceFiles: d.sourceFiles,
        isMock: d.isMock,
        totals: d.totals,
      });
      setError(null);
    } catch (e) {
      if (!aliveRef.current) return;
      const fallback = getMockDashboardData();
      setData(fallback.rows);
      setMeta({
        generatedAt: fallback.generatedAt,
        warnings: fallback.warnings,
        sourceFiles: fallback.sourceFiles,
        isMock: true,
        totals: fallback.totals,
      });
      setError((e as Error).message ?? "Unknown error");
    } finally {
      if (aliveRef.current) {
        // Keep the spin animation visible briefly so users see feedback.
        setTimeout(() => aliveRef.current && setIsRefreshing(false), 600);
      }
    }
  }, []);

  useEffect(() => {
    aliveRef.current = true;
    load(false);
    const interval = window.setInterval(() => load(false), REFRESH_INTERVAL_SEC * 1000);
    return () => {
      aliveRef.current = false;
      window.clearInterval(interval);
    };
  }, [load]);


  const filtered = useMemo(() => {
    if (!data) return [];
    return data.filter((d) => {
      if (category !== "ALL" && d.eaCategory !== category) return false;
      if (broker !== "ALL" && d.broker !== broker) return false;
      if (status !== "ALL" && d.type !== status) return false;
      if (search && !d.strategy.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [data, category, broker, status, search]);

  const grouped = useMemo(() => {
    const map = new Map<EACategory, EAPerformance[]>();
    for (const ea of filtered) {
      const arr = map.get(ea.eaCategory) ?? [];
      arr.push(ea);
      map.set(ea.eaCategory, arr);
    }
    return CATEGORY_ORDER.map((cat) => ({ category: cat, items: map.get(cat) ?? [] })).filter(
      (g) => g.items.length > 0,
    );
  }, [filtered]);

  const toggleRow = (id: string) => {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const showGroupHeaders = category === "ALL" && grouped.length > 1;
  const colCount = COLUMNS.length;

  return (
    <div className="min-h-screen bg-background">
      <AggregatedStatsHeader
        data={filtered}
        totals={meta?.totals ?? null}
        generatedAt={meta?.generatedAt ?? null}
        isRefreshing={isRefreshing}
        onRefresh={() => load(true)}
      />

      <FilterBar data={data ?? []} />
      <CategoryTabs data={data ?? []} />

      {error && (
        <div className="mx-auto max-w-[1600px] px-6 pt-4">
          <div className="flex items-start gap-3 rounded-md border border-negative/40 bg-negative/10 px-4 py-3 text-sm text-negative">
            <AlertTriangle className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="min-w-0">
              <div className="font-semibold">
                백엔드 연결 실패: {error}. mock 데이터로 폴백합니다.
              </div>
            </div>
          </div>
        </div>
      )}

      {meta && meta.warnings.length > 0 && (
        <div className="mx-auto max-w-[1600px] px-6 pt-4">
          <div className="rounded-md border border-border bg-panel-elevated px-4 py-2 text-xs text-muted-foreground">
            <span className="font-semibold text-foreground">Warnings:</span>{" "}
            {meta.warnings.join(" · ")}
          </div>
        </div>
      )}

      <main className="mx-auto max-w-[1600px] px-6 py-6">
        <div className="overflow-hidden rounded-lg border border-border bg-panel">
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-border bg-panel-elevated">
                  {COLUMNS.map((c) => (
                    <th
                      key={c.key}
                      className={`px-3 py-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground ${
                        c.align === "right"
                          ? "text-right"
                          : c.align === "center"
                            ? "text-center"
                            : ""
                      } ${c.key === "strategy" ? "px-4" : ""} ${c.responsive ?? ""}`}
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!data && (
                  <tr>
                    <td colSpan={colCount} className="px-4 py-12 text-center text-xs text-muted-foreground">
                      Loading EA data...
                    </td>
                  </tr>
                )}
                {data && filtered.length === 0 && (
                  <tr>
                    <td colSpan={colCount} className="px-4 py-12 text-center text-xs text-muted-foreground">
                      No EAs match current filters.
                    </td>
                  </tr>
                )}
                {showGroupHeaders
                  ? grouped.map((group) => (
                      <GroupRows
                        key={group.category}
                        category={group.category}
                        items={group.items}
                        colSpan={colCount}
                        expanded={expanded}
                        onToggle={toggleRow}
                      />
                    ))
                  : filtered.map((ea) => (
                      <EATableRow
                        key={ea.id}
                        ea={ea}
                        expanded={expanded.has(ea.id)}
                        onToggle={() => toggleRow(ea.id)}
                        colSpan={colCount}
                      />
                    ))}
              </tbody>
            </table>
          </div>
        </div>

        {meta?.isMock && (
          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            Performance shown is from mock data. Set{" "}
            <code className="rounded bg-panel-elevated px-1 py-0.5 font-mono text-[10px]">
              VITE_USE_MOCK=false
            </code>{" "}
            to wire a live backend.
          </p>
        )}
        {meta && !meta.isMock && meta.generatedAt && (
          <p className="mt-4 text-center text-[11px] text-muted-foreground">
            Live data · generated at{" "}
            <span className="tabular-nums">{new Date(meta.generatedAt).toLocaleString()}</span>
          </p>
        )}
      </main>
    </div>
  );
}

interface GroupRowsProps {
  category: EACategory;
  items: EAPerformance[];
  colSpan: number;
  expanded: Set<string>;
  onToggle: (id: string) => void;
}

function GroupRows({ category, items, colSpan, expanded, onToggle }: GroupRowsProps) {
  return (
    <>
      <GroupSeparator category={category} count={items.length} colSpan={colSpan} />
      {items.map((ea) => (
        <EATableRow
          key={ea.id}
          ea={ea}
          expanded={expanded.has(ea.id)}
          onToggle={() => onToggle(ea.id)}
          colSpan={colSpan}
        />
      ))}
    </>
  );
}
