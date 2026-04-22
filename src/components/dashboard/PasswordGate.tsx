import { useState, type FormEvent } from "react";
import { Lock } from "lucide-react";
import { PASSWORD_HASH, sha256Hex, useAuth } from "@/store/auth";
import { cn } from "@/lib/utils";

export function PasswordGate() {
  const unlock = useAuth((s) => s.unlock);
  const [pw, setPw] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (busy) return;
    setBusy(true);
    setError(null);
    try {
      const hash = await sha256Hex(pw);
      if (hash === PASSWORD_HASH) {
        unlock();
      } else {
        setError("비밀번호가 올바르지 않습니다.");
        setPw("");
      }
    } catch {
      setError("비밀번호가 올바르지 않습니다.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm rounded-lg border border-border bg-panel p-6 shadow-lg">
        <div className="mb-5 flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-md bg-positive/15 text-positive">
            <Lock className="h-5 w-5" strokeWidth={2.5} />
          </div>
          <div>
            <h1 className="text-base font-semibold tracking-tight text-foreground">
              EA Portfolio Dashboard
            </h1>
            <p className="text-xs text-muted-foreground">비밀번호를 입력하세요</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col gap-3">
          <input
            type="password"
            autoFocus
            autoComplete="current-password"
            value={pw}
            onChange={(e) => setPw(e.target.value)}
            placeholder="Password"
            className={cn(
              "w-full rounded-md border border-border bg-panel-elevated px-3 py-2 text-sm text-foreground",
              "placeholder:text-muted-foreground focus:border-positive/60 focus:outline-none",
              "focus:ring-1 focus:ring-positive/40",
            )}
          />
          {error && <p className="text-xs text-negative">{error}</p>}
          <button
            type="submit"
            disabled={busy || pw.length === 0}
            className={cn(
              "inline-flex items-center justify-center gap-2 rounded-md bg-positive px-3 py-2 text-xs font-semibold text-positive-foreground",
              "transition-opacity hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50",
            )}
          >
            {busy ? "확인 중..." : "잠금 해제"}
          </button>
        </form>
      </div>
    </div>
  );
}
