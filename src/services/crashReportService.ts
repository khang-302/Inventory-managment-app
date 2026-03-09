import { db } from '@/db/database';
import { format } from 'date-fns';
import { APP_VERSION } from '@/utils/constants';
import type { CrashReport } from '@/types/crashReport';
import { MAX_CRASH_LOGS, DEVELOPER_EMAIL } from '@/types/crashReport';

const PENDING_CRASH_KEY = 'ameer-autos-pending-crash';

function generateErrorCode(): string {
  const dateStr = format(new Date(), 'yyyyMMdd');
  const seq = String(Math.floor(Math.random() * 999) + 1).padStart(3, '0');
  return `ERR-${dateStr}-${seq}`;
}

function getDeviceInfo() {
  const ua = navigator.userAgent;
  let deviceModel = 'Unknown Device';
  // Try to extract device model from UA
  const match = ua.match(/\(([^)]+)\)/);
  if (match) {
    deviceModel = match[1].split(';').slice(0, 2).join(' ').trim();
  }
  return {
    deviceModel,
    screenResolution: `${window.screen.width}x${window.screen.height}`,
  };
}

export async function saveCrashReport(
  error: Error | string,
  context?: { currentScreen?: string; lastAction?: string }
): Promise<CrashReport> {
  const { deviceModel, screenResolution } = getDeviceInfo();
  const errorObj = typeof error === 'string' ? new Error(error) : error;

  const report: CrashReport = {
    id: crypto.randomUUID(),
    errorCode: generateErrorCode(),
    errorType: errorObj.name || 'Error',
    errorMessage: errorObj.message || String(error),
    stackTrace: errorObj.stack || 'No stack trace available',
    currentScreen: context?.currentScreen || window.location.pathname,
    lastAction: context?.lastAction || 'Unknown',
    appVersion: APP_VERSION,
    deviceModel,
    screenResolution,
    createdAt: new Date(),
    isRead: false,
  };

  await db.crashReports.add(report);

  // Enforce max logs limit - delete oldest beyond limit
  const count = await db.crashReports.count();
  if (count > MAX_CRASH_LOGS) {
    const oldest = await db.crashReports
      .orderBy('createdAt')
      .limit(count - MAX_CRASH_LOGS)
      .toArray();
    await db.crashReports.bulkDelete(oldest.map((r) => r.id));
  }

  return report;
}

export async function getCrashReports(): Promise<CrashReport[]> {
  return db.crashReports.orderBy('createdAt').reverse().toArray();
}

export async function getCrashReport(id: string): Promise<CrashReport | undefined> {
  return db.crashReports.get(id);
}

export async function deleteCrashReport(id: string): Promise<void> {
  await db.crashReports.delete(id);
}

export async function clearAllCrashReports(): Promise<void> {
  await db.crashReports.clear();
}

export async function markReportRead(id: string): Promise<void> {
  await db.crashReports.update(id, { isRead: true });
}

export function generateEmailBody(report: CrashReport, userNote?: string): string {
  return [
    `Error Code: ${report.errorCode}`,
    `Date: ${format(new Date(report.createdAt), 'dd MMM yyyy')}`,
    `Time: ${format(new Date(report.createdAt), 'HH:mm')}`,
    '',
    `Device: ${report.deviceModel}`,
    `Screen Resolution: ${report.screenResolution}`,
    '',
    `App Version: ${report.appVersion}`,
    '',
    `Screen: ${report.currentScreen}`,
    `User Action: ${report.lastAction}`,
    '',
    `Error Type: ${report.errorType}`,
    `Error Message:`,
    report.errorMessage,
    '',
    `Stack Trace:`,
    report.stackTrace,
    '',
    `User Note:`,
    userNote || '(none)',
  ].join('\n');
}

export function getEmailMailtoUrl(report: CrashReport, userNote?: string): string {
  const subject = encodeURIComponent(`App Error Report – ${report.errorCode}`);
  const body = encodeURIComponent(generateEmailBody(report, userNote));
  return `mailto:${DEVELOPER_EMAIL}?subject=${subject}&body=${body}`;
}

export function getManualReportMailtoUrl(description: string): string {
  const { deviceModel, screenResolution } = getDeviceInfo();
  const subject = encodeURIComponent('Bug Report – Inventory Manager');
  const body = encodeURIComponent(
    [
      `Date: ${format(new Date(), 'dd MMM yyyy')}`,
      `Time: ${format(new Date(), 'HH:mm')}`,
      '',
      `Device: ${deviceModel}`,
      `Screen Resolution: ${screenResolution}`,
      `App Version: ${APP_VERSION}`,
      `Current Screen: ${window.location.pathname}`,
      '',
      `Problem Description:`,
      description,
    ].join('\n')
  );
  return `mailto:${DEVELOPER_EMAIL}?subject=${subject}&body=${body}`;
}

// Crash recovery - localStorage flags
export function markLastCrashPending(reportId: string): void {
  localStorage.setItem(PENDING_CRASH_KEY, reportId);
}

export function getLastPendingCrash(): string | null {
  return localStorage.getItem(PENDING_CRASH_KEY);
}

export function clearPendingCrash(): void {
  localStorage.removeItem(PENDING_CRASH_KEY);
}
