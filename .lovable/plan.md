## Plan: Fix Quick Sell Scroll & Button Visibility

### Problem

Quick Sell layout expands downward when:

- Selling Price is entered (calculation card appears)

- Multiple spare parts are added

This pushes Cancel / Confirm buttons below the screen and behind the Android navigation bar.

### Root Cause

- Scroll container missing `min-h-0`

- Flex layout cannot shrink → content grows instead of scrolling

- Insufficient bottom padding → content overlaps with fixed buttons

---

### Fix — src/components/dashboard/QuickSellModal.tsx

1. Fix Scroll Container

Add `min-h-0` to all scrollable containers:

<div className="flex-1 overflow-y-auto min-h-0">

Apply to:

- Mobile scroll container

- Desktop scroll container

---

2. Fix Bottom Padding

Replace:

pb-4

With:

pb-[calc(100px+env(safe-area-inset-bottom))]

---

3. Fix Action Button Bar

Ensure bottom action bar is fixed or sticky:

position: sticky;

bottom: 0;

OR

position: fixed;

bottom: 0;

Add safe-area padding:

padding-bottom: calc(16px + env(safe-area-inset-bottom));

---

4. Maintain Layout Structure

flex flex-col h-full

   ├── header

   ├── scrollable content (flex-1 overflow-y-auto min-h-0)

   └── action buttons (fixed / sticky)

---

### Expected Result

- Layout does NOT grow downward

- Content scrolls properly

- Buttons always visible

- No overlap with Android navigation bar

- Works with multiple spare parts

- Works when calculation card appears