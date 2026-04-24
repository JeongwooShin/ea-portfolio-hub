import { useEffect } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { Dashboard } from "@/components/dashboard/Dashboard";
import { PasswordGate } from "@/components/dashboard/PasswordGate";
import { useAuth } from "@/store/auth";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "EA Portfolio Dashboard — Multi-Account Live Trading Performance" },
      {
        name: "description",
        content:
          "Real-time performance tracking for multiple Expert Advisors across brokers and accounts. Monitor balance, floating P/L, drawdown, and trade history at a glance.",
      },
      { property: "og:title", content: "EA Portfolio Dashboard" },
      {
        property: "og:description",
        content:
          "Multi-EA live trading performance dashboard with per-strategy charts and stats.",
      },
    ],
  }),
  component: GatedDashboard,
});

function GatedDashboard() {
  const status = useAuth((s) => s.status);
  const refresh = useAuth((s) => s.refresh);

  useEffect(() => {
    refresh();
  }, [refresh]);

  if (status === "loading") {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background">
        <p className="text-xs text-muted-foreground">Loading…</p>
      </div>
    );
  }
  if (status === "unauthenticated") return <PasswordGate />;
  return <Dashboard />;
}
