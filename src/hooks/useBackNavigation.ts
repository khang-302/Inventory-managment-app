import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Capacitor } from '@capacitor/core';
import { App } from '@capacitor/app';

/**
 * Handles Android hardware back button navigation using Capacitor's App plugin.
 *
 * - On sub-pages: navigates back through router history
 * - On home screen ("/"): exits the app
 * - On web: no-op (browser handles it natively)
 */
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
