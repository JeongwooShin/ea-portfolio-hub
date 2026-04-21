import { useState } from "react";
import { ChevronDown, Download } from "lucide-react";
import type { EAPerformance } from "@/types/ea";
import { StatusBadge } from "./StatusBadge";
import { ExpandedChartPanel } from "./ExpandedChartPanel";
import {
  formatCompact,
  formatInt,
  formatNumber,
  formatPercent,
  maskAccount,
  plToneClass,
} from "@/utils/format";
import { cn } from "@/lib/utils";

interface Props {
  ea: EAPerformance;
}

export function EATableRow({ ea }: Props) {
  const [open, setOpen] = useState(false);

  const handleDownload = () => {
    if (!ea.setFileUrl) return;
    // Trigger browser download via anchor
    const a = document.createElement("a");
    a.href = ea.setFileUrl;
    a.download = ea.setFileUrl.split("/").pop() ?? "set-file.set";
    a.click();
  };

  return (
    <>
      <tr className="group border-b border-border/60 transition-colors hover:bg-panel-elevated/60">
        <td className="px-4 py-3">
          <div className="font-semibold text-foreground">{ea.strategy}</div>
          <div className="mt-0.5 text-[11px] text-muted-foreground">
            {ea.broker} {maskAccount(ea.accountNumber)}
          </div>
        </td>
        <td className="px-3 py-3">
          <StatusBadge status={ea.type} />
        </td>
        <td className="px-3 py-3 text-xs text-muted-foreground">{ea.broker}</td>
        <td className="px-3 py-3 text-right tabular-nums text-xs text-foreground">
          {formatCompact(ea.deposit)}
        </td>
        <td className="px-3 py-3 text-right tabular-nums text-xs font-semibold text-foreground">
          {formatCompact(ea.balance)}
        </td>
        <td
          className={cn(
            "px-3 py-3 text-right tabular-nums text-xs font-semibold",
            plToneClass(ea.floatingPL),
          )}
        >
          {ea.floatingPL === 0 ? "—" : formatCompact(ea.floatingPL)}
        </td>
        <td className="px-3 py-3 text-right tabular-nums text-xs text-muted-foreground">
          {formatCompact(ea.withdrawals)}
        </td>
        <td
          className={cn(
            "px-3 py-3 text-right tabular-nums text-xs font-bold",
            plToneClass(ea.gainPercent),
          )}
        >
          {formatPercent(ea.gainPercent)}
        </td>
        <td
          className={cn(
            "px-3 py-3 text-right tabular-nums text-xs font-semibold",
            plToneClass(ea.monthlyGainPercent),
          )}
        >
          {formatPercent(ea.monthlyGainPercent)}
        </td>
        <td className="px-3 py-3 text-right tabular-nums text-xs text-foreground">
          {formatInt(ea.trades)}
        </td>
        <td className="px-3 py-3 text-right tabular-nums text-xs text-muted-foreground">
          {ea.days}
        </td>
        <td className="px-3 py-3 text-right tabular-nums text-xs text-foreground">
          {ea.profitFactor === 0 ? "—" : formatNumber(ea.profitFactor)}
        </td>
        <td className="px-3 py-3 text-right tabular-nums text-xs text-negative">
          {ea.maxDrawdownPercent === 0 ? "—" : `−${formatNumber(ea.maxDrawdownPercent)}%`}
        </td>
        <td className="px-3 py-3 text-center">
          <button
            onClick={handleDownload}
            disabled={!ea.setFileUrl}
            className="inline-flex items-center gap-1 rounded border border-border bg-panel-elevated px-2 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground transition-colors hover:border-positive/50 hover:text-positive disabled:cursor-not-allowed disabled:opacity-40"
          >
            <Download className="h-3 w-3" />
            Download
          </button>
        </td>
        <td className="px-3 py-3 text-center">
          <button
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-label={open ? "Collapse track record" : "Expand track record"}
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-border bg-panel-elevated text-muted-foreground transition-all hover:border-positive/50 hover:text-positive"
          >
            <ChevronDown
              className={cn("h-3.5 w-3.5 transition-transform", open && "rotate-180")}
            />
          </button>
        </td>
      </tr>
      {open && (
        <tr>
          <td colSpan={15} className="p-0">
            <ExpandedChartPanel ea={ea} />
          </td>
        </tr>
      )}
    </>
  );
}
