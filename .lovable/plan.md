

## Plan: Fix Android Back Button with Capacitor App Plugin

### Problem
The current `useBackNavigation` hook listens for the DOM `backbutton` event, which Capacitor does **not** fire. Capacitor uses its own `App.addListener('backButton', ...)` API from `@capacitor/app`. The current code never actually intercepts the back button, so the WebView's default behavior (minimize/close) always wins.

### Solution

1. **Install `@capacitor/app`** — add the dependency
2. **Rewrite `useBackNavigation` hook** — use the proper Capacitor API:
   - Import `App` from `@capacitor/app` and `Capacitor` from `@capacitor/core`
   - On native platform: register `App.addListener('backButton', ({ canGoBack }) => { ... })`
   - If `location.pathname !== '/'`: call `navigate(-1)`
   - If on home (`/`): call `App.exitApp()`
   - On web: no-op (browser handles it)
   - Clean up listener on unmount

### File Changes

| File | Change |
|---|---|
| `package.json` | Add `@capacitor/app` dependency |
| `src/hooks/useBackNavigation.ts` | Rewrite to use `App.addListener('backButton')` with `canGoBack` + `App.exitApp()` |

### Key Code

```typescript
import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

export function useBackNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!Capacitor.isNativePlatform()) return;

    const listener = App.addListener('backButton', ({ canGoBack }) => {
      if (location.pathname === '/') {
        App.exitApp();
      } else {
        navigate(-1);
      }
    });

    return () => {
      listener.then(h => h.remove());
    };
  }, [navigate, location.pathname]);
}
```

