import { db } from '@/db/database';
import { getSetting } from '@/db/database';
import type { 
  AppNotification, 
  NotificationTemplate, 
  CreateNotificationInput, 
  NotificationFilter, 
  NotificationPreferences,
  NotificationType 
} from '@/types/notification';

const DEFAULT_PREFS: NotificationPreferences = {
  lowStock: true,
  partAdded: true,
  partSold: true,
  backupComplete: true,
  sync: true,
  soundEnabled: false,
};

/**
 * Check if a specific notification type is enabled
 */
async function isTypeEnabled(type: NotificationType): Promise<boolean> {
  const masterEnabled = await getSetting<boolean>('notifications');
  if (masterEnabled === false) return false;

  const prefs = await getSetting<NotificationPreferences>('notificationPrefs');
  const merged = { ...DEFAULT_PREFS, ...prefs };

  const map: Record<NotificationType, boolean> = {
    low_stock: merged.lowStock,
    part_added: merged.partAdded,
    part_sold: merged.partSold,
    backup_complete: merged.backupComplete,
    sync: merged.sync,
    custom: true, // custom notifications are always allowed
  };

  return map[type] ?? true;
}

/**
 * Play a short beep for critical notifications
 */
async function playCriticalSound(): Promise<void> {
  const prefs = await getSetting<NotificationPreferences>('notificationPrefs');
  if (!prefs?.soundEnabled) return;
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 880;
    gain.gain.value = 0.3;
    osc.start();
    osc.stop(ctx.currentTime + 0.15);
  } catch {
    // audio not available
  }
}

/**
 * Create a notification
 */
export async function createNotification(input: CreateNotificationInput): Promise<AppNotification | null> {
  // Check if this type is enabled (skip for custom)
  if (input.isSystem !== false) {
    const enabled = await isTypeEnabled(input.type);
    if (!enabled) return null;
  }

  const now = new Date();
  const isScheduled = input.triggerType === 'scheduled' || input.triggerType === 'recurring';

  const notification: AppNotification = {
    id: crypto.randomUUID(),
    type: input.type,
    title: input.title,
    message: input.message,
    isRead: false,
    isSystem: input.isSystem ?? true,
    priority: input.priority ?? 'normal',
    triggerType: input.triggerType ?? 'immediate',
    scheduledAt: input.scheduledAt,
    repeatInterval: input.repeatInterval,
    isFired: !isScheduled, // immediate notifications are "fired" right away
    createdAt: now,
  };

  await db.notifications.add(notification);

  if (notification.priority === 'critical' && notification.isFired) {
    await playCriticalSound();
  }

  return notification;
}

/**
 * Get all notifications with optional filtering
 */
export async function getNotifications(filter?: NotificationFilter): Promise<AppNotification[]> {
  let items = await db.notifications.orderBy('createdAt').reverse().toArray();

  // Only show fired notifications (or immediate ones)
  items = items.filter(n => n.isFired);

  if (filter) {
    if (filter.type) items = items.filter(n => n.type === filter.type);
    if (filter.isRead !== undefined) items = items.filter(n => n.isRead === filter.isRead);
    if (filter.isSystem !== undefined) items = items.filter(n => n.isSystem === filter.isSystem);
    if (filter.startDate) items = items.filter(n => new Date(n.createdAt) >= filter.startDate!);
    if (filter.endDate) items = items.filter(n => new Date(n.createdAt) <= filter.endDate!);
    if (filter.search) {
      const s = filter.search.toLowerCase();
      items = items.filter(n => n.title.toLowerCase().includes(s) || n.message.toLowerCase().includes(s));
    }
  }

  return items;
}

/**
 * Get unread count
 */
export async function getUnreadCount(): Promise<number> {
  const items = await db.notifications.where('isRead').equals(0).toArray();
  return items.filter(n => n.isFired).length;
}

/**
 * Mark a notification as read
 */
export async function markAsRead(id: string): Promise<void> {
  await db.notifications.update(id, { isRead: true });
}

/**
 * Mark all notifications as read
 */
export async function markAllAsRead(): Promise<void> {
  await db.notifications.where('isRead').equals(0).modify({ isRead: true });
}

/**
 * Delete a notification
 */
export async function deleteNotification(id: string): Promise<void> {
  await db.notifications.delete(id);
}

/**
 * Delete all notifications
 */
export async function deleteAllNotifications(): Promise<void> {
  await db.notifications.clear();
}

/**
 * Process scheduled/recurring notifications — call on app mount
 */
export async function processScheduledNotifications(): Promise<number> {
  const now = new Date();
  let firedCount = 0;

  // 1. Fire due scheduled notifications
  const scheduled = await db.notifications
    .filter(n => n.triggerType === 'scheduled' && !n.isFired && n.scheduledAt != null)
    .toArray();

  for (const n of scheduled) {
    if (new Date(n.scheduledAt!) <= now) {
      await db.notifications.update(n.id, { isFired: true, createdAt: now });
      firedCount++;
    }
  }

  // 2. Fire due recurring notifications
  const recurring = await db.notifications
    .filter(n => n.triggerType === 'recurring' && n.repeatInterval != null)
    .toArray();

  for (const n of recurring) {
    const lastFired = n.lastTriggeredAt ? new Date(n.lastTriggeredAt) : new Date(n.createdAt);
    const intervalMs = getIntervalMs(n.repeatInterval!);
    if (now.getTime() - lastFired.getTime() >= intervalMs) {
      // Create a new fired copy
      const copy: AppNotification = {
        ...n,
        id: crypto.randomUUID(),
        isRead: false,
        isFired: true,
        createdAt: now,
      };
      await db.notifications.add(copy);
      await db.notifications.update(n.id, { lastTriggeredAt: now });
      firedCount++;
    }
  }

  return firedCount;
}

function getIntervalMs(interval: string): number {
  switch (interval) {
    case 'daily': return 24 * 60 * 60 * 1000;
    case 'weekly': return 7 * 24 * 60 * 60 * 1000;
    case 'monthly': return 30 * 24 * 60 * 60 * 1000;
    default: return 24 * 60 * 60 * 1000;
  }
}

// ── Templates ──

export async function getTemplates(): Promise<NotificationTemplate[]> {
  return db.notificationTemplates.orderBy('createdAt').reverse().toArray();
}

export async function createTemplate(title: string, message: string): Promise<NotificationTemplate> {
  const t: NotificationTemplate = {
    id: crypto.randomUUID(),
    title,
    message,
    createdAt: new Date(),
  };
  await db.notificationTemplates.add(t);
  return t;
}

export async function deleteTemplate(id: string): Promise<void> {
  await db.notificationTemplates.delete(id);
}

// ── Preferences helpers ──

export async function getNotificationPrefs(): Promise<NotificationPreferences> {
  const prefs = await getSetting<NotificationPreferences>('notificationPrefs');
  return { ...DEFAULT_PREFS, ...prefs };
}

export async function saveNotificationPrefs(prefs: NotificationPreferences): Promise<void> {
  const { updateSetting } = await import('@/db/database');
  await updateSetting('notificationPrefs', prefs);
}

// ── Convenience auto-notification creators ──

export async function notifyPartAdded(partName: string, sku: string): Promise<void> {
  await createNotification({
    type: 'part_added',
    title: 'New Part Added',
    message: `${partName} (SKU: ${sku}) has been added to inventory.`,
    isSystem: true,
  });
}

export async function notifyPartSold(partName: string, qty: number, total: number): Promise<void> {
  await createNotification({
    type: 'part_sold',
    title: 'Sale Recorded',
    message: `Sold ${qty}x ${partName} for Rs ${total.toLocaleString()}.`,
    isSystem: true,
  });
}

export async function notifyLowStock(partName: string, currentQty: number): Promise<void> {
  await createNotification({
    type: 'low_stock',
    title: 'Low Stock Alert',
    message: `${partName} is low on stock (${currentQty} remaining).`,
    priority: 'critical',
    isSystem: true,
  });
}

export async function notifyBackupComplete(filename: string): Promise<void> {
  await createNotification({
    type: 'backup_complete',
    title: 'Backup Completed',
    message: `Backup "${filename}" has been created successfully.`,
    isSystem: true,
  });
}
