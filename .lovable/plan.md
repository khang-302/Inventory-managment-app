

## Advanced Notifications System

### Context

The current notification system is minimal: a master toggle, low-stock alerts toggle, and sync alerts toggle on a settings page. The AlertBell in the header only shows low-stock counts. There is no notification history, no notification center, no custom notifications, and no scheduling.

**Important constraint**: This is an offline-first, single-user app with no backend. "Recipients" and "push notifications" don't apply. The system will be an **in-app notification center** with persistent history, event-driven auto-notifications, user-created custom reminders, and local scheduling via `setTimeout`/`setInterval` (rehydrated on app load).

---

### Architecture

```text
┌─────────────────────────────────────┐
│        Notification Types           │
│  id, type, title, message, category,│
│  isRead, isSystem, triggerType,     │
│  scheduledAt, repeatInterval,       │
│  createdAt                          │
└──────────────┬──────────────────────┘
               │
     ┌─────────┴──────────┐
     │  notificationService │  ← create, mark read, delete, schedule
     └─────────┬──────────┘
               │
  ┌────────────┼────────────────┐
  │            │                │
AlertBell   NotificationCenter  Settings
(badge+count) (full panel)     (preferences)
```

---

### Data Model

New Dexie table `notifications` (DB version 6):

| Field | Type | Description |
|-------|------|-------------|
| id | string | UUID |
| type | enum | `low_stock`, `part_added`, `part_sold`, `backup_complete`, `sync`, `custom` |
| title | string | Notification title |
| message | string | Body text |
| isRead | boolean | Read/unread state |
| isSystem | boolean | true for auto-generated, false for user-created |
| priority | enum | `normal`, `critical` |
| triggerType | enum | `immediate`, `scheduled`, `recurring` |
| scheduledAt | Date? | For scheduled notifications |
| repeatInterval | enum? | `daily`, `weekly`, `monthly` |
| lastTriggeredAt | Date? | For recurring: when it last fired |
| createdAt | Date | |

New Dexie table `notificationTemplates` (reusable user templates):

| Field | Type |
|-------|------|
| id | string |
| title | string |
| message | string |
| createdAt | Date |

---

### Implementation Plan

#### 1. Database Schema (db/database.ts, types/index.ts)
- Add `Notification` and `NotificationTemplate` interfaces to types
- Add version 6 to Dexie with `notifications` and `notificationTemplates` tables
- Index on `isRead`, `type`, `createdAt`

#### 2. Notification Service (services/notificationService.ts)
- `createNotification(data)` — insert + optional sound for critical
- `markAsRead(id)` / `markAllAsRead()`
- `deleteNotification(id)` / `deleteAll()`
- `getUnreadCount()`
- `getNotifications(filters?)` — with type/date/read filtering
- `scheduleNotification(data)` — stores scheduled entry
- `processScheduledNotifications()` — called on app load, fires any due notifications
- `createTemplate(data)` / `getTemplates()` / `deleteTemplate(id)`

#### 3. Auto-Notification Triggers
Wire into existing services (non-breaking additions):
- **inventoryService** `addPart()` → fire `part_added` notification
- **salesService** `recordSale()` → fire `part_sold` notification
- **salesService** after sale → check stock, fire `low_stock` if triggered
- **BackupRestore page** after backup → fire `backup_complete` notification
- All gated by notification preferences from settings

#### 4. Scheduling Engine (hooks/useNotificationScheduler.ts)
- On app mount, query all `scheduled`/`recurring` notifications
- Set timers for pending ones; fire and update `lastTriggeredAt` for recurring
- Clean up timers on unmount

#### 5. Revamped AlertBell → Notification Center
Replace the current low-stock-only popover with a full notification panel:
- **Badge**: shows total unread count (not just low stock)
- **Panel** (Sheet/Drawer on mobile): scrollable list of all notifications
- Each item: icon by type, title, message, timestamp, read/unread dot
- Filter tabs: All | System | Custom | Unread
- "Mark all read" and "Clear all" actions
- Tap a notification to mark as read

#### 6. Enhanced Settings Page (pages/settings/Notifications.tsx)
Expand the existing page with:
- **Master toggle** (keep existing)
- **Per-type toggles**: low stock, part added, part sold, backup, sync
- **Sound toggle** for critical alerts
- **Custom Notifications section**: list user-created notifications with create/edit/delete
- **Templates section**: save/load reusable message templates
- **Create Custom Notification form** (dialog):
  - Title, message, priority
  - Trigger: immediate / scheduled (date picker) / recurring (interval select)
  - Option to save as template
- **Notification History**: link to full history view with filters

#### 7. Notification History Page (pages/NotificationHistory.tsx)
- Full-page list of all notifications with search, type filter, date filter
- Mark read/unread, delete individual or bulk
- Route: `/notifications`

#### 8. Routing (App.tsx)
- Add `/notifications` route for history page

---

### Files to Create
- `src/types/notification.ts` — types
- `src/services/notificationService.ts` — CRUD + scheduling logic
- `src/hooks/useNotificationScheduler.ts` — timer management on mount
- `src/components/layout/NotificationCenter.tsx` — replaces AlertBell popover content
- `src/pages/NotificationHistory.tsx` — full history page

### Files to Modify
- `src/db/database.ts` — version 6 with new tables
- `src/types/index.ts` — re-export notification types
- `src/components/layout/AlertBell.tsx` — use unread count from new service, open NotificationCenter
- `src/pages/settings/Notifications.tsx` — expanded with per-type toggles, custom creation, templates
- `src/services/inventoryService.ts` — trigger notification on add
- `src/services/salesService.ts` — trigger notification on sale
- `src/App.tsx` — add notification history route, mount scheduler
- `src/contexts/AppContext.tsx` — mount scheduler hook

