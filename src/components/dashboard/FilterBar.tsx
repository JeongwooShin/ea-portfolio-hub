import { Search } from "lucide-react";
import { useFilters } from "@/store/filters";
import type { EAPerformance } from "@/types/ea";

interface Props {
  data: EAPerformance[];
}

export function FilterBar({ data }: Props) {
  const { category, broker, status, search, setCategory, setBroker, setStatus, setSearch } =
    useFilters();

  const brokers = Array.from(new Set(data.map((d) => d.broker))).sort();

  const baseSelect =
    "h-9 rounded-md border border-border bg-panel-elevated px-3 text-xs font-medium text-foreground outline-none transition-colors hover:border-positive/40 focus:border-positive";

  return (
    <div className="border-b border-border bg-panel">
      <div className="mx-auto flex max-w-[1600px] flex-wrap items-center gap-2 px-6 py-3">
        <select
          value={category}
          onChange={(e) => setCategory(e.target.value as typeof category)}
          className={baseSelect}
          aria-label="Filter by EA type"
        >
          <option value="ALL">All EA Types</option>
          <option value="architect">Architect EA</option>
          <option value="currencypros">Currency Pros</option>
          <option value="other">Other</option>
        </select>

        <select
          value={broker}
          onChange={(e) => setBroker(e.target.value)}
          className={baseSelect}
          aria-label="Filter by broker"
        >
          <option value="ALL">All Brokers</option>
          {brokers.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>

        <select
          value={status}
          onChange={(e) => setStatus(e.target.value as typeof status)}
          className={baseSelect}
          aria-label="Filter by status"
        >
          <option value="ALL">All Status</option>
          <option value="LIVE">Live</option>
          <option value="DEMO">Demo</option>
          <option value="PAUSED">Paused</option>
        </select>

        <div className="relative ml-auto w-full sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search strategy..."
            className="h-9 w-full rounded-md border border-border bg-panel-elevated pl-9 pr-3 text-xs text-foreground placeholder:text-muted-foreground outline-none transition-colors hover:border-positive/40 focus:border-positive"
          />
        </div>
      </div>
    </div>
  );
}
