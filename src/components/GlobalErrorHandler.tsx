import { useEffect } from 'react';
import { saveCrashReport, markLastCrashPending } from '@/services/crashReportService';

export function GlobalErrorHandler() {
  useEffect(() => {
    const handleError = (event: ErrorEvent) => {
      const error = event.error instanceof Error ? event.error : new Error(event.message);
      saveCrashReport(error, {
        currentScreen: window.location.pathname,
        lastAction: 'Unhandled Exception',
      }).then((report) => {
        markLastCrashPending(report.id);
      });
    };

    const handleRejection = (event: PromiseRejectionEvent) => {
      const error =
        event.reason instanceof Error
          ? event.reason
          : new Error(String(event.reason || 'Unhandled Promise Rejection'));
      saveCrashReport(error, {
        currentScreen: window.location.pathname,
        lastAction: 'Unhandled Promise Rejection',
      }).then((report) => {
        markLastCrashPending(report.id);
      });
    };

    window.addEventListener('error', handleError);
    window.addEventListener('unhandledrejection', handleRejection);

    return () => {
      window.removeEventListener('error', handleError);
      window.removeEventListener('unhandledrejection', handleRejection);
    };
  }, []);

  return null;
}
