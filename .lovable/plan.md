

## Plan: Premium Reports Page Overhaul

### Scope
Upgrade all report components and the Reports page layout for a polished, overflow-safe, touch-friendly experience optimized for 390px-width Android devices (Galaxy A16).

---

### 1. Reports Page (`src/pages/Reports.tsx`)

**Layout fixes:**
- Add `overflow-hidden` to the outer scroll container to prevent horizontal bleed
- Wrap the content area in a consistent `max-w-lg mx-auto` container for centering on larger screens
- Add `animate-fade-in` class to each section for staggered load transitions
- Increase section spacing from `space-y-5` to `space-y-6` for breathing room
- Add section labels (styled headers) before chart groups: "Performance", "Inventory", "Activity"

**KPI grid:**
- Keep `grid-cols-2 gap-3` but add `auto-rows-fr` so cards are equal height

---

### 2. KPICard (`src/components/reports/KPICard.tsx`)

**Overflow protection:**
- Add `overflow-hidden` and `text-ellipsis` to the value display
- Use responsive text: `text-base` for values >10 chars, `text-lg` for >8, `text-xl` default
- Wrap currency prefix + value in a container with `overflow-hidden`

**Premium polish:**
- Increase accent line to `h-[3px]` with gradient (already exists, make it full opacity)
- Add subtle inner glow: `shadow-[inset_0_1px_0_0_rgba(255,255,255,0.05)]` in dark mode
- Add `transition-all duration-300` for smooth value changes
- Icon container: add subtle border `border border-primary/10`

---

### 3. InsightsPanel (`src/components/reports/InsightsPanel.tsx`)

**Overflow fix:**
- Ensure long product names truncate with `truncate` class (already applied, verify `max-w` constraint)
- Add `overflow-hidden` to outer card containers

**Premium upgrade:**
- Wrap in a Card with consistent styling matching other sections
- Add section icon in header matching other chart headers

---

### 4. MonthComparison (`src/components/reports/MonthComparison.tsx`)

**Overflow fix:**
- Add `overflow-hidden` to the Card
- Use `tabular-nums` on all numeric values for aligned columns
- Add `whitespace-nowrap` to prevent metric labels wrapping

**Premium:**
- Already well-structured, add `tabular-nums` font feature for numeric alignment

---

### 5. SalesTrendChart (`src/components/reports/SalesTrendChart.tsx`)

**Containment:**
- Already uses `overflow-hidden` on Card — verify chart margins don't bleed
- Reduce left margin from `-mx-2` to `-mx-1` to prevent edge clipping on small screens

**Premium:**
- Already polished — minor touch: increase chart height from `h-56` to `h-60` for more visual impact

---

### 6. ProductPerformanceChart (`src/components/reports/ProductPerformanceChart.tsx`)

**Overflow fix:**
- Truncate X-axis labels at 10 chars instead of 12 for 390px screens
- Reduce chart margin right to prevent label cutoff

---

### 7. TopSellingParts (`src/components/reports/TopSellingParts.tsx`)

**Overflow fix:**
- Add `overflow-hidden` to revenue values container
- Ensure SKU text truncates on small screens
- Add `tabular-nums` to numeric values

---

### 8. SalesHeatmap (`src/components/reports/SalesHeatmap.tsx`)

**Consistency:**
- Replace `CardHeader`/`CardTitle` pattern with the icon+title header pattern used by all other chart cards (icon in colored bg circle + semibold text)
- Change card classes from `border-border/50 card-shadow` to `border-border/30 shadow-sm rounded-2xl` for consistency

**Containment:**
- Keep `overflow-x-auto` for wide heatmaps — this is correct behavior

---

### 9. LowStockChart (`src/components/reports/LowStockChart.tsx`)

- Already well-contained — verify bar labels don't overflow on long part names (truncate at 15 chars)

---

### 10. InventoryDistributionChart (`src/components/reports/InventoryDistributionChart.tsx`)

- Verify pie chart labels don't overflow card on small screens — reduce outer label font if needed

---

### 11. Global CSS additions (`src/index.css`)

Add utility class for staggered fade-in:
```css
.animate-fade-in-up {
  animation: fade-in-up 0.4s ease-out both;
}
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(8px); }
  to { opacity: 1; transform: translateY(0); }
}
```

Add `.tabular-nums` utility if not already available via Tailwind (it is — just use the class).

---

### Files Modified
1. `src/pages/Reports.tsx` — layout, spacing, section headers, animations
2. `src/components/reports/KPICard.tsx` — overflow protection, refined sizing
3. `src/components/reports/InsightsPanel.tsx` — Card wrapper, consistent styling
4. `src/components/reports/MonthComparison.tsx` — tabular-nums, overflow
5. `src/components/reports/SalesTrendChart.tsx` — minor margin/height adjustments
6. `src/components/reports/ProductPerformanceChart.tsx` — label truncation
7. `src/components/reports/TopSellingParts.tsx` — overflow protection
8. `src/components/reports/SalesHeatmap.tsx` — consistent card styling
9. `src/index.css` — fade-in-up animation keyframes

