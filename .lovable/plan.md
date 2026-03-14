

## Plan: Redesign Reports/Analytics Page with Sale Type Filtering & Period Comparison

### Discovery

**How sale types are distinguished in the database:**
- **New Sale (Regular)**: `sale.partId` is a valid UUID (inventory-linked)
- **Quick Sale**: `sale.partId === ''` and `sale.notes` starts with `[QuickSell]`

No schema changes needed — we can filter on `partId` to separate the two sale types.

### Architecture

```text
┌─────────────────────────────────────────┐
│  Header: "Analytics"                     │
├─────────────────────────────────────────┤
│  [Day] [Week] [Month] [Year] [Custom]   │  ← Compact pill selector (replaces dropdown)
├─────────────────────────────────────────┤
│  [All Sales] [New Sale] [Quick Sale]    │  ← Sale type toggle (segmented control)
├─────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────┐            │
│  │ Revenue  │  │ Profit   │  KPI Cards  │
│  ├──────────┤  ├──────────┤            │
│  │ Orders   │  │ Items    │            │
│  └──────────┘  └──────────┘            │
├─────────────────────────────────────────┤
│  Period Comparison Bar                  │  ← Current vs Previous (% change)
├─────────────────────────────────────────┤
│  Quick Insights Panel                   │
├─────────────────────────────────────────┤
│  Revenue & Profit Trend Chart           │
│  Product Performance Chart              │
│  Top Selling Parts                      │
│  Orders Per Period Chart (NEW)          │
│  Items Sold Trend Chart (NEW)           │
├─────────────────────────────────────────┤
│  Inventory Section (unchanged)          │
├─────────────────────────────────────────┤
│  Sales Heatmap                          │
├─────────────────────────────────────────┤
│  [PDF] [Excel] [CSV]  Export buttons    │
└─────────────────────────────────────────┘
```

### Changes

#### 1. New Component: `SaleTypeToggle` 
**File:** `src/components/reports/SaleTypeToggle.tsx`

A segmented control with three options: **All** | **New Sale** | **Quick Sale**, using distinct colors:
- All: primary
- New Sale: blue icon (ShoppingBag)
- Quick Sale: amber icon (Zap)

Props: `saleType: 'all' | 'new' | 'quick'`, `onChange`, plus count badges showing order count for each type.

#### 2. New Component: `PeriodComparisonBar`
**File:** `src/components/reports/PeriodComparisonBar.tsx`

Replaces the full `MonthComparison` table with a compact, always-visible comparison strip showing 4 metrics (Revenue, Profit, Orders, Items) with up/down arrows and percentage changes vs the equivalent previous period. Adapts to the selected date range (not just month-over-month).

#### 3. New Component: `OrdersTrendChart`
**File:** `src/components/reports/OrdersTrendChart.tsx`

Bar chart showing order count per day/week/month. When sale type is filtered, shows only that type. Uses Recharts BarChart.

#### 4. New Component: `ItemsSoldChart`
**File:** `src/components/reports/ItemsSoldChart.tsx`

Area chart showing cumulative or per-period items sold count.

#### 5. Refactor: `TimeRangeSelector` → Compact Pill Bar
**File:** `src/components/reports/TimeRangeSelector.tsx`

Replace the dropdown with a horizontal scrollable pill row: **Day | 3D | Week | Month | 3M | 6M | Year | Custom**. The custom option opens the existing calendar pickers. Much faster to switch between ranges.

#### 6. Major Refactor: `Reports.tsx`
**File:** `src/pages/Reports.tsx`

Key changes:
- **Add `saleType` state** (`'all' | 'new' | 'quick'`)
- **Filter logic**: `filteredSales` gains a second filter layer:
  - `'new'`: `sale.partId !== ''`  
  - `'quick'`: `sale.partId === ''`
  - `'all'`: no filter
- **Period comparison**: Compute previous-period metrics using the same range duration offset, filtered by sale type
- **All derived data** (salesByDate, productPerformance, topParts, etc.) computed from the filtered set — already works since they derive from `filteredSales`
- **Summary fetch**: Add sale-type-aware summary computation (local, not service call, since the service doesn't know about sale types)
- **Charts get color props**: Pass sale-type-specific accent colors to trend charts
- **Export**: Pass current `saleType` filter label into export filenames/headers
- **Layout**: Tighter spacing, consistent `rounded-2xl` cards, staggered animations preserved

#### 7. Update: `SalesTrendChart`
**File:** `src/components/reports/SalesTrendChart.tsx`

Add optional `accentColor` prop to customize the primary series color based on sale type (blue for New, amber for Quick, default for All).

#### 8. Update: `InsightsPanel`
**File:** `src/components/reports/InsightsPanel.tsx`

No structural changes — it already receives computed props. Will automatically reflect filtered data.

#### 9. Update: `components/reports/index.ts`
Export the new components.

### Sale Type Filtering — Technical Detail

```typescript
// In Reports.tsx
const [saleType, setSaleType] = useState<'all' | 'new' | 'quick'>('all');

const filteredSales = useMemo(() => {
  let result = sales.filter(s => {
    const d = new Date(s.createdAt);
    return d >= selectedRange.startDate && d <= selectedRange.endDate;
  });
  if (saleType === 'new') result = result.filter(s => s.partId && s.partId.trim() !== '');
  if (saleType === 'quick') result = result.filter(s => !s.partId || s.partId.trim() === '');
  return result;
}, [sales, selectedRange, saleType]);
```

All downstream computations (summary, charts, topParts, heatmap) already derive from `filteredSales`, so they'll automatically reflect the selected sale type.

### Period Comparison Logic

```typescript
// Compute equivalent previous period
const rangeDays = Math.ceil((end - start) / DAY_MS);
const prevStart = new Date(start.getTime() - rangeDays * DAY_MS);
const prevEnd = new Date(start.getTime() - 1);
// Filter previous period sales with same saleType filter
// Compare: revenue, profit, orders, items
```

### What Stays Unchanged
- All existing chart components (internal logic unchanged)
- Sale recording workflows (RecordSale, QuickSellModal)
- Database schema
- Export utility functions (just receive filtered data)
- Inventory section of reports

### Files Modified/Created
1. **Create** `src/components/reports/SaleTypeToggle.tsx`
2. **Create** `src/components/reports/PeriodComparisonBar.tsx`
3. **Create** `src/components/reports/OrdersTrendChart.tsx`
4. **Create** `src/components/reports/ItemsSoldChart.tsx`
5. **Modify** `src/components/reports/TimeRangeSelector.tsx` — pill bar redesign
6. **Modify** `src/pages/Reports.tsx` — sale type state, filtering, layout
7. **Modify** `src/components/reports/SalesTrendChart.tsx` — accent color prop
8. **Modify** `src/components/reports/index.ts` — new exports

