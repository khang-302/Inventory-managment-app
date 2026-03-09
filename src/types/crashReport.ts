export interface CrashReport {
  id: string;
  errorCode: string;
  errorType: string;
  errorMessage: string;
  stackTrace: string;
  currentScreen: string;
  lastAction: string;
  appVersion: string;
  deviceModel: string;
  screenResolution: string;
  createdAt: Date;
  isRead: boolean;
}

export const MAX_CRASH_LOGS = 50;
export const DEVELOPER_EMAIL = 'zeeshankhan25102006@gmail.com';
