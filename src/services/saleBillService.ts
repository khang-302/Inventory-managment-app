import { createBill } from './billService';
import type { BillFormItem } from '@/types/bill';

interface SaleBillItem {
  partName: string;
  partCode: string;
  brand?: string;
  quantity: number;
  price: number;
}

interface SaleBillInput {
  buyerName: string;
  buyerPhone: string;
  items: SaleBillItem[];
  discount?: number;
  notes?: string;
}

/**
 * Creates a bill from sale data. Centralised helper used by both
 * Record Sale and Quick Sell workflows.
 */
export async function createBillFromSale(data: SaleBillInput): Promise<{ billId: string; billNumber: string }> {
  const billItems: BillFormItem[] = data.items.map(item => ({
    partName: item.partName,
    partCode: item.partCode,
    brand: item.brand ?? '',
    quantity: item.quantity,
    price: item.price,
  }));

  const bill = await createBill(
    data.buyerName || 'Walk-in Customer',
    data.buyerPhone || '',
    new Date(),
    billItems,
    data.discount ?? 0,
    data.notes ?? '',
  );

  return { billId: bill.id, billNumber: bill.billNumber };
}
