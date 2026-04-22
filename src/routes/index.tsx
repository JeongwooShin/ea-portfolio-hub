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
  const unlocked = useAuth((s) => s.unlocked);
  if (!unlocked) return <PasswordGate />;
  return <Dashboard />;
}
