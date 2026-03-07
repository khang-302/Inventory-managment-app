// Bill Generator Type Definitions

export interface PaymentInfo {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  easypaisaNumber: string;
  jazzcashNumber: string;
}

export interface BillSettings {
  id: string;
  shopName: string;
  tagline: string;
  ownerName: string;
  phone1: string;
  phone2: string;
  address: string;
  website: string;
  socialMedia: string;
  logoPath: string | null;
  footerMessage: string;
  lastBillNumber: number;
  // Advanced settings
  showPaymentInfo: boolean;
  paymentInfo: PaymentInfo;
  showTerms: boolean;
  termsConditions: string[];
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
  // Optional per-bill overrides
  showPaymentInfo?: boolean;
  paymentInfo?: PaymentInfo;
  showTerms?: boolean;
  termsConditions?: string[];
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
