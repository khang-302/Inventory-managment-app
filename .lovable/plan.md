

## Plan: Add New Sale vs Quick Sale Comparison Widget to Dashboard

### What
A compact card on the Dashboard showing today's performance split between New Sale and Quick Sale — revenue, orders, and profit for each type side-by-side.

### How

**File: `src/pages/Dashboard.tsx`**

1. Import `db` from `@/db/database` and `useLiveQuery` from `dexie-react-hooks`, plus `ShoppingBag` and `Zap` icons.

2. Inside `Dashboard()`, query today's sales via `useLiveQuery` and split them:
   - **New Sales**: `sale.partId && sale.partId.trim() !== ''`
   - **Quick Sales**: `!sale.partId || sale.partId.trim() === ''`

3. Compute per-type metrics: `revenue`, `profit`, `orders` count.

4. Add a new section between the **Weekly Sales Mini Chart** and the **Inventory Status Bar** (~line 185). The widget renders as a `rounded-2xl` Card with:
   - Header: "Today's Sales Breakdown"
   - Two columns side-by-side:
     - **Left column** (blue accent): ShoppingBag icon, "New Sale" label, revenue, profit, order count
     - **Right column** (amber accent): Zap icon, "Quick Sale" label, revenue, profit, order count
   - A thin vertical divider between columns
   - Uses `useCurrencyFormat` for formatted values
   - Matches existing card styling (border-border/40, shadow-sm, staggered animation)

No new files needed — this is a self-contained widget within Dashboard.tsx.

