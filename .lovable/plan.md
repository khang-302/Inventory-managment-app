

## Improve Navigation UI & Advanced Navigation Settings

### Overview
Upgrade the sidebar drawer and bottom nav visually, and add 4 new customization options to the Navigation Layout settings page. New settings are persisted via the existing Dexie settings store and AppContext pattern.

### 1. New Navigation Settings (stored in AppContext + Dexie)

Add these settings with defaults:
- `navIconStyle`: `'outline' | 'filled' | 'rounded'` — default `'outline'`
- `navIconSize`: `'small' | 'medium' | 'large'` — default `'medium'`
- `navHighlightStyle`: `'icon-only' | 'icon-label' | 'background'` — default `'background'`
- `navAnimation`: `'none' | 'fade' | 'slide'` — default `'fade'`

**Files**: `src/contexts/AppContext.tsx` — add 4 new state fields, setters, load from DB on init, expose in context type.

### 2. Sidebar Drawer Premium Redesign (`src/components/layout/SidebarNav.tsx`)

- Better icon choices: `LayoutGrid` → keep, `Boxes` → `Warehouse`, `FileText` → `Receipt`, `ChartColumnBig` → `TrendingUp`, `Settings` → `SlidersHorizontal`
- Improve header: larger logo area, better typography hierarchy, subtle gradient or border accent
- Menu items: increase vertical padding to `py-3.5`, use `rounded-xl`, add `gap-4` between icon container and label
- Active state: soft amber/orange highlight background (`bg-amber-500/10 text-amber-600`) instead of solid primary fill
- Inactive icons: `text-muted-foreground` (silver gray)
- Icon containers: `h-10 w-10 rounded-xl` with subtle colored tints
- Apply `navIconSize` mapping: small=`h-4 w-4`, medium=`h-5 w-5`, large=`h-6 w-6`
- Apply `navIconStyle`: outline=strokeWidth 1.5, filled=strokeWidth 2 + fill, rounded=strokeWidth 2 + rounded linecap
- Apply `navHighlightStyle` and `navAnimation` (CSS transitions: fade=opacity transition, slide=translateX indicator bar)
- Add subtle separator line between nav items group and footer
- Footer: version text with muted styling

### 3. Bottom Nav Polish (`src/components/layout/BottomNav.tsx`)

- Same icon swaps as sidebar for consistency
- Apply `navIconSize`, `navIconStyle`, `navHighlightStyle`, `navAnimation` from context
- Active state: amber/orange accent color
- Inactive: silver gray (`text-slate-400`)
- Highlight styles: icon-only = color icon only, icon-label = color both, background = pill bg behind icon
- Animation: fade = `transition-opacity`, slide = sliding indicator bar with `transition-transform`

### 4. Navigation Layout Settings Page (`src/pages/settings/NavigationLayout.tsx`)

Add 4 new setting cards below existing ones:

**Icon Style** — 3 radio-style options (Outline / Filled / Rounded) with small icon previews

**Icon Size** — 3 radio options (Small / Medium / Large)

**Navigation Highlight Style** — 3 radio options (Icon color only / Icon + label color / Background highlight)

**Navigation Animation** — 3 radio options (None / Smooth fade / Slide highlight)

**Preview section** — Upgrade from placeholder blocks to actual icons matching the 5 nav items (Dashboard, Inventory, Bill, Report, Setting), reflecting all current settings (layout, labels, compact, icon size, highlight style) in real-time.

### 5. Labels Consistency

Rename nav item labels to match requirement: "Bills" → "Bill", "Reports" → "Report", "Settings" → "Setting" across BottomNav, SidebarNav, and preview.

### Files Modified (~4 files)
1. `src/contexts/AppContext.tsx` — 4 new settings fields
2. `src/components/layout/SidebarNav.tsx` — premium redesign + apply new settings
3. `src/components/layout/BottomNav.tsx` — polish + apply new settings
4. `src/pages/settings/NavigationLayout.tsx` — 4 new setting cards + improved preview

