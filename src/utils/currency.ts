// Currency formatting utilities for Pakistan Rupees (Rs/₨)

export type CurrencyDisplayMode = 'compact' | 'numeric';

/**
 * Format a number as Pakistani Rupees
 */
export const formatCurrency = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rs 0';
  }
  const formatted = Math.abs(amount).toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
  return amount < 0 ? `Rs -${formatted}` : `Rs ${formatted}`;
};

/**
 * Format currency with decimals
 */
export const formatCurrencyWithDecimals = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rs 0.00';
  }
  const formatted = Math.abs(amount).toLocaleString('en-PK', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return amount < 0 ? `Rs -${formatted}` : `Rs ${formatted}`;
};

/**
 * Format large amounts in short form (Lac, Crore)
 */
export const formatCurrencyShort = (amount: number): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return 'Rs 0';
  }
  const absAmount = Math.abs(amount);
  const prefix = amount < 0 ? '-' : '';

  if (absAmount >= 10000000) {
    return `Rs ${prefix}${(absAmount / 10000000).toFixed(2)} Crore`;
  }
  if (absAmount >= 100000) {
    return `Rs ${prefix}${(absAmount / 100000).toFixed(2)} Lac`;
  }
  if (absAmount >= 1000) {
    return `Rs ${prefix}${(absAmount / 1000).toFixed(1)}K`;
  }
  return formatCurrency(amount);
};

/**
 * Adaptive currency formatter — returns value WITHOUT "Rs" prefix.
 * Uses Pakistani number system: K, Lac, Crore.
 */
export const formatCurrencyAdaptive = (
  amount: number,
  mode: CurrencyDisplayMode = 'compact',
): string => {
  if (isNaN(amount) || amount === null || amount === undefined) {
    return '0';
  }

  const abs = Math.abs(amount);
  const sign = amount < 0 ? '-' : '';

  if (mode === 'numeric') {
    return `${sign}${abs.toLocaleString('en-PK', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    })}`;
  }

  // compact mode
  if (abs >= 10000000) return `${sign}${(abs / 10000000).toFixed(2)} Crore`;
  if (abs >= 100000) return `${sign}${(abs / 100000).toFixed(2)} Lac`;
  if (abs >= 1000) return `${sign}${(abs / 1000).toFixed(1)}K`;
  return `${sign}${abs.toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  })}`;
};

/**
 * Full adaptive formatter with "Rs" prefix.
 */
export const formatCurrencyAdaptiveFull = (
  amount: number,
  mode: CurrencyDisplayMode = 'compact',
): string => {
  return `Rs ${formatCurrencyAdaptive(amount, mode)}`;
};

/**
 * Parse a currency string back to number
 * @param value - The string to parse (e.g., "Rs 1,234")
 * @returns The numeric value
 */
export const parseCurrency = (value: string): number => {
  if (!value) return 0;
  
  // Remove currency symbol, commas, spaces
  const cleaned = value
    .replace(/Rs\.?/gi, '')
    .replace(/₨/g, '')
    .replace(/,/g, '')
    .replace(/\s/g, '')
    .trim();
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
};

/**
 * Format input value as currency for display in inputs
 * @param value - The numeric value
 * @returns Formatted string without Rs prefix for input fields
 */
export const formatCurrencyInput = (value: number): string => {
  if (isNaN(value) || value === null || value === undefined) {
    return '';
  }
  
  return value.toLocaleString('en-PK', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
};

/**
 * Calculate profit from buying and selling price
 * @param buyingPrice - The cost price
 * @param sellingPrice - The selling price
 * @param quantity - Number of items (default 1)
 * @returns The profit amount
 */
export const calculateProfit = (
  buyingPrice: number, 
  sellingPrice: number, 
  quantity: number = 1
): number => {
  return (sellingPrice - buyingPrice) * quantity;
};

/**
 * Calculate profit margin percentage
 * @param buyingPrice - The cost price
 * @param sellingPrice - The selling price
 * @returns Profit margin as percentage
 */
export const calculateProfitMargin = (
  buyingPrice: number, 
  sellingPrice: number
): number => {
  if (sellingPrice === 0) return 0;
  return ((sellingPrice - buyingPrice) / sellingPrice) * 100;
};

/**
 * Calculate total value
 * @param quantity - Number of items
 * @param price - Price per item
 * @returns Total value
 */
export const calculateTotal = (quantity: number, price: number): number => {
  return quantity * price;
};
