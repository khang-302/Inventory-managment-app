import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/db/database';
import {
  getBillSettings,
  updateBillSettings,
  getNextBillNumber,
  createBill,
  getAllBills,
  getBillById,
  getBillItems,
  updateBill,
  deleteBill,
  resetBillCounter,
} from './billService';

describe('Bill Service', () => {
  beforeEach(async () => {
    await db.table('billSettings').clear();
    await db.table('bills').clear();
    await db.table('billItems').clear();
    await db.activityLogs.clear();
  });

  describe('getBillSettings', () => {
    it('creates default settings on first call', async () => {
      const settings = await getBillSettings();
      expect(settings.id).toBeDefined();
      expect(settings.shopName).toBe('Amir Traders');
      expect(settings.lastBillNumber).toBe(0);
    });

    it('returns existing settings on subsequent calls', async () => {
      const first = await getBillSettings();
      const second = await getBillSettings();
      expect(second.id).toBe(first.id);
    });
  });

  describe('updateBillSettings', () => {
    it('updates specific fields', async () => {
      await getBillSettings(); // ensure defaults exist
      const updated = await updateBillSettings({ shopName: 'New Shop' });
      expect(updated.shopName).toBe('New Shop');
      expect(updated.ownerName).toBe('Amir Shah'); // unchanged
    });
  });

  describe('getNextBillNumber', () => {
    it('generates sequential bill numbers', async () => {
      const first = await getNextBillNumber();
      expect(first).toBe('AMT-0001');
    });
  });

  describe('resetBillCounter', () => {
    it('resets counter to 0', async () => {
      await getBillSettings();
      await updateBillSettings({ lastBillNumber: 10 } as any);
      await resetBillCounter();
      const next = await getNextBillNumber();
      expect(next).toBe('AMT-0001');
    });
  });

  describe('createBill', () => {
    it('creates a bill with items', async () => {
      const bill = await createBill(
        'Ali Khan', '03001234567', new Date(),
        [
          { partName: 'Brake Pad', partCode: 'BP-001', brand: 'CAT', quantity: 2, price: 500 },
          { partName: 'Oil Filter', partCode: 'OF-001', brand: 'ITR', quantity: 1, price: 300 },
        ],
        0, 'Test bill',
      );

      expect(bill.id).toBeDefined();
      expect(bill.billNumber).toBe('AMT-0001');
      expect(bill.buyerName).toBe('Ali Khan');
      expect(bill.subtotal).toBe(2 * 500 + 1 * 300);
      expect(bill.finalTotal).toBe(1300);

      const items = await getBillItems(bill.id);
      expect(items.length).toBe(2);
    });

    it('applies discount correctly', async () => {
      const bill = await createBill(
        'Test', '0300', new Date(),
        [{ partName: 'Part', partCode: 'P1', brand: 'B', quantity: 1, price: 1000 }],
        100, '',
      );
      expect(bill.subtotal).toBe(1000);
      expect(bill.discount).toBe(100);
      expect(bill.finalTotal).toBe(900);
    });

    it('increments bill number sequentially', async () => {
      await createBill('A', '', new Date(), [{ partName: 'P', partCode: '', brand: '', quantity: 1, price: 100 }], 0, '');
      await createBill('B', '', new Date(), [{ partName: 'Q', partCode: '', brand: '', quantity: 1, price: 100 }], 0, '');

      const bills = await getAllBills();
      const numbers = bills.map(b => b.billNumber).sort();
      expect(numbers).toContain('AMT-0001');
      expect(numbers).toContain('AMT-0002');
    });
  });

  describe('updateBill', () => {
    it('updates bill details and replaces items', async () => {
      const bill = await createBill(
        'Ali', '', new Date(),
        [{ partName: 'Old Part', partCode: '', brand: '', quantity: 1, price: 100 }],
        0, '',
      );

      const updated = await updateBill(
        bill.id, 'New Name', '0300', new Date(),
        [{ partName: 'New Part', partCode: '', brand: '', quantity: 2, price: 500 }],
        50, 'Updated',
      );

      expect(updated.buyerName).toBe('New Name');
      expect(updated.subtotal).toBe(1000);
      expect(updated.finalTotal).toBe(950);

      const items = await getBillItems(bill.id);
      expect(items.length).toBe(1);
      expect(items[0].partName).toBe('New Part');
    });
  });

  describe('deleteBill', () => {
    it('removes bill and its items', async () => {
      const bill = await createBill(
        'Ali', '', new Date(),
        [{ partName: 'Part', partCode: '', brand: '', quantity: 1, price: 100 }],
        0, '',
      );

      const result = await deleteBill(bill.id);
      expect(result).toBe(true);

      const found = await getBillById(bill.id);
      expect(found).toBeUndefined();

      const items = await getBillItems(bill.id);
      expect(items.length).toBe(0);
    });

    it('returns false for non-existent bill', async () => {
      const result = await deleteBill('non-existent');
      expect(result).toBe(false);
    });
  });
});
