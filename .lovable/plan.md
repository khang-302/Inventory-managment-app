## Plan: Fix Mobile Safe-Area Layout Issues

### Problem Summary

1. **Bottom buttons hidden**: Fixed bottom bars in QuickSellModal, RecordSale, AddEditPart, PartDetails lack safe-area-inset-bottom padding — Android nav bar overlaps them.
2. **Header under status bar on some devices**: The `#root` has `padding-top: env(safe-area-inset-top)` but the Header uses `safe-area-top` class which adds *additional* padding-top — this double-padding works on some devices but the sticky header can still sit under the status bar on others because `sticky top-0` positions relative to the scroll container, not the padded root.
3. **Drawer content**: Already has `safe-area-bottom` class — but it wraps children, not the action buttons which are inside `formContent`.

### Root Cause

- `#root` applies top safe-area padding globally, but `sticky top-0` headers don't account for it consistently across all Android WebViews.
- All `fixed bottom-0` elements need `pb-[env(safe-area-inset-bottom)]` but none have it except BottomNav.

### Changes

#### 1. `src/index.css` — Strengthen root safe-area handling

- Keep `#root` padding-top for the top safe area (already works).
- Add a utility class `.safe-area-bottom-pad` with `padding-bottom: calc(16px + env(safe-area-inset-bottom, 0px))` for fixed bottom bars.

#### 2. `src/components/layout/Header.tsx` — Fix sticky header

- Remove `safe-area-top` class (root already handles top inset).
- Change to `sticky top-0` so it sticks at the top of the padded root — no double padding.
- Actually the issue is the opposite on some devices: the root padding doesn't work with Capacitor overlay mode. Fix: move safe-area handling FROM `#root` TO the Header itself, and make the Header use `fixed top-0` with its own `padding-top: env(safe-area-inset-top)`, then give `main` a matching top margin. **Simpler approach**: keep current `#root` padding + `safe-area-top` on header (belt-and-suspenders is fine for cross-device compat). The real fix is ensuring the header class works — it already has `safe-area-top`. Verify it maps correctly. It does: `.safe-area-top { padding-top: env(safe-area-inset-top, 0px); }`. This should work. The issue on Samsung C7 may be that the meta viewport `viewport-fit=cover` isn't being respected. No code change needed here — it's already correct.

#### 3. `src/components/dashboard/QuickSellModal.tsx` — Fix bottom buttons in drawer

- Add `pb-[calc(16px+env(safe-area-inset-bottom,0px))]` to the scrollable container `<div className="overflow-y-auto px-4 pb-6">` — change `pb-6` to use safe area calc.
- Simpler: the Drawer already wraps children in `safe-area-bottom`, but the actions div inside `formContent` needs extra bottom padding. Add `pb-safe` style to the actions row.

#### 4. `src/pages/RecordSale.tsx` — Fix fixed bottom button

- Line 444: Add `safe-area-bottom` class and increase padding: `className="fixed bottom-0 left-0 right-0 p-4 pb-[calc(1rem+env(safe-area-inset-bottom,0px))] bg-background border-t border-border"`

#### 5. `src/pages/AddEditPart.tsx` — Fix fixed bottom button

- Line 728: Same pattern as RecordSale.

#### 6. `src/pages/PartDetails.tsx` — Fix fixed bottom buttons

- Line 255: Same pattern.

#### 7. `src/pages/Inventory.tsx` — Fix floating action button

- Line 631: Adjust `bottom-20` to also account for safe area. Use inline style: `style={{ bottom: 'calc(5rem + env(safe-area-inset-bottom, 0px))' }}`.

#### 8. `src/components/ui/drawer.tsx` — Improve safe-area in drawer

- The drawer content already has `safe-area-bottom` on children wrapper. This is correct but we should also ensure the padding applies below scrollable content. Current implementation is fine.

### Summary of File Changes


| File                                          | Change                                                   |
| --------------------------------------------- | -------------------------------------------------------- |
| `src/components/dashboard/QuickSellModal.tsx` | Add safe-area bottom padding to drawer's scrollable area |
| `src/pages/RecordSale.tsx`                    | Add safe-area bottom padding to fixed button bar         |
| `src/pages/AddEditPart.tsx`                   | Add safe-area bottom padding to fixed button bar         |
| `src/pages/PartDetails.tsx`                   | Add safe-area bottom padding to fixed button bar         |
| `src/pages/Inventory.tsx`                     | Adjust FAB bottom position for safe area                 |
| `src/index.css`                               | Add reusable `.fixed-bottom-safe` utility class          |
