import { describe, it, expect, beforeEach } from 'vitest';
import { db } from '@/db/database';
import {
  createPart,
  updatePart,
  deletePart,
  getAllParts,
  getPartById,
  updateStock,
  getLowStockParts,
  getOutOfStockParts,
  getInventoryValue,
  isSkuUnique,
} from './inventoryService';
import type { PartFormData } from '@/types';

const makePart = (overrides?: Partial<PartFormData>): PartFormData => ({
  name: 'Brake Pad',
  sku: 'BP-001',
  brandId: 'brand-1',
  categoryId: 'cat-1',
  unitType: 'piece',
  quantity: 10,
  minStockLevel: 5,
  buyingPrice: 500,
  sellingPrice: 800,
  location: 'Shelf A',
  notes: '',
  images: [],
  ...overrides,
});

describe('Inventory Service', () => {
  beforeEach(async () => {
    await db.parts.clear();
    await db.activityLogs.clear();
  });

  describe('createPart', () => {
    it('creates a part with correct fields', async () => {
      const part = await createPart(makePart());
      expect(part.id).toBeDefined();
      expect(part.name).toBe('Brake Pad');
      expect(part.sku).toBe('BP-001');
      expect(part.quantity).toBe(10);
      expect(part.buyingPrice).toBe(500);
      expect(part.sellingPrice).toBe(800);
      expect(part.createdAt).toBeInstanceOf(Date);
      expect(part.updatedAt).toBeInstanceOf(Date);

      const saved = await db.parts.get(part.id);
      expect(saved).toBeDefined();
      expect(saved!.name).toBe('Brake Pad');
    });

    it('logs activity on creation', async () => {
      await createPart(makePart());
      const logs = await db.activityLogs.toArray();
      expect(logs.length).toBeGreaterThanOrEqual(1);
      expect(logs.some(l => l.action === 'create')).toBe(true);
    });
  });

  describe('updatePart', () => {
    it('updates only changed fields', async () => {
      const part = await createPart(makePart());
      const updated = await updatePart(part.id, { name: 'New Brake Pad', quantity: 20 });
      expect(updated).toBeDefined();
      expect(updated!.name).toBe('New Brake Pad');
      expect(updated!.quantity).toBe(20);
      expect(updated!.sku).toBe('BP-001'); // unchanged
      expect(updated!.updatedAt.getTime()).toBeGreaterThan(part.updatedAt.getTime());
    });

    it('returns undefined for non-existent part', async () => {
      const result = await updatePart('non-existent', { name: 'Test' });
      expect(result).toBeUndefined();
    });
  });

  describe('deletePart', () => {
    it('removes the part from DB', async () => {
      const part = await createPart(makePart());
      const result = await deletePart(part.id);
      expect(result).toBe(true);
      const found = await db.parts.get(part.id);
      expect(found).toBeUndefined();
    });

    it('returns false for non-existent part', async () => {
      const result = await deletePart('non-existent');
      expect(result).toBe(false);
    });
  });

  describe('getAllParts', () => {
    it('returns all parts sorted by name', async () => {
      await createPart(makePart({ name: 'Zebra Part', sku: 'Z-001' }));
      await createPart(makePart({ name: 'Alpha Part', sku: 'A-001' }));
      const parts = await getAllParts();
      expect(parts.length).toBe(2);
      expect(parts[0].name).toBe('Alpha Part');
      expect(parts[1].name).toBe('Zebra Part');
    });

    it('filters by search term', async () => {
      await createPart(makePart({ name: 'Brake Pad', sku: 'BP-001' }));
      await createPart(makePart({ name: 'Oil Filter', sku: 'OF-001' }));
      const results = await getAllParts({ search: 'brake' });
      expect(results.length).toBe(1);
      expect(results[0].name).toBe('Brake Pad');
    });

    it('filters by SKU search', async () => {
      await createPart(makePart({ name: 'Part A', sku: 'UNIQUE-123' }));
      await createPart(makePart({ name: 'Part B', sku: 'OTHER-456' }));
      const results = await getAllParts({ search: 'UNIQUE' });
      expect(results.length).toBe(1);
    });

    it('filters by brandId', async () => {
      await createPart(makePart({ brandId: 'b1', sku: 'S1' }));
      await createPart(makePart({ brandId: 'b2', sku: 'S2' }));
      const results = await getAllParts({ brandId: 'b1' });
      expect(results.length).toBe(1);
    });

    it('filters by stock status', async () => {
      await createPart(makePart({ quantity: 0, minStockLevel: 5, sku: 'S1' }));
      await createPart(makePart({ quantity: 3, minStockLevel: 5, sku: 'S2' }));
      await createPart(makePart({ quantity: 20, minStockLevel: 5, sku: 'S3' }));

      const outOfStock = await getAllParts({ stockStatus: 'out-of-stock' });
      expect(outOfStock.length).toBe(1);
      expect(outOfStock[0].quantity).toBe(0);

      const lowStock = await getAllParts({ stockStatus: 'low-stock' });
      expect(lowStock.length).toBe(1);
      expect(lowStock[0].quantity).toBe(3);

      const inStock = await getAllParts({ stockStatus: 'in-stock' });
      expect(inStock.length).toBe(1);
      expect(inStock[0].quantity).toBe(20);
    });
  });

  describe('updateStock', () => {
    it('increases stock quantity', async () => {
      const part = await createPart(makePart({ quantity: 10 }));
      const updated = await updateStock(part.id, 5);
      expect(updated!.quantity).toBe(15);
    });

    it('decreases stock quantity', async () => {
      const part = await createPart(makePart({ quantity: 10 }));
      const updated = await updateStock(part.id, -3);
      expect(updated!.quantity).toBe(7);
    });

    it('clamps stock at 0 (never negative)', async () => {
      const part = await createPart(makePart({ quantity: 2 }));
      const updated = await updateStock(part.id, -10);
      expect(updated!.quantity).toBe(0);
    });

    it('returns undefined for non-existent part', async () => {
      const result = await updateStock('non-existent', 5);
      expect(result).toBeUndefined();
    });
  });

  describe('getLowStockParts', () => {
    it('returns parts at or below minStockLevel', async () => {
      await createPart(makePart({ quantity: 3, minStockLevel: 5, sku: 'S1' }));
      await createPart(makePart({ quantity: 20, minStockLevel: 5, sku: 'S2' }));
      const low = await getLowStockParts();
      expect(low.length).toBe(1);
      expect(low[0].quantity).toBe(3);
    });
  });

  describe('getOutOfStockParts', () => {
    it('returns parts with quantity 0', async () => {
      await createPart(makePart({ quantity: 0, sku: 'S1' }));
      await createPart(makePart({ quantity: 5, sku: 'S2' }));
      const out = await getOutOfStockParts();
      expect(out.length).toBe(1);
    });
  });

  describe('getInventoryValue', () => {
    it('calculates cost and retail values', async () => {
      await createPart(makePart({ quantity: 10, buyingPrice: 100, sellingPrice: 150, sku: 'S1' }));
      await createPart(makePart({ quantity: 5, buyingPrice: 200, sellingPrice: 300, sku: 'S2' }));
      const value = await getInventoryValue();
      expect(value.cost).toBe(10 * 100 + 5 * 200);
      expect(value.retail).toBe(10 * 150 + 5 * 300);
    });
  });

  describe('isSkuUnique', () => {
    it('returns true for unique SKU', async () => {
      await createPart(makePart({ sku: 'EXISTING' }));
      const result = await isSkuUnique('NEW-SKU');
      expect(result).toBe(true);
    });

    it('returns false for duplicate SKU', async () => {
      await createPart(makePart({ sku: 'EXISTING' }));
      const result = await isSkuUnique('EXISTING');
      expect(result).toBe(false);
    });

    it('allows same SKU when excludeId matches', async () => {
      const part = await createPart(makePart({ sku: 'MY-SKU' }));
      const result = await isSkuUnique('MY-SKU', part.id);
      expect(result).toBe(true);
    });
  });

  describe('Edge cases', () => {
    it('handles special characters in names', async () => {
      const part = await createPart(makePart({ name: 'O-Ring (3/4") — Heavy Duty', sku: 'OR-3/4' }));
      const saved = await getPartById(part.id);
      expect(saved!.name).toBe('O-Ring (3/4") — Heavy Duty');
    });

    it('handles max quantity boundary', async () => {
      const part = await createPart(makePart({ quantity: 999999999 }));
      expect(part.quantity).toBe(999999999);
    });
  });
});
