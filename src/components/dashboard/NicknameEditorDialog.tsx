import { useEffect, useMemo, useState } from "react";
import { Pencil } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useNicknames, type NicknameMap } from "@/store/nicknames";
import type { EAPerformance } from "@/types/ea";
import { toast } from "sonner";

interface Props {
  /** Original strategy rows (use `originalStrategy` as the source-of-truth name). */
  rows: EAPerformance[];
}

export function NicknameEditorDialog({ rows }: Props) {
  const { map, replaceAll } = useNicknames();
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState<NicknameMap>({});

  // Reset draft each time the dialog opens so cancel actually cancels.
  useEffect(() => {
    if (open) setDraft({ ...map });
  }, [open, map]);

  // De-duplicate: one row per strategy id, keep first occurrence.
  const uniqueRows = useMemo(() => {
    const seen = new Set<string>();
    const out: EAPerformance[] = [];
    for (const r of rows) {
      if (seen.has(r.id)) continue;
      seen.add(r.id);
      out.push(r);
    }
    return out;
  }, [rows]);

  const handleSave = () => {
    replaceAll(draft);
    setOpen(false);
    toast.success("별명이 저장되었습니다");
  };

  const handleClearAll = () => {
    setDraft({});
  };

  const handleCancel = () => {
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center gap-1.5 rounded-md border border-border bg-panel-elevated px-3 py-2 text-xs font-semibold text-foreground transition-colors hover:border-positive/50 hover:text-positive"
        >
          <Pencil className="h-3.5 w-3.5" />
          별명 편집
        </button>
      </DialogTrigger>
      <DialogContent className="max-h-[85vh] max-w-3xl overflow-hidden p-0">
        <DialogHeader className="border-b border-border px-6 py-4">
          <DialogTitle>EA 별명 편집</DialogTitle>
          <DialogDescription>
            표시 이름만 바꿉니다. 백엔드 데이터에는 영향 없습니다.
          </DialogDescription>
        </DialogHeader>

        <div className="max-h-[55vh] overflow-y-auto px-6 py-4">
          <table className="w-full text-left text-xs">
            <thead className="sticky top-0 bg-background">
              <tr className="border-b border-border">
                <th className="py-2 pr-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  ID
                </th>
                <th className="py-2 pr-3 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  원본 이름
                </th>
                <th className="py-2 text-[10px] font-bold uppercase tracking-wider text-muted-foreground">
                  별명
                </th>
              </tr>
            </thead>
            <tbody>
              {uniqueRows.map((r) => {
                const original = r.originalStrategy ?? r.strategy;
                return (
                  <tr key={r.id} className="border-b border-border/40">
                    <td className="py-2 pr-3 font-mono text-[10px] text-muted-foreground">
                      {r.id.slice(0, 16)}
                    </td>
                    <td className="py-2 pr-3 text-muted-foreground">{original}</td>
                    <td className="py-2">
                      <Input
                        value={draft[r.id] ?? ""}
                        placeholder={original}
                        onChange={(e) =>
                          setDraft((prev) => ({ ...prev, [r.id]: e.target.value }))
                        }
                        className="h-8 text-xs"
                      />
                    </td>
                  </tr>
                );
              })}
              {uniqueRows.length === 0 && (
                <tr>
                  <td colSpan={3} className="py-8 text-center text-muted-foreground">
                    표시할 EA가 없습니다.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        <DialogFooter className="border-t border-border px-6 py-3">
          <Button variant="ghost" onClick={handleClearAll}>
            초기화
          </Button>
          <Button variant="outline" onClick={handleCancel}>
            취소
          </Button>
          <Button onClick={handleSave}>저장</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
