

## Advanced Crash & Bug Reporting System

### Overview
Build a local crash/error reporting system that captures errors automatically, stores them in IndexedDB, and lets users email reports to the developer. Includes a crash recovery prompt on app reopen.

### New Files

**1. `src/types/crashReport.ts`** — Type definitions
- `CrashReport` interface: `id`, `errorCode` (e.g. `ERR-20260309-001`), `errorType`, `errorMessage`, `stackTrace`, `currentScreen` (from router), `lastAction`, `appVersion`, `deviceModel` (from `navigator.userAgent`), `screenResolution`, `createdAt`, `isRead`
- Keep max 50 logs, auto-rotate oldest

**2. `src/services/crashReportService.ts`** — Core service
- `saveCrashReport(error, context)` — generates error code (`ERR-YYYYMMDD-NNN`), collects device/app info, saves to DB, enforces 50-log limit
- `getCrashReports()` — returns all logs sorted by date
- `getCrashReport(id)` — single log detail
- `deleteCrashReport(id)` / `clearAllCrashReports()`
- `generateEmailBody(report)` — formats the mailto body with all technical details
- `getEmailMailtoUrl(report, userNote?)` — returns `mailto:zeeshankhan25102006@gmail.com?subject=...&body=...`
- `markLastCrashPending()` / `getLastPendingCrash()` / `clearPendingCrash()` — uses localStorage flag for crash recovery prompt

**3. `src/pages/settings/CrashLogs.tsx`** — Error Logs page
- List of crash reports showing error code, date, screen
- Tap to expand details (full error message, stack trace, device info)
- "Send Error Report" button per log → opens mailto
- "Clear All Logs" button
- Empty state when no errors

**4. `src/pages/settings/ReportProblem.tsx`** — Manual Bug Report page
- Textarea for problem description
- Auto-captures current device info & app version
- "Send Report" button → opens mailto with pre-filled technical details + user description
- No screenshot attachment (web limitation), but includes all available context

### Modified Files

**5. `src/db/database.ts`** — Add version 7
- New table: `crashReports: 'id, errorCode, createdAt'`
- Add `crashReports` table declaration to class

**6. `src/components/ErrorBoundary.tsx`** — Enhanced crash handling
- On `componentDidCatch`: call `saveCrashReport()` with error + stack trace + set pending crash flag
- Render updated UI with "Send Error Report" button (mailto) alongside existing Try Again / Reload buttons

**7. `src/App.tsx`** — Add routes + global error listeners + crash recovery
- Add routes: `/settings/crash-logs`, `/settings/report-problem`
- Add `CrashRecoveryPrompt` component that checks for pending crash on mount, shows alert dialog with Send Report / View Details / Ignore options
- Register `window.onerror` and `window.onunhandledrejection` handlers that save crash reports

**8. `src/pages/Settings.tsx`** — Add menu items
- Under "Activity & Logs" section: add "Error Logs" item (Bug icon, links to `/settings/crash-logs`)
- Under new "Help & Support" section: add "Report a Problem" item (links to `/settings/report-problem`)

### Privacy
- Reports only include: error details, device info (user agent), screen resolution, app version, current route
- No inventory data, customer info, or billing records included

### Constants
- Developer email: `zeeshankhan25102006@gmail.com`
- App version: read from existing `v1.2.0` constant
- Max stored logs: 50

