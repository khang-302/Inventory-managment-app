import { db } from '@/db/database';
import type { BillSettings, Bill, BillItem, BillFormItem } from '@/types/bill';
import { v4 as uuidv4 } from 'uuid';
import { logActivity } from './activityLogService';

const DEFAULT_SETTINGS: Omit<BillSettings, 'id' | 'updatedAt'> = {
  shopName: 'Amir Traders',
  tagline: 'Cater Pillar Machinery Parts',
  ownerName: 'Amir Shah',
  phone1: '0346-9900252',
  phone2: '0333-9962461',
  address: 'Shop #53, Block B, Al-Madina Plaza, Tarnol, Islamabad',
  logoPath: null,
  footerMessage: 'Thank you for your business',
  lastBillNumber: 0,
};

export async function getBillSettings(): Promise<BillSettings> {
  const existing = await db.table('billSettings').toArray();
  if (existing.length > 0) return existing[0] as BillSettings;
  
  const settings: BillSettings = {
    id: uuidv4(),
    ...DEFAULT_SETTINGS,
    updatedAt: new Date(),
  };
  await db.table('billSettings').add(settings);
  return settings;
}

export async function updateBillSettings(data: Partial<BillSettings>): Promise<BillSettings> {
  const settings = await getBillSettings();
  const updated = { ...settings, ...data, updatedAt: new Date() };
  await db.table('billSettings').put(updated);
  return updated;
}

export async function getNextBillNumber(): Promise<string> {
  const settings = await getBillSettings();
  const next = settings.lastBillNumber + 1;
  return `AMT-${String(next).padStart(4, '0')}`;
}

export async function resetBillCounter(): Promise<void> {
  const settings = await getBillSettings();
  await db.table('billSettings').update(settings.id, { lastBillNumber: 0, updatedAt: new Date() });
}

export async function createBill(
  buyerName: string,
  buyerPhone: string,
  date: Date,
  items: BillFormItem[],
  discount: number,
  notes: string,
): Promise<Bill> {
  const settings = await getBillSettings();
  const nextNum = settings.lastBillNumber + 1;
  const billNumber = `AMT-${String(nextNum).padStart(4, '0')}`;

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.price, 0);
  const finalTotal = subtotal - discount;

  const bill: Bill = {
    id: uuidv4(),
    billNumber,
    buyerName,
    buyerPhone,
    date,
    subtotal,
    discount,
    finalTotal,
    notes,
    createdAt: new Date(),
  };

  const billItems: BillItem[] = items.map(item => ({
    id: uuidv4(),
    billId: bill.id,
    partName: item.partName,
    partCode: item.partCode,
    brand: item.brand,
    quantity: item.quantity,
    price: item.price,
    total: item.quantity * item.price,
  }));

  await db.transaction('rw', [db.table('bills'), db.table('billItems'), db.table('billSettings')], async () => {
    await db.table('bills').add(bill);
    await db.table('billItems').bulkAdd(billItems);
    await db.table('billSettings').update(settings.id, { lastBillNumber: nextNum, updatedAt: new Date() });
  });

  await logActivity({
    action: 'create',
    entityType: 'sale',
    entityId: bill.id,
    description: `Bill ${billNumber} created for ${buyerName} – Rs ${finalTotal.toLocaleString()}`,
  });

  return bill;
}

export async function getAllBills(): Promise<Bill[]> {
  return db.table('bills').orderBy('createdAt').reverse().toArray();
}

export async function getBillById(id: string): Promise<Bill | undefined> {
  return db.table('bills').get(id);
}

export async function getBillItems(billId: string): Promise<BillItem[]> {
  return db.table('billItems').where('billId').equals(billId).toArray();
}

export async function deleteBill(id: string): Promise<boolean> {
  const bill = await db.table('bills').get(id) as Bill | undefined;
  if (!bill) return false;

  await db.transaction('rw', [db.table('bills'), db.table('billItems')], async () => {
    await db.table('billItems').where('billId').equals(id).delete();
    await db.table('bills').delete(id);
  });

  await logActivity({
    action: 'delete',
    entityType: 'sale',
    entityId: id,
    description: `Deleted bill ${bill.billNumber}`,
  });

  return true;
}
