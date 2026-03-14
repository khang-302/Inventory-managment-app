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
import type { CrashReport } from '@/types/crashReport';

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
  crashReports!: Table<CrashReport>;

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

    // Version 3: Schema update
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

    // Version 7: Add crash reports
    this.version(7).stores({
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
      notificationTemplates: 'id, createdAt',
      crashReports: 'id, errorCode, createdAt'
    });

    // Version 8: Schema update
    this.version(8).stores({
      parts: 'id, name, sku, brandId, categoryId, quantity, createdAt, updatedAt, isDemo',
      brands: 'id, name, createdAt',
      categories: 'id, name, createdAt',
      sales: 'id, partId, createdAt',
      activityLogs: 'id, action, entityType, createdAt, isDeleted',
      settings: 'id, key',
      backupRecords: 'id, type, createdAt',
      billSettings: 'id',
      bills: 'id, billNumber, createdAt, isDemo',
      billItems: 'id, billId',
      autocompleteEntries: 'id, field, [field+value]',
      notifications: 'id, type, isRead, createdAt, triggerType, isFired',
      notificationTemplates: 'id, createdAt',
      crashReports: 'id, errorCode, createdAt'
    });

    // Version 9: Schema update
    this.version(9).stores({
      parts: 'id, name, sku, brandId, categoryId, quantity, createdAt, updatedAt, isDemo',
      brands: 'id, name, createdAt',
      categories: 'id, name, createdAt',
      sales: 'id, partId, createdAt, isDemo',
      activityLogs: 'id, action, entityType, createdAt, isDeleted',
      settings: 'id, key',
      backupRecords: 'id, type, createdAt',
      billSettings: 'id',
      bills: 'id, billNumber, createdAt, isDemo',
      billItems: 'id, billId',
      autocompleteEntries: 'id, field, [field+value]',
      notifications: 'id, type, isRead, createdAt, triggerType, isFired',
      notificationTemplates: 'id, createdAt',
      crashReports: 'id, errorCode, createdAt'
    });

    // Version 10: Schema cleanup
    this.version(10).stores({
      parts: 'id, name, sku, brandId, categoryId, quantity, createdAt, updatedAt',
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
      notificationTemplates: 'id, createdAt',
      crashReports: 'id, errorCode, createdAt'
    });

    // Version 11: Purge legacy demo records from IndexedDB
    this.version(11).stores({
      parts: 'id, name, sku, brandId, categoryId, quantity, createdAt, updatedAt',
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
      notificationTemplates: 'id, createdAt',
      crashReports: 'id, errorCode, createdAt'
    }).upgrade(async (tx) => {
      // Delete all parts with SKU starting with "DEMO-"
      const demoParts = await tx.table('parts').filter((p: any) => 
        p.sku && typeof p.sku === 'string' && p.sku.startsWith('DEMO-')
      ).toArray();
      
      const demoPartIds = new Set(demoParts.map((p: any) => p.id));
      
      if (demoPartIds.size > 0) {
        // Delete demo parts
        await tx.table('parts').bulkDelete([...demoPartIds]);
        
        // Delete sales referencing demo parts
        const demoSales = await tx.table('sales').filter((s: any) => demoPartIds.has(s.partId)).toArray();
        if (demoSales.length > 0) {
          await tx.table('sales').bulkDelete(demoSales.map((s: any) => s.id));
        }
      }

      // Delete bills with demo-like patterns (customer "Walk-in Customer" with demo items)
      const allBills = await tx.table('bills').toArray();
      const billItems = await tx.table('billItems').toArray();
      
      for (const bill of allBills) {
        const items = billItems.filter((bi: any) => bi.billId === bill.id);
        const allItemsDemo = items.length > 0 && items.every((bi: any) => {
          const partName = bi.partName || bi.name || '';
          return demoPartIds.has(bi.partId) || partName.match(/^(Pitman Arm|Tie Rod|Ball Joint|Brake Pad|Oil Filter|Air Filter|Spark Plug|Clutch Plate|Shock Absorber|Radiator Hose)/);
        });
        
        if (allItemsDemo && items.length > 0) {
          await tx.table('bills').delete(bill.id);
          await tx.table('billItems').bulkDelete(items.map((i: any) => i.id));
        }
      }
      
      console.log(`[DB Migration v11] Purged ${demoPartIds.size} demo parts and associated records`);
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
    { key: 'autoGenerateBill', value: false },
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
