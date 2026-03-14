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
import type { Bill, BillItem, BillSettings } from '@/types/bill';

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
  billSettings!: Table<BillSettings>;
  bills!: Table<Bill>;
  billItems!: Table<BillItem>;

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

    this.version(2).stores({
      parts: 'id, name, sku, brandId, categoryId, quantity, createdAt, updatedAt',
      brands: 'id, name, createdAt',
      categories: 'id, name, createdAt',
      sales: 'id, partId, createdAt',
      activityLogs: 'id, action, entityType, createdAt, isDeleted',
      settings: 'id, key',
      backupRecords: 'id, type, createdAt'
    });

    this.version(3).stores({
      parts: 'id, name, sku, brandId, categoryId, quantity, createdAt, updatedAt, isDemo',
      brands: 'id, name, createdAt',
      categories: 'id, name, createdAt',
      sales: 'id, partId, createdAt',
      activityLogs: 'id, action, entityType, createdAt, isDeleted',
      settings: 'id, key',
      backupRecords: 'id, type, createdAt'
    });

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
      const demoParts = await tx.table('parts').filter((p: any) => 
        p.sku && typeof p.sku === 'string' && p.sku.startsWith('DEMO-')
      ).toArray();
      
      const demoPartIds = new Set(demoParts.map((p: any) => p.id));
      
      if (demoPartIds.size > 0) {
        await tx.table('parts').bulkDelete([...demoPartIds]);
        const demoSales = await tx.table('sales').filter((s: any) => demoPartIds.has(s.partId)).toArray();
        if (demoSales.length > 0) {
          await tx.table('sales').bulkDelete(demoSales.map((s: any) => s.id));
        }
      }

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

    this.version(12).stores({
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
      const allParts = await tx.table('parts').toArray();
      const validPartIds = new Set(allParts.map((p: any) => p.id));
      const allSales = await tx.table('sales').toArray();
      const orphanedSales = allSales.filter((s: any) => !validPartIds.has(s.partId));
      if (orphanedSales.length > 0) {
        await tx.table('sales').bulkDelete(orphanedSales.map((s: any) => s.id));
      }

      const allBillItems = await tx.table('billItems').toArray();
      const demoBillIds = new Set<string>();
      for (const item of allBillItems) {
        const code = (item as any).partCode || '';
        if (typeof code === 'string' && code.startsWith('DEMO-')) {
          demoBillIds.add((item as any).billId);
        }
      }

      if (demoBillIds.size > 0) {
        await tx.table('bills').bulkDelete([...demoBillIds]);
        const itemsToDelete = allBillItems.filter((i: any) => demoBillIds.has(i.billId));
        await tx.table('billItems').bulkDelete(itemsToDelete.map((i: any) => i.id));
      }

      const billSettings = await tx.table('billSettings').toArray();
      if (billSettings.length > 0) {
        await tx.table('billSettings').update(billSettings[0].id, { lastBillNumber: 0, updatedAt: new Date() });
      }

      const deletedEntityIds = new Set([
        ...orphanedSales.map((s: any) => s.id),
        ...demoBillIds,
      ]);
      if (deletedEntityIds.size > 0) {
        const logs = await tx.table('activityLogs').toArray();
        const logsToDelete = logs.filter((l: any) => l.entityId && deletedEntityIds.has(l.entityId));
        if (logsToDelete.length > 0) {
          await tx.table('activityLogs').bulkDelete(logsToDelete.map((l: any) => l.id));
        }
      }

      console.log(`[DB Migration v12] Purged ${orphanedSales.length} orphaned sales, ${demoBillIds.size} demo bills, and related activity logs`);
    });

    // Version 13: Performance optimization — compound indexes for sales/bills/parts search
    this.version(13).stores({
      parts: 'id, name, sku, brandId, categoryId, quantity, createdAt, updatedAt',
      brands: 'id, name, createdAt',
      categories: 'id, name, createdAt',
      sales: 'id, partId, createdAt, [partId+createdAt]',
      activityLogs: 'id, action, entityType, createdAt, isDeleted',
      settings: 'id, key',
      backupRecords: 'id, type, createdAt',
      billSettings: 'id',
      bills: 'id, billNumber, buyerName, createdAt',
      billItems: 'id, billId',
      autocompleteEntries: 'id, field, [field+value]',
      notifications: 'id, type, isRead, createdAt, triggerType, isFired',
      notificationTemplates: 'id, createdAt',
      crashReports: 'id, errorCode, createdAt'
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

  // Production integrity checks (non-blocking)
  try {
    await runIntegrityChecks();
  } catch (e) {
    console.warn('[DB] Integrity check failed:', e);
  }
}

/**
 * Startup integrity checks — remove orphaned/invalid records
 */
async function runIntegrityChecks(): Promise<void> {
  // 1. Remove sales with NaN/invalid totalAmount or profit
  const allSales = await db.sales.toArray();
  const invalidSaleIds = allSales
    .filter(s => !isFinite(Number(s.totalAmount)) || !isFinite(Number(s.profit)))
    .map(s => s.id);
  if (invalidSaleIds.length > 0) {
    await db.sales.bulkDelete(invalidSaleIds);
    console.log(`[DB Integrity] Removed ${invalidSaleIds.length} invalid sales`);
  }

  // 2. Remove orphaned billItems whose billId doesn't exist
  const allBillIds = new Set((await db.bills.toArray()).map(b => b.id));
  const allBillItems = await db.billItems.toArray();
  const orphanedItemIds = allBillItems
    .filter(bi => !allBillIds.has(bi.billId))
    .map(bi => bi.id);
  if (orphanedItemIds.length > 0) {
    await db.billItems.bulkDelete(orphanedItemIds);
    console.log(`[DB Integrity] Removed ${orphanedItemIds.length} orphaned bill items`);
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

// Export entire database for backup (complete)
export async function exportDatabase(): Promise<{
  parts: Part[];
  brands: Brand[];
  categories: Category[];
  sales: Sale[];
  activityLogs: ActivityLog[];
  settings: AppSettings[];
  bills: Bill[];
  billItems: BillItem[];
  autocompleteEntries: AutocompleteEntry[];
  exportedAt: string;
  version: number;
}> {
  const [parts, brands, categories, sales, activityLogs, settings, bills, billItems, autocompleteEntries] = await Promise.all([
    db.parts.toArray(),
    db.brands.toArray(),
    db.categories.toArray(),
    db.sales.toArray(),
    db.activityLogs.toArray(),
    db.settings.toArray(),
    db.bills.toArray(),
    db.billItems.toArray(),
    db.autocompleteEntries.toArray(),
  ]);

  return {
    parts,
    brands,
    categories,
    sales,
    activityLogs,
    settings,
    bills,
    billItems,
    autocompleteEntries,
    exportedAt: new Date().toISOString(),
    version: 2,
  };
}

// Import database from backup (complete)
export async function importDatabase(data: {
  parts?: Part[];
  brands?: Brand[];
  categories?: Category[];
  sales?: Sale[];
  activityLogs?: ActivityLog[];
  settings?: AppSettings[];
  bills?: Bill[];
  billItems?: BillItem[];
  autocompleteEntries?: AutocompleteEntry[];
}): Promise<{ success: boolean; message: string }> {
  try {
    await db.transaction('rw', [db.parts, db.brands, db.categories, db.sales, db.activityLogs, db.settings, db.bills, db.billItems, db.autocompleteEntries], async () => {
      // Clear existing data
      await Promise.all([
        db.parts.clear(),
        db.brands.clear(),
        db.categories.clear(),
        db.sales.clear(),
        db.activityLogs.clear(),
        db.settings.clear(),
        db.bills.clear(),
        db.billItems.clear(),
        db.autocompleteEntries.clear(),
      ]);

      // Import new data
      if (data.parts?.length) await db.parts.bulkAdd(data.parts);
      if (data.brands?.length) await db.brands.bulkAdd(data.brands);
      if (data.categories?.length) await db.categories.bulkAdd(data.categories);
      if (data.sales?.length) await db.sales.bulkAdd(data.sales);
      if (data.activityLogs?.length) await db.activityLogs.bulkAdd(data.activityLogs);
      if (data.settings?.length) await db.settings.bulkAdd(data.settings);
      if (data.bills?.length) await db.bills.bulkAdd(data.bills);
      if (data.billItems?.length) await db.billItems.bulkAdd(data.billItems);
      if (data.autocompleteEntries?.length) await db.autocompleteEntries.bulkAdd(data.autocompleteEntries);
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
    db.bills.clear(),
    db.billItems.clear(),
    db.autocompleteEntries.clear(),
    db.notifications.clear(),
    db.crashReports.clear(),
  ]);
}
