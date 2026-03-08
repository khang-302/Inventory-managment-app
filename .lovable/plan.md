

# Dashboard UI Redesign Plan

## Current State
The dashboard has basic summary cards, quick actions, low stock alerts, recent activity, and a monthly profit card. The design is functional but flat — cards lack visual depth, there are no data visualizations, and animations are minimal.

## Redesign Approach

### 1. Summary KPI Cards (Upgraded)
Replace the simple `SummaryCard` component with a richer design inspired by the existing `KPICard` from reports:
- Colored accent line at the top of each card (unique per metric)
- Icon in a tinted circular background (top-right)
- Uppercase small label, bold large value
- Count-up animation using existing `useCountUp` hook
- Hover: subtle `translateY(-2px)` lift with shadow increase
- Staggered fade-in on load (60ms increments)

### 2. Quick Actions (Polished)
- Rounded-2xl with subtle gradient background
- Icon gets a tinted circle background
- Hover: scale 1.05 + shadow
- Active: scale 0.97 press effect

### 3. Sales Mini Chart (New Section)
Add a compact sales trend area chart between Quick Actions and Low Stock:
- Use Recharts `AreaChart` (already installed) showing last 7 days of sales
- Gradient fill matching primary color
- Minimal: no axes labels, just the curve with tooltip on tap
- "Sales This Week" header with total value
- Wrapped in a card with consistent styling
- Data sourced from `sales` table via AppContext (add a `weeklySales` computed value)

### 4. Inventory Status Bar (New Section)
A horizontal segmented bar showing stock health at a glance:
- Green segment: in-stock count
- Amber segment: low-stock count  
- Red segment: out-of-stock count
- Labels below each segment
- Compact single-card design

### 5. Low Stock Alerts (Enhanced)
- Add a progress bar showing stock level vs min stock (visual urgency)
- Slight left border color (red for 0, amber for low)
- Hover lift effect

### 6. Recent Activity (Refined)
- Keep existing design (already well-designed with color bars and icons)
- Add staggered fade-in per item

### 7. Monthly Profit Card (Upgraded)
- Merge into a "Monthly Overview" card with profit + revenue side by side
- Add a small sparkline using Recharts `LineChart`

### 8. Global Animation & Spacing
- Each dashboard section wrapped with staggered `animate-fade-in` (same pattern as Settings page)
- Consistent `space-y-5` between sections
- Section headers: uppercase tracking-wider text-xs font-semibold

## Files to Modify

1. **`src/pages/Dashboard.tsx`** — Full rewrite of the dashboard layout with new sections, upgraded card components, staggered animations, mini chart, and inventory status bar.

2. **`src/contexts/AppContext.tsx`** — Add `weeklySales` (last 7 days daily totals) and `stockDistribution` (in-stock/low/out counts) to the context so the dashboard can render charts without extra DB queries.

3. **`src/types/index.ts`** — Add `WeeklySaleDay` and `StockDistribution` interfaces to `DashboardStats` or as separate types.

## Performance Notes
- All animations use CSS only (existing Tailwind keyframes) — no JS animation libs
- Recharts mini-chart is lightweight (already in bundle)
- Count-up uses existing `useCountUp` hook with `requestAnimationFrame`
- Data is pre-computed in context, no extra DB round-trips in the component

