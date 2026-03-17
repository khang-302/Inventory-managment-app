

## Plan: Hard Fix Quick Sell Layout

### Root Cause

Two issues preventing proper scroll containment:

1. **Drawer's internal wrapper**: `DrawerContent` in `drawer.tsx` wraps children in `<div className="safe-area-bottom">{children}</div>` — this div has no flex/overflow constraints, so it grows with content instead of passing the height constraint through to the scroll area.

2. **Items list unbounded**: The added items list grows infinitely, pushing everything below it down before the outer scroll kicks in.

### Fix

| File | Change |
|---|---|
| `src/components/ui/drawer.tsx` | Add `flex flex-col flex-1 min-h-0 overflow-hidden` to the `safe-area-bottom` wrapper div so it participates in flex layout properly |
| `src/components/dashboard/QuickSellModal.tsx` | Cap items list at `max-h-[200px] overflow-y-auto` so it scrolls internally when many items are added; remove excessive `pb-[calc(120px+...)]` (replace with `pb-4` since action bar is already outside scroll) |

### Layout Chain (after fix)

```text
DrawerContent (h-[100dvh] flex flex-col)
  └─ drag handle
  └─ safe-area-bottom div (flex flex-col flex-1 min-h-0) ← FIX
       └─ DrawerHeader (fixed height)
       └─ scroll div (flex-1 overflow-y-auto min-h-0)
            └─ items list (max-h-[200px] overflow-y-auto) ← FIX
            └─ form fields
            └─ calculation card
            └─ buyer fields
       └─ action bar (sticky bottom-0)
```

This ensures the flex height constraint flows all the way from `100dvh` through every intermediate div to the scroll container, and the items list doesn't dominate the scroll area.

