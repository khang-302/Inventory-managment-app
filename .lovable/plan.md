## Plan: Restructure KPI Card Layout

### Current Issue

The title and icon are on the same row as the value, making the card cramped. The user wants a clear two-row layout: title+icon on top, value on its own line below.

### Change — `src/components/reports/KPICard.tsx`

Restructure the inner layout from a single flex row to a vertical stack:

1. **Row 1** — `flex justify-between items-center`: title (left) + icon (right)
2. **Spacer** — `mt-3` gap
3. **Row 2** — Full-width value display, large font, no truncation

```text
┌──────────────────────────┐
│ TOTAL REVENUE       🛒  │  ← row 1: title + icon
│                          │  ← gap (mt-3)
│ Rs 523,904,52658585858   │  ← row 2: full value
│                          │  ← bottom padding (pb-5)
└──────────────────────────┘
```

The key structural change replaces the current single `flex items-start` container (where title+value are stacked in a left column beside the icon) with two separate rows — putting the icon on the title row and giving the value its own full-width line underneath.

Font scaling and `break-all` remain to handle extremely long numbers.