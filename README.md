# EA Portfolio Dashboard

A single-page React + TanStack Start dashboard that aggregates performance for
multiple Expert Advisors (EAs) running across different brokers and accounts.

## Stack

- React 19 + TanStack Start (Vite)
- Tailwind CSS v4 (semantic tokens in `src/styles.css`)
- Recharts for equity / volume / drawdown visuals
- Zustand for filter state
- lucide-react icons

## Project layout

```
src/
├── api/dashboardData.ts        # SINGLE source of EA data (mock now, real later)
├── types/ea.ts                 # EAPerformance contract
├── theme/colors.ts             # Chart color tokens (raw hex for Recharts)
├── styles.css                  # Tailwind theme + design tokens (oklch)
├── utils/format.ts             # Currency / percent / date formatters
├── store/filters.ts            # Zustand filter store
├── components/dashboard/
│   ├── Dashboard.tsx           # Page composition
│   ├── AggregatedStatsHeader.tsx
│   ├── FilterBar.tsx
│   ├── EATableRow.tsx
│   ├── ExpandedChartPanel.tsx  # Tabs + equity/volume chart
│   └── StatusBadge.tsx
└── routes/index.tsx            # TanStack route
```

## How to swap mock data for a real API

Edit **only** `src/api/dashboardData.ts`. Replace the `fetchEAData` body:

```ts
export async function fetchEAData(): Promise<EAPerformance[]> {
  const res = await fetch("/api/ea-stats");
  if (!res.ok) throw new Error("Failed to fetch EA stats");
  return (await res.json()) as EAPerformance[];
}
```

The backend must return JSON matching the `EAPerformance` interface in
`src/types/ea.ts`. Numeric fields are plain numbers (no formatting), dates are
ISO 8601 strings, and `equityCurve` is sorted ascending.

## How to add a new EA category

1. Extend the `EACategory` union in `src/types/ea.ts`
   (e.g. `"architect" | "currencypros" | "trendhunter" | "other"`).
2. Add the matching `<option>` in `src/components/dashboard/FilterBar.tsx`.
3. Add new mock entries (or backend records) tagged with the new category.

No other file needs to change — filtering, headers, and charts pick it up
automatically.

## How to deploy to a static host (e.g. nginx on a VPS)

```bash
npm run build
# Output: .output/public  (or dist/  depending on TanStack version)
rsync -avz --delete .output/public/ user@vps:/var/www/ea-dashboard/
```

Nginx site config:

```nginx
server {
    listen 80;
    server_name dashboard.example.com;
    root /var/www/ea-dashboard;
    index index.html;
    location / { try_files $uri $uri/ /index.html; }
}
```

## Theming

All colors live in `src/styles.css` as oklch tokens. Components use semantic
Tailwind classes (`text-positive`, `bg-panel`, `text-status-live-foreground`)
— never hardcoded hex. Recharts colors mirror these in `src/theme/colors.ts`.

To re-skin: update both files.
