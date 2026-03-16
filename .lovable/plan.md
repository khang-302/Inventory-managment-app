

## Plan: Professional Loading Screen + Quick Sell Safe-Area Fix

### Task 1: Replace Plain "Loading..." with Professional Loading Animation

**Problem**: Multiple pages show a plain `animate-pulse text-muted-foreground "Loading..."` text during initialization — looks unprofessional.

**Solution**: Create a reusable `LoadingScreen` component with a polished animation (pulsing app logo/icon + spinner + subtle fade), then replace all `!isInitialized` loading blocks.

**Files to change**:
| File | Change |
|---|---|
| `src/components/ui/LoadingScreen.tsx` | **New** — reusable component with centered spinner animation, pulsing logo circle, and "Loading..." text with smooth fade-in |
| `src/pages/Dashboard.tsx` | Replace lines 120-128 loading block with `<LoadingScreen />` |
| `src/pages/settings/NavigationLayout.tsx` | Replace loading block with `<LoadingScreen />` |
| `src/pages/settings/AppLogo.tsx` | Replace loading block with `<LoadingScreen />` |
| `src/pages/settings/Branding.tsx` | Replace loading block with `<LoadingScreen />` |

The `LoadingScreen` component will feature:
- Centered layout with `min-h-screen`
- A circular pulsing indicator with the app's primary color
- A CSS-only spinning ring (no extra dependencies)
- Subtle fade-in animation using existing `animate-fade-in`

---

### Task 2: Fix Quick Sell Bottom Buttons Behind Android Nav Bar

**Problem**: In the Quick Sell modal (Drawer on mobile), the action buttons (Cancel/Confirm) can be obscured by the Android system navigation bar.

**Solution**: Apply the existing `fixed-bottom-safe` pattern to the action buttons container inside the drawer.

**File to change**:
| File | Change |
|---|---|
| `src/components/dashboard/QuickSellModal.tsx` | Add safe-area bottom padding to the action buttons `<div>` (line 272) using `style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}` |

The drawer's scroll container already has safe-area padding on line 300, but the action buttons div at line 272 (inside `formContent`) needs its own bottom padding to ensure the buttons are never obscured.

