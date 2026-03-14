// Bill Generator Type Definitions

export type WatermarkStyle = 'text' | 'logo' | 'border-frame' | 'diagonal-lines';

export interface PaymentInfo {
  bankName: string;
  accountTitle: string;
  accountNumber: string;
  iban: string;
  easypaisaNumber: string;
  jazzcashNumber: string;
}

export type BillColorThemeId = 'modern-black-orange' | 'classic-teal-gold' | 'royal-blue-gold' | 'burgundy-cream' | 'forest-bronze';

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
  watermarkEnabled: boolean;
  watermarkStyle: WatermarkStyle;
  watermarkText: string;
  watermarkOpacity: number;
  billColorTheme: BillColorThemeId;
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
  isDemo?: boolean;
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
