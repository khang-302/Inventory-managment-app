import { db } from '@/db/database';
import type { Sale, SaleFormData, Part, DateRange } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { logActivity } from './activityLogService';
import { updateStock } from './inventoryService';
import { toSafeNumber, toSafeQuantity, safeAdd, calculateProfitSafe, calculateTotalSafe } from '@/utils/safeNumber';

interface MultiSaleInput {
  items: { partId: string; quantity: number; unitPrice: number }[];
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}

/**
 * Record a multi-item sale
 */
export async function recordMultiSale(data: MultiSaleInput): Promise<{ sales: Sale[] } | { error: string }> {
  // Validate cart not empty
  if (!data.items.length) return { error: 'Cart is empty' };

  // Load all parts
  const partIds = data.items.map(i => i.partId);
  const partsArr = await Promise.all(partIds.map(id => db.parts.get(id)));
  const partsMap = new Map<string, Part>();
  for (let i = 0; i < data.items.length; i++) {
    const part = partsArr[i];
    if (!part) return { error: `Part not found: ${data.items[i].partId}` };
    partsMap.set(part.id, part);
  }

  // Aggregate quantities per part to check stock
  const qtyPerPart = new Map<string, number>();
  for (const item of data.items) {
    qtyPerPart.set(item.partId, (qtyPerPart.get(item.partId) || 0) + item.quantity);
  }
  for (const [partId, totalQty] of qtyPerPart) {
    const part = partsMap.get(partId)!;
    if (totalQty > part.quantity) {
      return { error: `Insufficient stock for ${part.name}. Available: ${part.quantity}` };
    }
  }

  const sales: Sale[] = [];
  let grandTotal = 0;
  let grandProfit = 0;

  for (const item of data.items) {
    const part = partsMap.get(item.partId)!;
    const qty = toSafeQuantity(item.quantity, 0);
    const unitPrice = toSafeNumber(item.unitPrice, 0);
    const buyingPrice = toSafeNumber(part.buyingPrice, 0);
    const totalAmount = calculateTotalSafe(qty, unitPrice);
    const profit = calculateProfitSafe(buyingPrice, unitPrice, qty);

    sales.push({
      id: uuidv4(),
      partId: part.id,
      partName: part.name,
      partSku: part.sku,
      quantity: qty,
      unitPrice,
      totalAmount,
      buyingPrice,
      profit,
      customerName: data.customerName,
      customerPhone: data.customerPhone,
      notes: data.notes,
      createdAt: new Date(),
    });

    grandTotal += totalAmount;
    grandProfit += profit;
  }

  // Atomic transaction (skipLog on updateStock to avoid N+1 activity entries)
  await db.transaction('rw', [db.sales, db.parts, db.activityLogs], async () => {
    for (const sale of sales) {
      await db.sales.add(sale);
      await updateStock(sale.partId, -sale.quantity, 'Sale', true);
    }
  });

  const itemsSummary = sales.map(s => `${s.quantity}x ${s.partName}`).join(', ');
  await logActivity({
    action: 'sale',
    entityType: 'sale',
    entityId: sales[0].id,
    description: `Sold ${itemsSummary} for Rs ${grandTotal.toLocaleString()}`,
    metadata: { saleIds: sales.map(s => s.id), totalAmount: grandTotal, totalProfit: grandProfit },
  });

  return { sales };
}

/**
 * Record a new sale
 */
export async function recordSale(data: SaleFormData): Promise<Sale | { error: string }> {
  // Get the part
  const part = await db.parts.get(data.partId);
  if (!part) {
    return { error: 'Part not found' };
  }
  
  // Safely convert quantities
  const requestedQuantity = toSafeQuantity(data.quantity, 0);
  const availableQuantity = toSafeQuantity(part.quantity, 0);
  const unitPrice = toSafeNumber(data.unitPrice, 0);
  const buyingPrice = toSafeNumber(part.buyingPrice, 0);
  
  // Validate quantity
  if (requestedQuantity <= 0) {
    return { error: 'Quantity must be at least 1' };
  }
  
  // Check stock availability
  if (availableQuantity < requestedQuantity) {
    return { error: `Insufficient stock. Available: ${availableQuantity}` };
  }
  
  // Calculate amounts with safe operations
  const totalAmount = calculateTotalSafe(requestedQuantity, unitPrice);
  const profit = calculateProfitSafe(buyingPrice, unitPrice, requestedQuantity);
  
  // Create sale record
  const sale: Sale = {
    id: uuidv4(),
    partId: data.partId,
    partName: part.name,
    partSku: part.sku,
    quantity: requestedQuantity,
    unitPrice: unitPrice,
    totalAmount: totalAmount,
    buyingPrice: buyingPrice,
    profit: profit,
    customerName: data.customerName,
    customerPhone: data.customerPhone,
    notes: data.notes,
    createdAt: new Date(),
  };
  
  // Use transaction to ensure atomicity
  await db.transaction('rw', [db.sales, db.parts, db.activityLogs], async () => {
    // Add sale record
    await db.sales.add(sale);
    
    // Deduct stock (negative change)
    await updateStock(part.id, -requestedQuantity, 'Sale');
  });
  
  await logActivity({
    action: 'sale',
    entityType: 'sale',
    entityId: sale.id,
    description: `Sold ${requestedQuantity}x ${part.name} (SKU: ${part.sku}) for Rs ${totalAmount.toLocaleString()}`,
    metadata: {
      partId: part.id,
      quantity: requestedQuantity,
      amount: totalAmount,
      profit,
      previousStock: availableQuantity,
      newStock: availableQuantity - requestedQuantity,
    },
  });
  
  return sale;
}

/**
 * Get all sales with optional date filtering
 */
export async function getAllSales(dateRange?: DateRange): Promise<Sale[]> {
  let sales = await db.sales.orderBy('createdAt').reverse().toArray();
  
  if (dateRange) {
    sales = sales.filter(s => {
      const saleDate = new Date(s.createdAt);
      return saleDate >= dateRange.startDate && saleDate <= dateRange.endDate;
    });
  }
  
  return sales;
}

/**
 * Get a sale by ID
 */
export async function getSaleById(id: string): Promise<Sale | undefined> {
  return db.sales.get(id);
}

/**
 * Get sales for a specific part
 */
export async function getSalesByPart(partId: string): Promise<Sale[]> {
  return db.sales.where('partId').equals(partId).reverse().sortBy('createdAt');
}

/**
 * Get today's sales
 */
export async function getTodaySales(): Promise<Sale[]> {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0, 0);
  const endOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59, 59, 999);
  
  const sales = await db.sales.toArray();
  return sales.filter(s => {
    const saleDate = new Date(s.createdAt);
    return saleDate >= startOfDay && saleDate <= endOfDay;
  });
}

/**
 * Calculate sales summary for a date range
 */
export async function getSalesSummary(dateRange: DateRange): Promise<{
  totalSales: number;
  totalProfit: number;
  salesCount: number;
  itemsSold: number;
  averageSaleValue: number;
  profitMargin: number;
}> {
  const sales = await getAllSales(dateRange);
  
  // Calculate with safe number operations
  const totalSales = sales.reduce((sum, s) => safeAdd(sum, toSafeNumber(s.totalAmount, 0)), 0);
  const totalProfit = sales.reduce((sum, s) => safeAdd(sum, toSafeNumber(s.profit, 0)), 0);
  const salesCount = sales.length;
  const itemsSold = sales.reduce((sum, s) => safeAdd(sum, toSafeQuantity(s.quantity, 0)), 0);
  const averageSaleValue = salesCount > 0 ? totalSales / salesCount : 0;
  const profitMargin = totalSales > 0 ? (totalProfit / totalSales) * 100 : 0;
  
  return {
    totalSales,
    totalProfit,
    salesCount,
    itemsSold,
    averageSaleValue: isNaN(averageSaleValue) ? 0 : averageSaleValue,
    profitMargin: isNaN(profitMargin) ? 0 : profitMargin,
  };
}

/**
 * Get sales grouped by date
 */
export async function getSalesByDate(dateRange: DateRange): Promise<Map<string, Sale[]>> {
  const sales = await getAllSales(dateRange);
  const grouped = new Map<string, Sale[]>();
  
  for (const sale of sales) {
    const dateKey = new Date(sale.createdAt).toISOString().split('T')[0];
    if (!grouped.has(dateKey)) {
      grouped.set(dateKey, []);
    }
    grouped.get(dateKey)!.push(sale);
  }
  
  return grouped;
}

/**
 * Get top selling parts
 */
export async function getTopSellingParts(dateRange: DateRange, limit: number = 10): Promise<{
  partId: string;
  partName: string;
  sku: string;
  quantitySold: number;
  totalRevenue: number;
  totalProfit: number;
}[]> {
  const sales = await getAllSales(dateRange);
  
  // Group by part
  const partSales = new Map<string, {
    partName: string;
    sku: string;
    quantitySold: number;
    totalRevenue: number;
    totalProfit: number;
  }>();
  
  for (const sale of sales) {
    const existing = partSales.get(sale.partId);
    if (existing) {
      existing.quantitySold += sale.quantity;
      existing.totalRevenue += sale.totalAmount;
      existing.totalProfit += sale.profit;
    } else {
      partSales.set(sale.partId, {
        partName: sale.partName,
        sku: sale.partSku,
        quantitySold: sale.quantity,
        totalRevenue: sale.totalAmount,
        totalProfit: sale.profit,
      });
    }
  }
  
  // Convert to array and sort by quantity sold
  return Array.from(partSales.entries())
    .map(([partId, data]) => ({ partId, ...data }))
    .sort((a, b) => b.quantitySold - a.quantitySold)
    .slice(0, limit);
}

/**
 * Delete a sale (for corrections only)
 */
export async function deleteSale(id: string): Promise<boolean> {
  const sale = await db.sales.get(id);
  if (!sale) return false;
  
  // Restore stock and delete sale atomically
  await db.transaction('rw', [db.sales, db.parts, db.activityLogs], async () => {
    await db.sales.delete(id);
    // Restore stock quantity
    const part = await db.parts.get(sale.partId);
    if (part) {
      await db.parts.update(sale.partId, {
        quantity: part.quantity + sale.quantity,
        updatedAt: new Date(),
      });
    }
  });
  
  await logActivity({
    action: 'delete',
    entityType: 'sale',
    entityId: id,
    description: `Deleted sale: ${sale.quantity}x ${sale.partName} (stock restored)`,
    metadata: { amount: sale.totalAmount, quantityRestored: sale.quantity },
  });
  
  return true;
}
