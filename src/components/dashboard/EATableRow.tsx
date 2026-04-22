import { ChevronDown, Download } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import type { EAPerformance } from "@/types/ea";
import { CATEGORY_META } from "@/types/ea";
import { useNicknames } from "@/store/nicknames";
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
  expanded: boolean;
  onToggle: () => void;
  colSpan: number;
}

export function EATableRow({ ea, expanded, onToggle, colSpan }: Props) {
  const handleDownload = () => {
    if (!ea.setFileUrl) return;
    const a = document.createElement("a");
    a.href = ea.setFileUrl;
    a.download = ea.setFileUrl.split("/").pop() ?? "set-file.set";
    a.click();
  };

  const catMeta = CATEGORY_META[ea.eaCategory];
  const nicknameMap = useNicknames((s) => s.map);
  const nickname = nicknameMap[ea.id];
  const original = ea.originalStrategy ?? ea.strategy;
  const displayName = nickname && nickname.trim().length > 0 ? nickname : ea.strategy;

  return (
    <>
      <tr className="group border-b border-border/60 transition-colors hover:bg-panel-elevated/60">
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <span
              className="h-2 w-2 shrink-0 rounded-full"
              style={{ backgroundColor: catMeta.colorVar }}
              title={catMeta.label}
            />
            <div className="min-w-0">
              <div className="truncate font-semibold text-foreground">{displayName}</div>
              {nickname && (
                <div className="mt-0.5 truncate text-[10px] text-muted-foreground/80">
                  원본: {original}
                </div>
              )}
              <div className="mt-0.5 text-[11px] text-muted-foreground">
                {ea.broker} {maskAccount(ea.accountNumber)}
              </div>
            </div>
          </div>
        </td>
        <td className="px-3 py-3">
          <StatusBadge status={ea.type} />
        </td>
        <td className="hidden px-3 py-3 text-xs text-muted-foreground md:table-cell">
          {ea.broker}
        </td>
        <td className="hidden px-3 py-3 text-right tabular-nums text-xs text-foreground lg:table-cell">
          {ea.depositAvailable === false ? "—" : formatCompact(ea.deposit)}
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
        <td
          className={cn(
            "px-3 py-3 text-right tabular-nums text-xs font-semibold",
            plToneClass(ea.realizedPL),
          )}
        >
          {ea.realizedPL === 0 ? "—" : formatCompact(ea.realizedPL)}
        </td>
        <td className="hidden px-3 py-3 text-right tabular-nums text-xs text-muted-foreground lg:table-cell">
          {ea.withdrawalsAvailable === false ? "—" : formatCompact(ea.withdrawals)}
        </td>
        <td
          className={cn(
            "px-3 py-3 text-right tabular-nums text-xs font-bold",
            plToneClass(ea.gainPercent),
          )}
        >
          {ea.balance === 0 ? "—" : formatPercent(ea.gainPercent)}
        </td>
        <td
          className={cn(
            "hidden px-3 py-3 text-right tabular-nums text-xs font-semibold md:table-cell",
            plToneClass(ea.monthlyGainPercent),
          )}
          title={ea.monthlyGainAvailable === false ? "월별 스냅샷 미수집" : undefined}
        >
          {ea.monthlyGainAvailable === false ? "—" : formatPercent(ea.monthlyGainPercent)}
        </td>
        <td className="px-3 py-3 text-right tabular-nums text-xs text-foreground">
          {formatInt(ea.trades)}
        </td>
        <td className="hidden px-3 py-3 text-right tabular-nums text-xs text-muted-foreground lg:table-cell">
          {ea.days}
        </td>
        <td className="hidden px-3 py-3 text-right tabular-nums text-xs text-foreground md:table-cell">
          {ea.profitFactor === 0 ? "—" : formatNumber(ea.profitFactor)}
        </td>
        <td className="hidden px-3 py-3 text-right tabular-nums text-xs text-negative lg:table-cell">
          {ea.maxDrawdownPercent === 0 ? "—" : `−${formatNumber(ea.maxDrawdownPercent)}%`}
        </td>
        <td className="hidden px-3 py-3 text-center md:table-cell">
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
            onClick={onToggle}
            aria-expanded={expanded}
            aria-label={expanded ? "Collapse track record" : "Expand track record"}
            className="inline-flex h-7 w-7 items-center justify-center rounded border border-border bg-panel-elevated text-muted-foreground transition-all hover:border-positive/50 hover:text-positive"
          >
            <ChevronDown
              className={cn("h-3.5 w-3.5 transition-transform", expanded && "rotate-180")}
            />
          </button>
        </td>
      </tr>
      <AnimatePresence initial={false}>
        {expanded && (
          <tr>
            <td colSpan={colSpan} className="p-0">
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.25, ease: "easeOut" }}
                className="overflow-hidden"
              >
                <ExpandedChartPanel ea={ea} />
              </motion.div>
            </td>
          </tr>
        )}
      </AnimatePresence>
    </>
  );
}
