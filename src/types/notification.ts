// Notification system types

export type NotificationType = 
  | 'low_stock' 
  | 'part_added' 
  | 'part_sold' 
  | 'backup_complete' 
  | 'sync' 
  | 'custom';

export type NotificationPriority = 'normal' | 'critical';

export type NotificationTrigger = 'immediate' | 'scheduled' | 'recurring';

export type RepeatInterval = 'daily' | 'weekly' | 'monthly';

export interface AppNotification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  isRead: boolean;
  isSystem: boolean;
  priority: NotificationPriority;
  triggerType: NotificationTrigger;
  scheduledAt?: Date;
  repeatInterval?: RepeatInterval;
  lastTriggeredAt?: Date;
  isFired: boolean; // whether scheduled/recurring notification has been dispatched
  createdAt: Date;
}

export interface NotificationTemplate {
  id: string;
  title: string;
  message: string;
  createdAt: Date;
}

export interface NotificationPreferences {
  lowStock: boolean;
  partAdded: boolean;
  partSold: boolean;
  backupComplete: boolean;
  sync: boolean;
  soundEnabled: boolean;
}

export interface CreateNotificationInput {
  type: NotificationType;
  title: string;
  message: string;
  priority?: NotificationPriority;
  triggerType?: NotificationTrigger;
  scheduledAt?: Date;
  repeatInterval?: RepeatInterval;
  isSystem?: boolean;
}

export interface NotificationFilter {
  type?: NotificationType;
  isRead?: boolean;
  isSystem?: boolean;
  startDate?: Date;
  endDate?: Date;
  search?: string;
}
