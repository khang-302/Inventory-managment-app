import Dexie, { Table } from 'dexie';
import type { 
  Part, 
  Brand, 
  Category, 
  Sale, 
  ActivityLog, 
  AppSettings, 
  BackupRecord,
  AutocompleteEntry 
} from '@/types';
import type { AppNotification, NotificationTemplate } from '@/types/notification';

// Ameer Autos Database - Dexie.js (IndexedDB) Setup
export class AmeerAutosDB extends Dexie {
  parts!: Table<Part>;
  brands!: Table<Brand>;
  categories!: Table<Category>;
  sales!: Table<Sale>;
  activityLogs!: Table<ActivityLog>;
  settings!: Table<AppSettings>;
  backupRecords!: Table<BackupRecord>;
  autocompleteEntries!: Table<AutocompleteEntry>;
  notifications!: Table<AppNotification>;
  notificationTemplates!: Table<NotificationTemplate>;

  constructor() {
    super('AmeerAutosDB');
    
    this.version(1).stores({
      parts: 'id, name, sku, brandId, categoryId, quantity, createdAt, updatedAt',
      brands: 'id, name, createdAt',
      categories: 'id, name, createdAt',
      sales: 'id, partId, createdAt',
      activityLogs: 'id, action, entityType, createdAt',
      settings: 'id, key',
      backupRecords: 'id, type, createdAt'
    });

    // Version 2: Add isDeleted to activityLogs
    this.version(2).stores({
      parts: 'id, name, sku, brandId, categoryId, quantity, createdAt, updatedAt',
      brands: 'id, name, createdAt',
      categories: 'id, name, createdAt',
      sales: 'id, partId, createdAt',
      activityLogs: 'id, action, entityType, createdAt, isDeleted',
      settings: 'id, key',
      backupRecords: 'id, type, createdAt'
    });

    // Version 3: Add isDemo index to parts
    this.version(3).stores({
      parts: 'id, name, sku, brandId, categoryId, quantity, createdAt, updatedAt, isDemo',
      brands: 'id, name, createdAt',
      categories: 'id, name, createdAt',
      sales: 'id, partId, createdAt',
      activityLogs: 'id, action, entityType, createdAt, isDeleted',
      settings: 'id, key',
      backupRecords: 'id, type, createdAt'
    });

    // Version 4: Add bill tables
    this.version(4).stores({
      parts: 'id, name, sku, brandId, categoryId, quantity, createdAt, updatedAt, isDemo',
      brands: 'id, name, createdAt',
      categories: 'id, name, createdAt',
      sales: 'id, partId, createdAt',
      activityLogs: 'id, action, entityType, createdAt, isDeleted',
      settings: 'id, key',
      backupRecords: 'id, type, createdAt',
      billSettings: 'id',
      bills: 'id, billNumber, createdAt',
      billItems: 'id, billId'
    });

    // Version 5: Add autocomplete entries
    this.version(5).stores({
      parts: 'id, name, sku, brandId, categoryId, quantity, createdAt, updatedAt, isDemo',
      brands: 'id, name, createdAt',
      categories: 'id, name, createdAt',
      sales: 'id, partId, createdAt',
      activityLogs: 'id, action, entityType, createdAt, isDeleted',
      settings: 'id, key',
      backupRecords: 'id, type, createdAt',
      billSettings: 'id',
      bills: 'id, billNumber, createdAt',
      billItems: 'id, billId',
      autocompleteEntries: 'id, field, [field+value]'
    });

    // Version 6: Add notifications and templates
    this.version(6).stores({
      parts: 'id, name, sku, brandId, categoryId, quantity, createdAt, updatedAt, isDemo',
      brands: 'id, name, createdAt',
      categories: 'id, name, createdAt',
      sales: 'id, partId, createdAt',
      activityLogs: 'id, action, entityType, createdAt, isDeleted',
      settings: 'id, key',
      backupRecords: 'id, type, createdAt',
      billSettings: 'id',
      bills: 'id, billNumber, createdAt',
      billItems: 'id, billId',
      autocompleteEntries: 'id, field, [field+value]',
      notifications: 'id, type, isRead, createdAt, triggerType, isFired',
      notificationTemplates: 'id, createdAt'
    });
  }
}

// Single database instance for the entire app
export const db = new AmeerAutosDB();

// Initialize default settings if not exists
export async function initializeDatabase(): Promise<void> {
  const defaultSettings: Array<{ key: string; value: unknown }> = [
    { key: 'theme', value: 'dark' },
    { key: 'language', value: 'en' },
    { key: 'currencyFormat', value: 'Rs' },
    { key: 'dateFormat', value: 'dd/MM/yyyy' },
    { key: 'notifications', value: true },
    { key: 'syncEnabled', value: false },
    { key: 'syncApiKey', value: '' },
    { key: 'syncFolderId', value: '' },
    { key: 'lastSyncTime', value: null },
  ];

  for (const setting of defaultSettings) {
    const existing = await db.settings.where('key').equals(setting.key).first();
    if (!existing) {
      await db.settings.add({
        id: crypto.randomUUID(),
        key: setting.key,
        value: setting.value,
        updatedAt: new Date(),
      });
    }
  }
}

// Get a setting value by key
export async function getSetting<T>(key: string): Promise<T | undefined> {
  const setting = await db.settings.where('key').equals(key).first();
  return setting?.value as T | undefined;
}

// Update a setting value
export async function updateSetting(key: string, value: unknown): Promise<void> {
  const existing = await db.settings.where('key').equals(key).first();
  if (existing) {
    await db.settings.update(existing.id, { value, updatedAt: new Date() });
  } else {
    await db.settings.add({
      id: crypto.randomUUID(),
      key,
      value,
      updatedAt: new Date(),
    });
  }
}

// Export entire database for backup
export async function exportDatabase(): Promise<{
  parts: Part[];
  brands: Brand[];
  categories: Category[];
  sales: Sale[];
  activityLogs: ActivityLog[];
  settings: AppSettings[];
  exportedAt: string;
  version: number;
}> {
  const [parts, brands, categories, sales, activityLogs, settings] = await Promise.all([
    db.parts.toArray(),
    db.brands.toArray(),
    db.categories.toArray(),
    db.sales.toArray(),
    db.activityLogs.toArray(),
    db.settings.toArray(),
  ]);

  return {
    parts,
    brands,
    categories,
    sales,
    activityLogs,
    settings,
    exportedAt: new Date().toISOString(),
    version: 1,
  };
}

// Import database from backup
export async function importDatabase(data: {
  parts?: Part[];
  brands?: Brand[];
  categories?: Category[];
  sales?: Sale[];
  activityLogs?: ActivityLog[];
  settings?: AppSettings[];
}): Promise<{ success: boolean; message: string }> {
  try {
    await db.transaction('rw', [db.parts, db.brands, db.categories, db.sales, db.activityLogs, db.settings], async () => {
      // Clear existing data
      await Promise.all([
        db.parts.clear(),
        db.brands.clear(),
        db.categories.clear(),
        db.sales.clear(),
        db.activityLogs.clear(),
        db.settings.clear(),
      ]);

      // Import new data
      if (data.parts?.length) await db.parts.bulkAdd(data.parts);
      if (data.brands?.length) await db.brands.bulkAdd(data.brands);
      if (data.categories?.length) await db.categories.bulkAdd(data.categories);
      if (data.sales?.length) await db.sales.bulkAdd(data.sales);
      if (data.activityLogs?.length) await db.activityLogs.bulkAdd(data.activityLogs);
      if (data.settings?.length) await db.settings.bulkAdd(data.settings);

      // Ensure demoDataCleared flag is set so cleanup never wipes restored data
      const hasDemoFlag = (data.settings || []).some((s: any) => s.key === 'demoDataCleared');
      if (!hasDemoFlag) {
        await db.settings.add({
          id: crypto.randomUUID(),
          key: 'demoDataCleared',
          value: true,
          updatedAt: new Date(),
        });
      }
    });

    return { success: true, message: 'Database restored successfully' };
  } catch (error) {
    console.error('Import failed:', error);
    return { success: false, message: `Import failed: ${error instanceof Error ? error.message : 'Unknown error'}` };
  }
}

// Clear all data (for testing or reset)
export async function clearDatabase(): Promise<void> {
  await Promise.all([
    db.parts.clear(),
    db.brands.clear(),
    db.categories.clear(),
    db.sales.clear(),
    db.activityLogs.clear(),
    db.settings.clear(),
    db.backupRecords.clear(),
  ]);
}
