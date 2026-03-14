import { z } from 'zod';

/**
 * Zod schemas for backup file validation
 * Ensures data integrity and prevents malformed/malicious backup files
 */

// Maximum string lengths to prevent memory issues
const MAX_STRING_LENGTH = 1000;
const MAX_SHORT_STRING = 100;
const MAX_NOTES_LENGTH = 5000;
const MAX_ARRAY_LENGTH = 50000;

// Unit types
const unitTypeSchema = z.enum(['piece', 'set', 'pair', 'box', 'custom']).default('piece');

// Activity action types
const activityActionSchema = z.enum(['create', 'update', 'delete', 'sale', 'backup', 'restore', 'sync']);

// Entity types
const entityTypeSchema = z.enum(['part', 'sale', 'brand', 'category', 'settings', 'backup']);

// Helper to parse dates - accepts string or Date, returns Date
const dateSchema = z.union([
  z.string().transform(val => new Date(val)),
  z.date(),
  z.number().transform(val => new Date(val)),
]).pipe(z.date());

// Part schema - matches Part interface
const partSchema = z.object({
  id: z.string().max(MAX_SHORT_STRING),
  name: z.string().max(MAX_STRING_LENGTH),
  sku: z.string().max(MAX_SHORT_STRING),
  brandId: z.string().max(MAX_SHORT_STRING),
  categoryId: z.string().max(MAX_SHORT_STRING),
  unitType: unitTypeSchema.optional().default('piece'),
  customUnit: z.string().max(MAX_SHORT_STRING).optional(),
  quantity: z.number().int().min(0).max(999999999),
  minStockLevel: z.number().int().min(0).max(999999).optional().default(0),
  buyingPrice: z.number().min(0).max(999999999),
  sellingPrice: z.number().min(0).max(999999999),
  location: z.string().max(MAX_STRING_LENGTH).optional().default(''),
  notes: z.string().max(MAX_NOTES_LENGTH).optional().default(''),
  images: z.array(z.string().max(MAX_STRING_LENGTH * 10)).max(10).optional().default([]),
  createdAt: dateSchema,
  updatedAt: dateSchema,
}).passthrough();

// Brand schema
const brandSchema = z.object({
  id: z.string().max(MAX_SHORT_STRING),
  name: z.string().max(MAX_STRING_LENGTH),
  createdAt: dateSchema,
}).passthrough();

// Category schema
const categorySchema = z.object({
  id: z.string().max(MAX_SHORT_STRING),
  name: z.string().max(MAX_STRING_LENGTH),
  createdAt: dateSchema,
}).passthrough();

// Sale schema
const saleSchema = z.object({
  id: z.string().max(MAX_SHORT_STRING),
  partId: z.string().max(MAX_SHORT_STRING),
  partName: z.string().max(MAX_STRING_LENGTH),
  partSku: z.string().max(MAX_SHORT_STRING).optional().default(''),
  quantity: z.number().int().min(1).max(999999),
  unitPrice: z.number().min(0).max(999999999),
  totalAmount: z.number().min(0).max(999999999),
  buyingPrice: z.number().min(0).max(999999999),
  profit: z.number().max(999999999),
  customerName: z.string().max(MAX_STRING_LENGTH).optional().default(''),
  customerPhone: z.string().max(MAX_SHORT_STRING).optional().default(''),
  notes: z.string().max(MAX_NOTES_LENGTH).optional().default(''),
  createdAt: dateSchema,
}).passthrough();

// Activity log schema
const activityLogSchema = z.object({
  id: z.string().max(MAX_SHORT_STRING),
  action: activityActionSchema,
  entityType: entityTypeSchema,
  entityId: z.string().max(MAX_SHORT_STRING).optional(),
  description: z.string().max(MAX_STRING_LENGTH),
  metadata: z.record(z.unknown()).optional(),
  createdAt: dateSchema,
}).passthrough();

// Settings schema
const settingsSchema = z.object({
  id: z.string().max(MAX_SHORT_STRING),
  key: z.string().max(MAX_SHORT_STRING),
  value: z.unknown(),
  updatedAt: dateSchema.optional(),
}).passthrough();

// Bill schema
const billSchema = z.object({
  id: z.string().max(MAX_SHORT_STRING),
  billNumber: z.string().max(MAX_SHORT_STRING),
  buyerName: z.string().max(MAX_STRING_LENGTH),
  buyerPhone: z.string().max(MAX_SHORT_STRING).optional().default(''),
  date: dateSchema,
  subtotal: z.number().min(0).max(999999999),
  discount: z.number().min(0).max(999999999).optional().default(0),
  finalTotal: z.number().min(0).max(999999999),
  notes: z.string().max(MAX_NOTES_LENGTH).optional().default(''),
  createdAt: dateSchema,
}).passthrough();

// BillItem schema
const billItemSchema = z.object({
  id: z.string().max(MAX_SHORT_STRING),
  billId: z.string().max(MAX_SHORT_STRING),
  partName: z.string().max(MAX_STRING_LENGTH),
  partCode: z.string().max(MAX_SHORT_STRING).optional().default(''),
  brand: z.string().max(MAX_STRING_LENGTH).optional().default(''),
  quantity: z.number().int().min(1).max(999999),
  price: z.number().min(0).max(999999999),
  total: z.number().min(0).max(999999999),
}).passthrough();

// AutocompleteEntry schema
const autocompleteEntrySchema = z.object({
  id: z.string().max(MAX_SHORT_STRING),
  field: z.string().max(MAX_SHORT_STRING),
  value: z.string().max(MAX_STRING_LENGTH),
  linkedPhone: z.string().max(MAX_SHORT_STRING).optional(),
  createdAt: dateSchema,
}).passthrough();

// Full backup file schema
export const backupFileSchema = z.object({
  version: z.union([z.string(), z.number()]).transform(val => String(val)),
  exportedAt: z.string(),
  parts: z.array(partSchema).max(MAX_ARRAY_LENGTH).optional().default([]),
  brands: z.array(brandSchema).max(MAX_ARRAY_LENGTH).optional().default([]),
  categories: z.array(categorySchema).max(MAX_ARRAY_LENGTH).optional().default([]),
  sales: z.array(saleSchema).max(MAX_ARRAY_LENGTH).optional().default([]),
  activityLogs: z.array(activityLogSchema).max(MAX_ARRAY_LENGTH).optional().default([]),
  settings: z.array(settingsSchema).max(1000).optional().default([]),
  bills: z.array(billSchema).max(MAX_ARRAY_LENGTH).optional().default([]),
  billItems: z.array(billItemSchema).max(MAX_ARRAY_LENGTH).optional().default([]),
  autocompleteEntries: z.array(autocompleteEntrySchema).max(MAX_ARRAY_LENGTH).optional().default([]),
});

export type BackupFile = z.infer<typeof backupFileSchema>;

/**
 * Validate and parse a backup file
 * Returns the validated data or throws a descriptive error
 */
export function validateBackupFile(data: unknown): BackupFile {
  try {
    return backupFileSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      const firstError = error.errors[0];
      const path = firstError.path.join('.');
      throw new Error(`Invalid backup file: ${firstError.message} at ${path || 'root'}`);
    }
    throw new Error('Invalid backup file format');
  }
}

/**
 * Safe JSON parse with size limit
 */
export function safeJsonParse(text: string, maxSizeBytes: number = 100 * 1024 * 1024): unknown {
  const sizeInBytes = new Blob([text]).size;
  if (sizeInBytes > maxSizeBytes) {
    throw new Error(`Backup file too large. Maximum size is ${Math.round(maxSizeBytes / 1024 / 1024)}MB`);
  }

  try {
    return JSON.parse(text);
  } catch {
    throw new Error('Invalid JSON format in backup file');
  }
}

/**
 * Sanitize string values to prevent injection attacks
 */
export function sanitizeString(str: string): string {
  if (typeof str !== 'string') return '';
  return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, '');
}
