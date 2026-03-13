# Fix: Global Android Safe Area Handling

## Root Cause

The application layout does not properly respect Android system safe areas.

Two main issues cause this:

1. The viewport meta tag does not include `viewport-fit=cover`, so Android WebView does not expose safe area inset values. As a result, CSS variables such as `env(safe-area-inset-top)` and `env(safe-area-inset-bottom)` resolve to `0px`.
2. The app does not control the Android status bar overlay using the Capacitor StatusBar plugin. This causes WebView content to render behind the system status bar and navigation bar without proper padding.

Because of this, UI elements across the app overlap with:

- Android status bar
- navigation bar
- gesture navigation area
- device cutouts / camera holes

This issue affects **all pages globally**, including headers, notifications, dialogs, settings screens, and bottom actions.

The correct fix must be implemented at the **root layout level**, not screen by screen.

---

# Required Changes

## 1. Update `index.html`

Enable safe area reporting from Android WebView by adding `viewport-fit=cover`.

```
<meta name="viewport" content="width=device-width, initial-scale=1.0, viewport-fit=cover">
```

This allows CSS environment variables to return the correct system inset values.

---

# 2. Install Capacitor Status Bar Plugin

Install:

```
@capacitor/status-bar
```

This plugin allows the application to properly control how the WebView interacts with the Android system status bar.

---

# 3. Initialize StatusBar in `src/main.tsx`

On application boot:

- Import `StatusBar` and `Style` from `@capacitor/status-bar`
- Detect native platform
- Enable overlay mode

Example logic:

```
StatusBar.setOverlaysWebView({ overlay: true })
```

This allows the WebView to render edge-to-edge while the app manages safe area padding itself.

Also apply status bar style matching the current app theme.

---

# 4. Strengthen Global Safe Area CSS

Update `src/index.css` to ensure the application globally respects Android safe areas.

Add global safe area handling at the root level.

Example logic:

```
#root {
  padding-top: env(safe-area-inset-top);
  padding-bottom: max(env(safe-area-inset-bottom), 16px);
}
```

Using `max()` ensures compatibility with Android gesture navigation areas where additional bottom space is required.

Create reusable utility classes:

```
.safe-area-top
.safe-area-bottom
.safe-area-all
```

These should apply:

- top inset
- bottom inset
- left/right inset
- gesture-safe spacing

---

# 5. Update `AppLayout.tsx`

Modify the main layout wrapper so **all pages inherit safe area protection automatically**.

The root layout should:

- apply `safe-area-top`
- apply `safe-area-bottom` when bottom navigation is hidden
- ensure scrollable content containers include safe area padding

This guarantees that:

- headers never overlap the status bar
- bottom content never hides behind navigation bars

---

# 6. Handle Bottom Navigation Layout

When bottom navigation is visible, content must account for:

- navigation bar height
- safe area inset

Scrollable page containers must use bottom padding equal to:

```
bottom navigation height + safe-area-inset-bottom
```

This prevents content from appearing behind the navigation bar.

---

# 7. Update Dialogs, Sheets, and Drawers

Overlay components must also respect safe areas.

Update the following components:

- `src/components/ui/dialog.tsx`
- `src/components/ui/sheet.tsx`
- `src/components/ui/drawer.tsx`

Ensure content containers apply:

```
safe-area-top
safe-area-bottom
```

This prevents dialog headers and close buttons from appearing behind the system status bar.

---

# 8. Scroll Container Protection

Scrollable layouts must include safe area padding.

This applies to:

- settings pages
- forms
- list views
- report pages
- inventory lists
- bill history pages

Bottom padding should ensure that the final list item or action button remains fully visible above the navigation bar.

---

# How the Final System Works

1. `viewport-fit=cover` allows Android WebView to report real safe area values.
2. `StatusBar.setOverlaysWebView({ overlay: true })` enables edge-to-edge rendering.
3. CSS `env(safe-area-inset-*)` values provide correct system bar heights.
4. Global padding at the root layout ensures every screen respects safe areas automatically.
5. Dialogs, sheets, drawers, and scroll containers inherit the same safe area protection.

---

# Expected Result

After implementation:

• No UI elements overlap the Android status bar  
  
• No buttons appear behind the navigation bar  
  
• Bottom elements remain fully tappable  
  
• Dialogs and notification panels render correctly  
  
• All pages respect Android safe areas automatically

The fix works globally across the entire application.

---

# Required Testing

Test the final APK on real Android devices including:

- **Samsung Galaxy A16**
- devices using gesture navigation
- devices using classic navigation buttons

Verify that:

- notification close buttons remain accessible
- settings buttons are not hidden
- bottom actions remain tappable
- dialogs respect safe areas

---

# Post Implementation Step

After pulling the changes, run:

```
npx cap sync
```

Then rebuild the Android APK and test on real devices.