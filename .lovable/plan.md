

## Add Press/Tap Scale Animations to Icon Buttons

### Approach
Add `active:scale-95 transition-transform duration-150` to the base Button component's CVA string. This gives every button across the entire app a subtle press-down effect with zero per-file changes needed.

For non-Button interactive elements (BottomNav links, Dashboard quick actions, Settings items), add the same `active:scale-95 transition-transform` classes directly.

### Changes

**1. `src/components/ui/button.tsx`** — Add press animation to base CVA
- Add `active:scale-95 transition-transform duration-150` to the base class string
- This automatically applies to every Button in the app (header icons, action buttons, etc.)

**2. `src/components/layout/BottomNav.tsx`** — Add tap feedback to nav links
- Add `active:scale-90 transition-transform duration-150` to each NavLink

**3. `src/pages/Dashboard.tsx`** — Quick action buttons
- Add `active:scale-95 transition-transform` to QuickAction button elements

**4. `src/pages/Settings.tsx`** — Settings list items
- Add `active:scale-[0.98] transition-transform` to each clickable settings row (subtler scale for full-width items)

**5. `src/pages/Inventory.tsx`** — View toggle and filter buttons
- Add `active:scale-95` to toolbar icon buttons if not already using Button component

**6. `src/components/layout/SidebarNav.tsx`** — Sidebar nav links
- Add `active:scale-95 transition-transform` to NavLink items

### Summary
- ~6 files modified, all visual-only
- Primary mechanism: one-line change in `button.tsx` covers most of the app
- Remaining changes target non-Button interactive elements

