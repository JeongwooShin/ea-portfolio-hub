import type { EAPerformance } from "@/types/ea";
import { CATEGORY_ORDER, CATEGORY_META } from "@/types/ea";
import { useFilters } from "@/store/filters";
import { cn } from "@/lib/utils";

interface Props {
  data: EAPerformance[];
}

const TABS: { key: "ALL" | "architect" | "currencypros" | "other"; label: string }[] = [
  { key: "ALL", label: "All EAs" },
  { key: "architect", label: CATEGORY_META.architect.label },
  { key: "currencypros", label: CATEGORY_META.currencypros.label },
  { key: "other", label: CATEGORY_META.other.label },
];

export function CategoryTabs({ data }: Props) {
  const { category, setCategory } = useFilters();

  const counts = {
    ALL: data.length,
    architect: data.filter((d) => d.eaCategory === "architect").length,
    currencypros: data.filter((d) => d.eaCategory === "currencypros").length,
    other: data.filter((d) => d.eaCategory === "other").length,
  };

  return (
    <div className="border-b border-border bg-panel">
      <div className="mx-auto flex max-w-[1600px] items-end gap-1 overflow-x-auto px-6">
        {TABS.map((tab) => {
          const active = category === tab.key;
          const dotColor =
            tab.key === "ALL"
              ? null
              : CATEGORY_META[tab.key as keyof typeof CATEGORY_META].colorVar;
          return (
            <button
              key={tab.key}
              onClick={() => setCategory(tab.key)}
              className={cn(
                "relative flex items-center gap-2 whitespace-nowrap border-b-2 px-4 py-3 text-xs font-semibold uppercase tracking-wider transition-colors",
                active
                  ? "border-positive text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground",
              )}
            >
              {dotColor && (
                <span
                  className="h-2 w-2 rounded-full"
                  style={{ backgroundColor: dotColor }}
                />
              )}
              <span>{tab.label}</span>
              <span
                className={cn(
                  "rounded px-1.5 py-0.5 text-[10px] font-bold tabular-nums",
                  active
                    ? "bg-positive/15 text-positive"
                    : "bg-panel-elevated text-muted-foreground",
                )}
              >
                {counts[tab.key]}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
