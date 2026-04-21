/**
 * Centralized theme tokens for the Multi-EA Dashboard.
 *
 * Components MUST NOT hardcode color hex values. Use Tailwind semantic classes
 * (e.g. `text-positive`, `bg-panel`) wired through src/styles.css, or import
 * these constants when raw color strings are required (e.g. for Recharts).
 *
 * To re-skin the dashboard: update the oklch tokens in src/styles.css AND
 * the matching hex/rgb fallbacks here.
 */

export const chartColors = {
  positive: "#22C55E",
  negative: "#EF4444",
  warning: "#EAB308",
  neutral: "#6B7280",
  grid: "#1F2937",
  axis: "#4B5563",
  tooltipBg: "#131720",
  tooltipBorder: "#1F2937",
  balanceLine: "#22C55E",
  equityLine: "#3B82F6",
  volumeBar: "#374151",
  drawdownLine: "#EF4444",
} as const;

export type ChartColor = keyof typeof chartColors;
