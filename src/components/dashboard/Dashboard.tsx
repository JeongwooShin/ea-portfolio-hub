import { useEffect, useMemo, useState } from "react";
import { fetchEAData } from "@/api/dashboardData";
import type { EAPerformance } from "@/types/ea";
import { useFilters } from "@/store/filters";
import { AggregatedStatsHeader } from "./AggregatedStatsHeader";
import { FilterBar } from "./FilterBar";
import { EATableRow } from "./EATableRow";

const COLUMNS: { key: string; label: string; align?: "right" | "center" }[] = [
  { key: "strategy", label: "Strategy" },
  { key: "type", label: "Type" },
  { key: "broker", label: "Broker" },
  { key: "deposit", label: "Deposit", align: "right" },
  { key: "balance", label: "Balance", align: "right" },
  { key: "floating", label: "Floating P/L", align: "right" },
  { key: "withdrawals", label: "Withdrawals", align: "right" },
  { key: "gain", label: "Gain %", align: "right" },
  { key: "monthly", label: "Monthly %", align: "right" },
  { key: "trades", label: "Trades", align: "right" },
  { key: "days", label: "Days", align: "right" },
  { key: "pf", label: "Profit Factor", align: "right" },
  { key: "dd", label: "Max FL %", align: "right" },
  { key: "set", label: "Set Files", align: "center" },
  { key: "track", label: "Track Record", align: "center" },
];

export function Dashboard() {
  const [data, setData] = useState<EAPerformance[] | null>(null);
  const [error, setError] = useState<string | null>(null);
  const { category, broker, status, search } = useFilters();

  useEffect(() => {
    let active = true;
    fetchEAData()
      .then((d) => active && setData(d))
      .catch((e) => active && setError(e.message ?? "Failed to load"));
    return () => {
      active = false;
    };
  }, []);

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

  return (
    <div className="min-h-screen bg-background">
      <AggregatedStatsHeader data={data ?? []} />
      <FilterBar data={data ?? []} />

      <main className="mx-auto max-w-[1600px] px-6 py-6">
        <div className="overflow-hidden rounded-lg border border-border bg-panel">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[1400px] text-left">
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
                      } ${c.key === "strategy" ? "px-4" : ""}`}
                    >
                      {c.label}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {!data && !error && (
                  <tr>
                    <td colSpan={COLUMNS.length} className="px-4 py-12 text-center text-xs text-muted-foreground">
                      Loading EA data...
                    </td>
                  </tr>
                )}
                {error && (
                  <tr>
                    <td colSpan={COLUMNS.length} className="px-4 py-12 text-center text-xs text-negative">
                      {error}
                    </td>
                  </tr>
                )}
                {data && filtered.length === 0 && (
                  <tr>
                    <td colSpan={COLUMNS.length} className="px-4 py-12 text-center text-xs text-muted-foreground">
                      No EAs match current filters.
                    </td>
                  </tr>
                )}
                {filtered.map((ea) => (
                  <EATableRow key={ea.id} ea={ea} />
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <p className="mt-4 text-center text-[11px] text-muted-foreground">
          Performance shown is from mock data. Replace{" "}
          <code className="rounded bg-panel-elevated px-1 py-0.5 font-mono text-[10px]">
            src/api/dashboardData.ts
          </code>{" "}
          to wire a live backend.
        </p>
      </main>
    </div>
  );
}
