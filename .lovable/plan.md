

## Plan: Multi-Item Quick Sell + Layout Fix

### Part 1 — Fix Layout Expansion

**Problem**: The profit/calculation card conditionally renders between the price fields and the buyer fields. When it appears, it pushes everything below it (buyer, notes, toggle, buttons) downward, causing buttons to go behind the Android nav bar.

**Fix**: The entire form already scrolls inside `overflow-y-auto`. The real issue is that the action buttons are *inside* the scrollable content. Move the action buttons **outside** the scroll container so they stay fixed at the bottom of the drawer/dialog regardless of content height. This way the calculation card can appear freely without affecting button visibility.

### Part 2 — Multi-Item Support

Convert the single-item form into an items list with an "Add Another Part" button:

**Data model change**:
- Replace individual `partName/partNumber/brand/quantity/purchasePrice/sellingPrice` state with an `items: QuickSellItem[]` array and an `editingIndex` for the current item being entered.
- Each item: `{ partName, partNumber, brand, quantity, purchasePrice, sellingPrice }`

**UI changes**:
1. Show the current input form fields (same 6 fields) for adding/editing one item at a time.
2. Below the input fields, an **"+ Add Part"** button that validates the current fields, pushes the item to the list, and clears the fields for the next item.
3. Above the input form, show a compact list of already-added items (part name, qty, selling price) with a remove (X) button per item.
4. The **calculation card** shows aggregated totals across ALL items in the list plus the current in-progress fields.
5. Buyer name/phone, notes, auto-bill toggle, and action buttons remain shared (not per-item).

**Submit logic changes**:
- On "Confirm Sale": validate that at least one item exists (either in the list or currently filled in the form). If current form has data, auto-add it to the list first.
- Create one `db.sales` record per item (matching current pattern).
- Activity log records all items.
- Bill generation passes all items to `createBillFromSale`.

### File Changes

| File | Change |
|---|---|
| `src/components/dashboard/QuickSellModal.tsx` | Full rework: multi-item state, split buttons out of scroll area, items list UI, aggregated calculations |

No other files need changes — `createBillFromSale` and `db.sales.add` already support the needed patterns.

### Layout Structure (Mobile Drawer)

```text
┌─ DrawerHeader ─────────────────┐
│ ⚡ Quick Sell                   │
├─ Scrollable area ──────────────┤
│ [Added items list]             │
│ [Item input fields: 6 fields]  │
│ [+ Add Part button]            │
│ [Calculation summary card]     │
│ [Buyer Name / Phone]           │
│ [Notes]                        │
│ [Auto Generate Bill toggle]    │
├─ Fixed bottom bar ─────────────┤
│ [Cancel]  [Confirm Sale (N)]   │
└────────────────────────────────┘
```

The bottom bar uses `sticky bottom-0` with safe-area padding, ensuring it never goes behind the Android nav bar regardless of scroll content.

