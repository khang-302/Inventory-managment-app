// Bill Generator Type Definitions

export interface BillSettings {
  id: string;
  shopName: string;
  tagline: string;
  ownerName: string;
  phone1: string;
  phone2: string;
  address: string;
  logoPath: string | null;
  footerMessage: string;
  lastBillNumber: number;
  updatedAt: Date;
}

export interface Bill {
  id: string;
  billNumber: string;
  buyerName: string;
  buyerPhone: string;
  date: Date;
  subtotal: number;
  discount: number;
  finalTotal: number;
  notes: string;
  createdAt: Date;
}

export interface BillItem {
  id: string;
  billId: string;
  partName: string;
  partCode: string;
  brand: string;
  quantity: number;
  price: number;
  total: number;
}

export interface BillFormItem {
  partName: string;
  partCode: string;
  brand: string;
  quantity: number;
  price: number;
}
