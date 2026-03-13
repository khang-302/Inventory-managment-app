import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

/**
 * Handles Android hardware back button and gesture back navigation.
 * 
 * In Capacitor WebView, the hardware back button triggers `popstate`.
 * This hook ensures proper page-by-page navigation instead of closing the app.
 * 
 * On the home screen ("/"), it allows the default behavior (exit app).
 * On all other screens, it navigates back through the history stack.
 */
export function useBackNavigation() {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Push an extra history entry on non-home pages to prevent
    // the WebView from closing when back is pressed
    const isHome = location.pathname === '/';

    if (isHome) return; // On home, let the default back behavior exit the app

    // Listen for the Capacitor/Android back button event
    const handleBackButton = (e: PopStateEvent) => {
      // Prevent default WebView close behavior
      e.preventDefault();
      
      // Navigate back using React Router
      navigate(-1);
    };

    // For Capacitor, we can also listen to the `backbutton` document event
    const handleCapacitorBack = (e: Event) => {
      e.preventDefault();
      if (location.pathname === '/') {
        // On home, let app exit — don't prevent
        return;
      }
      navigate(-1);
    };

    document.addEventListener('backbutton', handleCapacitorBack);

    return () => {
      document.removeEventListener('backbutton', handleCapacitorBack);
    };
  }, [navigate, location.pathname]);
}
