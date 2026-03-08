import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/db/database';
import { createPart } from './inventoryService';
import {
  recordSale,
  recordMultiSale,
  getAllSales,
  getTodaySales,
  deleteSale,
  getSalesSummary,
  getTopSellingParts,
} from './salesService';
import type { PartFormData } from '@/types';

const makePart = (overrides?: Partial<PartFormData>): PartFormData => ({
  name: 'Brake Pad',
  sku: 'BP-001',
  brandId: 'brand-1',
  categoryId: 'cat-1',
  unitType: 'piece',
  quantity: 50,
  minStockLevel: 5,
  buyingPrice: 500,
  sellingPrice: 800,
  location: '',
  notes: '',
  images: [],
  ...overrides,
});

describe('Sales Service', () => {
  beforeEach(async () => {
    await db.parts.clear();
    await db.sales.clear();
    await db.activityLogs.clear();
  });

  describe('recordSale (single-item)', () => {
    it('records a sale and decrements stock', async () => {
      const part = await createPart(makePart({ quantity: 50 }));
      const result = await recordSale({
        partId: part.id,
        quantity: 5,
        unitPrice: 800,
      });

      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        expect(result.quantity).toBe(5);
        expect(result.totalAmount).toBe(5 * 800);
        expect(result.profit).toBe((800 - 500) * 5);
      }

      // Stock should be decremented
      const updatedPart = await db.parts.get(part.id);
      expect(updatedPart!.quantity).toBe(45);
    });

    it('returns error for insufficient stock', async () => {
      const part = await createPart(makePart({ quantity: 3 }));
      const result = await recordSale({
        partId: part.id,
        quantity: 10,
        unitPrice: 800,
      });

      expect('error' in result).toBe(true);
      if ('error' in result) {
        expect(result.error).toContain('Insufficient stock');
      }

      // Stock should remain unchanged
      const unchanged = await db.parts.get(part.id);
      expect(unchanged!.quantity).toBe(3);
    });

    it('returns error for zero quantity', async () => {
      const part = await createPart(makePart());
      const result = await recordSale({
        partId: part.id,
        quantity: 0,
        unitPrice: 800,
      });
      expect('error' in result).toBe(true);
    });

    it('returns error for non-existent part', async () => {
      const result = await recordSale({
        partId: 'non-existent',
        quantity: 1,
        unitPrice: 100,
      });
      expect('error' in result).toBe(true);
    });
  });

  describe('recordMultiSale', () => {
    it('records multiple items atomically', async () => {
      const part1 = await createPart(makePart({ name: 'Part A', sku: 'A-001', quantity: 20 }));
      const part2 = await createPart(makePart({ name: 'Part B', sku: 'B-001', quantity: 15 }));

      const result = await recordMultiSale({
        items: [
          { partId: part1.id, quantity: 3, unitPrice: 800 },
          { partId: part2.id, quantity: 2, unitPrice: 900 },
        ],
        customerName: 'Ali',
      });

      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        expect(result.sales.length).toBe(2);
      }

      const updatedP1 = await db.parts.get(part1.id);
      const updatedP2 = await db.parts.get(part2.id);
      expect(updatedP1!.quantity).toBe(17);
      expect(updatedP2!.quantity).toBe(13);
    });

    it('returns error for empty cart', async () => {
      const result = await recordMultiSale({ items: [] });
      expect('error' in result).toBe(true);
    });

    it('returns error if any part has insufficient stock', async () => {
      const part = await createPart(makePart({ quantity: 2, sku: 'S1' }));
      const result = await recordMultiSale({
        items: [{ partId: part.id, quantity: 10, unitPrice: 800 }],
      });
      expect('error' in result).toBe(true);
      // Stock should remain unchanged
      const unchanged = await db.parts.get(part.id);
      expect(unchanged!.quantity).toBe(2);
    });
  });

  describe('deleteSale', () => {
    it('deletes a sale and restores stock', async () => {
      const part = await createPart(makePart({ quantity: 50 }));
      const sale = await recordSale({
        partId: part.id,
        quantity: 5,
        unitPrice: 800,
      });
      expect('error' in sale).toBe(false);
      if ('error' in sale) return;

      const result = await deleteSale(sale.id);
      expect(result).toBe(true);

      const restoredPart = await db.parts.get(part.id);
      expect(restoredPart!.quantity).toBe(50); // restored
    });

    it('handles QuickSell delete without crashing (no stock restore)', async () => {
      // Simulate a QuickSell sale (partId is empty)
      const quickSale = {
        id: 'qs-1',
        partId: '',
        partName: 'Random Part',
        partSku: 'QS-123',
        quantity: 3,
        unitPrice: 500,
        totalAmount: 1500,
        buyingPrice: 300,
        profit: 600,
        createdAt: new Date(),
      };
      await db.sales.add(quickSale);

      const result = await deleteSale('qs-1');
      expect(result).toBe(true);

      const deleted = await db.sales.get('qs-1');
      expect(deleted).toBeUndefined();
    });

    it('returns false for non-existent sale', async () => {
      const result = await deleteSale('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('getAllSales', () => {
    it('returns sales in reverse chronological order', async () => {
      const part = await createPart(makePart({ quantity: 100 }));
      await recordSale({ partId: part.id, quantity: 1, unitPrice: 100 });
      await recordSale({ partId: part.id, quantity: 2, unitPrice: 200 });

      const sales = await getAllSales();
      expect(sales.length).toBe(2);
      expect(new Date(sales[0].createdAt).getTime()).toBeGreaterThanOrEqual(
        new Date(sales[1].createdAt).getTime()
      );
    });

    it('filters by date range', async () => {
      const part = await createPart(makePart({ quantity: 100 }));
      await recordSale({ partId: part.id, quantity: 1, unitPrice: 100 });

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const sales = await getAllSales({
        startDate: tomorrow,
        endDate: new Date(tomorrow.getTime() + 86400000),
        label: 'Future',
      });
      expect(sales.length).toBe(0);
    });
  });

  describe('getTodaySales', () => {
    it('returns only sales from today', async () => {
      const part = await createPart(makePart({ quantity: 100 }));
      await recordSale({ partId: part.id, quantity: 1, unitPrice: 100 });

      const today = await getTodaySales();
      expect(today.length).toBe(1);
    });
  });

  describe('getSalesSummary', () => {
    it('calculates correct totals', async () => {
      const part = await createPart(makePart({ quantity: 100, buyingPrice: 100, sellingPrice: 200 }));
      await recordSale({ partId: part.id, quantity: 5, unitPrice: 200 });
      await recordSale({ partId: part.id, quantity: 3, unitPrice: 200 });

      const now = new Date();
      const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
      const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);

      const summary = await getSalesSummary({
        startDate: startOfDay,
        endDate: endOfDay,
        label: 'Today',
      });

      expect(summary.salesCount).toBe(2);
      expect(summary.itemsSold).toBe(8);
      expect(summary.totalSales).toBe(5 * 200 + 3 * 200);
      expect(summary.totalProfit).toBe((200 - 100) * 5 + (200 - 100) * 3);
    });
  });

  describe('getTopSellingParts', () => {
    it('returns parts ranked by quantity sold', async () => {
      const partA = await createPart(makePart({ name: 'Part A', sku: 'A', quantity: 100 }));
      const partB = await createPart(makePart({ name: 'Part B', sku: 'B', quantity: 100 }));

      await recordSale({ partId: partA.id, quantity: 10, unitPrice: 100 });
      await recordSale({ partId: partB.id, quantity: 20, unitPrice: 100 });

      const now = new Date();
      const top = await getTopSellingParts({
        startDate: new Date(now.getFullYear(), now.getMonth(), now.getDate()),
        endDate: new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999),
        label: 'Today',
      });

      expect(top.length).toBe(2);
      expect(top[0].partName).toBe('Part B');
      expect(top[0].quantitySold).toBe(20);
    });
  });
});
