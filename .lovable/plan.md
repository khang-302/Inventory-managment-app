

## Comprehensive App Audit & Bug Report

After thorough analysis of all modules, here is a prioritized report of issues with proposed fixes.

---

### CRITICAL ISSUES

**1. `getTodaySales()` mutates the `today` Date object (salesService.ts:204-206)**
- `today.setHours(0,0,0,0)` mutates `today` in place, so when `setHours(23,59,59,999)` is called, it operates on the already-mutated date. This means `startOfDay` and `endOfDay` both end up as the same time (23:59:59.999).
- **Impact**: `getTodaySales()` returns incorrect results. However, Dashboard uses its own `startOfDay`/`endOfDay` from date-fns, so Dashboard stats are unaffected. Any direct caller of `getTodaySales()` gets wrong data.
- **Fix**: Use separate Date instances: `const startOfDay = new Date(new Date().setHours(0,0,0,0))` and `const endOfDay = new Date(new Date().setHours(23,59,59,999))`.

**2. `recordMultiSale` double-logs activity (salesService.ts:77-91)**
- Inside the transaction, `updateStock()` calls `logActivity()` for each stock change. Then after the transaction, another `logActivity()` is called for the sale itself. The `updateStock` activity log call happens inside the transaction but `logActivity` in `updateStock` also writes to `db.activityLogs` — this works because it's in the same transaction scope. However, each sale generates N+1 activity log entries (N stock updates + 1 sale summary), which clutters the activity feed.
- **Fix**: Use a `skipLog` parameter on `updateStock` when called from sale flows, or accept the verbosity as intentional.

**3. AddEditPart `useEffect` dependency causes infinite re-renders (AddEditPart.tsx:164)**
- The `useEffect` that sets form values when editing depends on `[existingPart, savedBrands, savedCategories]`. The `allBrands` and `allCategories` arrays are recomputed every render, and `setBrandSelection`/`setCategorySelection` inside the effect trigger re-renders, which re-compute `allBrands`/`allCategories`, potentially causing a loop.
- **Impact**: Performance degradation on edit page, possible flickering.
- **Fix**: Memoize `allBrands` and `allCategories` with `useMemo`, and guard the effect with a `hasSetInitialValues` ref.

---

### HIGH SEVERITY

**4. Report PDF header hardcodes "Ameer Autos" (exportUtils.ts:74)**
- The PDF export always shows "Ameer Autos" regardless of the user's custom `appName` setting.
- **Fix**: Pass `appName` as a parameter to `exportReportToPDF`.

**5. Console warning: "Function components cannot be given refs" (Settings.tsx & Dashboard.tsx)**
- `SettingItem` is a function component receiving a ref (from Card/CardContent rendering). The `AppLayout` component also triggers this on Dashboard.
- **Impact**: Console noise, potential future breakage.
- **Fix**: Wrap `SettingItem` with `React.forwardRef` or ensure parent components don't pass refs to it.

**6. `deleteSale` does not restore stock (salesService.ts:319)**
- The comment says "This doesn't restore stock - manual adjustment needed" — but there's no UI or workflow for the user to manually restore stock after deleting a sale.
- **Impact**: Deleting a sale permanently loses stock quantity. Data integrity issue.
- **Fix**: Either auto-restore stock on sale deletion or add a stock adjustment UI.

**7. QuickSell doesn't deduct from existing inventory (QuickSellModal.tsx)**
- QuickSell creates a new Part + Sale entry but doesn't check if a part with the same name/SKU already exists. It always creates a fresh part with `quantity: 0`.
- **Impact**: Duplicate parts in inventory; no stock deduction from existing inventory.
- **Fix**: Add a part-search/autocomplete to QuickSell, or clearly document it as "off-book" quick sales.

---

### MEDIUM SEVERITY

**8. Image compression not applied (AddEditPart.tsx:349-356)**
- Images are stored as raw base64 from `readAsDataURL` with no compression or resizing. Large photos (5+ MB each, up to 5 images) can bloat IndexedDB.
- **Fix**: Add canvas-based resizing/compression before storing.

**9. Bill export: SVG icons may not render in image captures (BillPreviewTemplate.tsx)**
- The inline SVG icons (LocationIcon, PhoneIcon, GlobeIcon) use `stroke` attributes. `html-to-image` sometimes fails to capture SVGs with stroke-based rendering, especially in certain browsers.
- **Impact**: Footer icons might appear blank in PNG/JPG exports.
- **Fix**: Test across browsers; if issues arise, convert to path-filled SVGs or embed as data URIs.

**10. Inventory Table view: checkbox click navigates to part details (Inventory.tsx:480-481)**
- The `TableRow` has `onClick={() => navigate(...)}`. While `toggleSelectOne` calls `e.stopPropagation()`, the checkbox itself also triggers row navigation on some touch devices.
- **Fix**: Add `e.stopPropagation()` on the checkbox's parent `TableCell`.

**11. Reports time range default index (Reports.tsx:48)**
- Default `selectedRangeIndex` is `5` (hardcoded). If `dateRanges` has fewer than 6 items, this causes an out-of-bounds access.
- **Fix**: Default to `Math.min(5, dateRanges.length - 1)`.

**12. BillCreate missing `hideNav` on AppLayout (BillCreate.tsx:163)**
- The bill creation form doesn't hide the bottom navigation, which can overlap the save button area.
- **Fix**: Add `hideNav` prop to `<AppLayout>` on BillCreate.

---

### LOW SEVERITY

**13. No image validation on AddEditPart**
- Accepts any file type despite `accept="image/*"`. No file size check.
- **Fix**: Add client-side size validation (e.g., max 5MB per image).

**14. Bottom nav active indicator positioning**
- `absolute bottom-1` indicator dot (BottomNav.tsx:69) needs a `relative` parent. The `NavLink` doesn't have `position: relative`.
- **Fix**: Add `relative` class to the NavLink.

**15. Brand/Category predefined ID collision potential (AddEditPart.tsx:107)**
- Predefined brands use `id: 'predefined-${name}'` while DB brands use UUIDs. When a predefined brand is selected and saved to DB, the form stores the real UUID. But on re-edit, `allBrands.find(b => b.id === existingPart.brandId || b.name === existingPart.brandId)` does a name match which could cause ambiguity if two brands share similar names.
- **Fix**: Match only by ID, not by name, during edit.

**16. `RecordSale` page only shows parts with `quantity > 0`**
- This is correct behavior but means a user can't record a sale for a part that just went to 0 stock (e.g., selling the last item while another staff member already sold it).
- **Impact**: Minor UX confusion.

---

### UI/DESIGN RECOMMENDATIONS

**17. Color palette consistency**
- The PRD specifies a "premium yellow, orange, gray, black, white" palette, but the report PDF export uses green-800 (`#166534`) for the header. Should match the app's primary amber/gold theme.
- **Fix**: Change PDF header color to match the TEAL/GOLD bill palette or the app's primary amber color.

**18. AddEditPart submit button overlaps content**
- The fixed-bottom submit button (`fixed bottom-0`) can overlap the form content and the bottom nav (which is hidden via `hideNav`). On shorter screens, the last form fields may be hidden behind the button.
- The `pb-24` padding helps but may not be sufficient on all devices.

**19. Settings page Notification switch interaction**
- The Switch inside `SettingItem` has both `onClick` (navigate to notifications page) and `onCheckedChange` (toggle notifications). Clicking the switch toggles AND navigates, which is confusing. The `e.stopPropagation()` on Switch prevents navigation when clicking the switch itself, but the UX intent is unclear.

---

### IMPLEMENTATION PLAN

| Priority | Issue | File(s) | Change |
|----------|-------|---------|--------|
| P0 | Fix `getTodaySales` date mutation | salesService.ts | Use separate Date instances |
| P0 | Fix AddEditPart infinite re-render risk | AddEditPart.tsx | Memoize brands/categories, add guard ref |
| P1 | Pass appName to PDF export | exportUtils.ts, Reports.tsx | Add parameter |
| P1 | Fix `deleteSale` stock restoration | salesService.ts | Auto-restore stock |
| P1 | Fix BottomNav active dot positioning | BottomNav.tsx | Add `relative` class |
| P1 | Add `hideNav` to BillCreate | BillCreate.tsx | Add prop |
| P2 | Fix forwardRef warning | Settings.tsx | Wrap SettingItem with forwardRef |
| P2 | Add image compression | AddEditPart.tsx | Canvas resize before store |
| P2 | Fix table row checkbox navigation | Inventory.tsx | stopPropagation on cell |
| P2 | PDF color mismatch | exportUtils.ts | Match app theme colors |
| P3 | Add image size validation | AddEditPart.tsx | Max 5MB check |
| P3 | SafeGuard time range index | Reports.tsx | Bounds check |

All issues are fixable without architectural changes. The app's core data layer (Dexie.js) is solid, and the bill template design is professional. The main risks are the date mutation bug and the edit-page re-render loop.

