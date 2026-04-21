import type { EAStatus } from "@/types/ea";
import { cn } from "@/lib/utils";

const styles: Record<EAStatus, string> = {
  LIVE: "bg-status-live text-status-live-foreground ring-1 ring-inset ring-positive/30",
  DEMO: "bg-status-demo text-status-demo-foreground ring-1 ring-inset ring-warning/30",
  PAUSED: "bg-status-paused text-status-paused-foreground ring-1 ring-inset ring-neutral/30",
};

export function StatusBadge({ status }: { status: EAStatus }) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        styles[status],
      )}
    >
      {status === "LIVE" && (
        <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-positive" />
      )}
      {status}
    </span>
  );
}
