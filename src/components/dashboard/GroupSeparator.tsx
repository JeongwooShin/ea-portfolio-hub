import type { EACategory } from "@/types/ea";
import { CATEGORY_META } from "@/types/ea";

interface Props {
  category: EACategory;
  count: number;
  colSpan: number;
}

export function GroupSeparator({ category, count, colSpan }: Props) {
  const meta = CATEGORY_META[category];
  return (
    <tr className="bg-panel-elevated/80">
      <td colSpan={colSpan} className="px-4 py-2.5">
        <div className="flex items-center gap-2.5">
          <span
            className="h-2.5 w-2.5 rounded-full"
            style={{ backgroundColor: meta.colorVar }}
          />
          <span className="text-xs font-bold uppercase tracking-wider text-foreground">
            {meta.label}
          </span>
          <span className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
            · {count} {count === 1 ? "strategy" : "strategies"}
          </span>
        </div>
      </td>
    </tr>
  );
}
