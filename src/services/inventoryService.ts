import { db } from '@/db/database';
import type { Part, PartFormData, StockStatus } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { logActivity } from './activityLogService';
import { toSafeNumber, toSafeQuantity, sanitizePartData, safeMultiply } from '@/utils/safeNumber';
/**
 * Get all parts with optional filtering
 */
export async function getAllParts(filters?: {
  search?: string;
  brandId?: string;
  categoryId?: string;
  stockStatus?: StockStatus;
}): Promise<Part[]> {
  let parts = await db.parts.toArray();
  
  if (filters) {
    // Search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      parts = parts.filter(p => 
        p.name.toLowerCase().includes(searchLower) ||
        p.sku.toLowerCase().includes(searchLower)
      );
    }
    
    // Brand filter
    if (filters.brandId) {
      parts = parts.filter(p => p.brandId === filters.brandId);
    }
    
    // Category filter
    if (filters.categoryId) {
      parts = parts.filter(p => p.categoryId === filters.categoryId);
    }
    
    // Stock status filter
    if (filters.stockStatus && filters.stockStatus !== 'all') {
      parts = parts.filter(p => {
        switch (filters.stockStatus) {
          case 'in-stock':
            return p.quantity > p.minStockLevel;
          case 'low-stock':
            return p.quantity > 0 && p.quantity <= p.minStockLevel;
          case 'out-of-stock':
            return p.quantity === 0;
          default:
            return true;
        }
      });
    }
  }
  
  // Sort by name
  return parts.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Get a single part by ID
 */
export async function getPartById(id: string): Promise<Part | undefined> {
  return db.parts.get(id);
}

/**
 * Get a part by SKU
 */
export async function getPartBySku(sku: string): Promise<Part | undefined> {
  return db.parts.where('sku').equals(sku).first();
}

/**
 * Create a new part
 */
export async function createPart(data: PartFormData): Promise<Part> {
  const now = new Date();
  const part: Part = {
    id: uuidv4(),
    ...data,
    createdAt: now,
    updatedAt: now,
  };
  
  await db.parts.add(part);
  
  await logActivity({
    action: 'create',
    entityType: 'part',
    entityId: part.id,
    description: `Added new part: ${part.name} (SKU: ${part.sku})`,
    metadata: { quantity: part.quantity, buyingPrice: part.buyingPrice, sellingPrice: part.sellingPrice },
  });
  
  return part;
}

/**
 * Update an existing part
 */
export async function updatePart(id: string, data: Partial<PartFormData>): Promise<Part | undefined> {
  const existing = await db.parts.get(id);
  if (!existing) return undefined;
  
  const updated = {
    ...existing,
    ...data,
    updatedAt: new Date(),
  };
  
  await db.parts.put(updated);
  
  await logActivity({
    action: 'update',
    entityType: 'part',
    entityId: id,
    description: `Updated part: ${updated.name} (SKU: ${updated.sku})`,
    metadata: data,
  });
  
  return updated;
}

/**
 * Delete a part - hard delete for demo items, soft delete logging for all
 */
export async function deletePart(id: string): Promise<boolean> {
  const part = await db.parts.get(id);
  if (!part) return false;
  
  // Always hard delete from parts table (both demo and real items)
  await db.parts.delete(id);
  
  await logActivity({
    action: 'delete',
    entityType: 'part',
    entityId: id,
    description: `Deleted part: ${part.name} (SKU: ${part.sku})`,
    metadata: { isDemo: !!part.isDemo },
  });
  
  return true;
}

/**
 * Update stock quantity
 */
export async function updateStock(id: string, quantityChange: number, reason?: string, skipLog?: boolean): Promise<Part | undefined> {
  const part = await db.parts.get(id);
  if (!part) return undefined;
  
  const currentQuantity = toSafeQuantity(part.quantity, 0);
  const change = toSafeNumber(quantityChange, 0);
  const newQuantity = Math.max(0, currentQuantity + change);
  
  await db.parts.update(id, { 
    quantity: newQuantity, 
    updatedAt: new Date() 
  });
  
  if (!skipLog) {
    await logActivity({
      action: 'update',
      entityType: 'part',
      entityId: id,
      description: `Stock ${change >= 0 ? 'increased' : 'decreased'} for ${part.name}: ${currentQuantity} → ${newQuantity}`,
      metadata: { previousQuantity: currentQuantity, newQuantity, change, reason },
    });
  }
  
  return { ...part, quantity: newQuantity, updatedAt: new Date() };
}

/**
 * Get low stock parts
 */
export async function getLowStockParts(): Promise<Part[]> {
  const parts = await db.parts.toArray();
  return parts.filter(p => p.quantity <= p.minStockLevel);
}

/**
 * Get out of stock parts
 */
export async function getOutOfStockParts(): Promise<Part[]> {
  const parts = await db.parts.toArray();
  return parts.filter(p => p.quantity === 0);
}

/**
 * Calculate total inventory value
 */
export async function getInventoryValue(): Promise<{ cost: number; retail: number }> {
  const parts = await db.parts.toArray();
  return {
    cost: parts.reduce((sum, p) => sum + safeMultiply(toSafeQuantity(p.quantity, 0), toSafeNumber(p.buyingPrice, 0)), 0),
    retail: parts.reduce((sum, p) => sum + safeMultiply(toSafeQuantity(p.quantity, 0), toSafeNumber(p.sellingPrice, 0)), 0),
  };
}

/**
 * Check if SKU is unique
 */
export async function isSkuUnique(sku: string, excludeId?: string): Promise<boolean> {
  const existing = await db.parts.where('sku').equals(sku).first();
  if (!existing) return true;
  return excludeId ? existing.id === excludeId : false;
}
