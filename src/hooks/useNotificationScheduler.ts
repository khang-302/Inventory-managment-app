import { useEffect, useRef } from 'react';
import { processScheduledNotifications } from '@/services/notificationService';

/**
 * Runs scheduled/recurring notification processing on app mount and
 * periodically every 60 seconds.
 */
export function useNotificationScheduler() {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    // Fire immediately on mount
    processScheduledNotifications().catch(console.error);

    // Check every 60s for due scheduled/recurring notifications
    intervalRef.current = setInterval(() => {
      processScheduledNotifications().catch(console.error);
    }, 60_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);
}
