import { describe, it, expect } from 'vitest';
import { validateBackupFile, safeJsonParse, sanitizeString, backupFileSchema } from './backupValidation';

describe('Backup Validation', () => {
  const validBackup = {
    version: '1',
    exportedAt: new Date().toISOString(),
    parts: [],
    brands: [],
    categories: [],
    sales: [],
    activityLogs: [],
    settings: [],
  };

  describe('validateBackupFile', () => {
    it('accepts a valid empty backup', () => {
      const result = validateBackupFile(validBackup);
      expect(result.version).toBe('1');
      expect(result.parts).toEqual([]);
    });

    it('accepts backup with data', () => {
      const backup = {
        ...validBackup,
        parts: [{
          id: 'p1',
          name: 'Brake Pad',
          sku: 'BP-001',
          brandId: 'b1',
          categoryId: 'c1',
          quantity: 10,
          minStockLevel: 5,
          buyingPrice: 500,
          sellingPrice: 800,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        }],
        brands: [{ id: 'b1', name: 'CAT', createdAt: new Date().toISOString() }],
        categories: [{ id: 'c1', name: 'Engine', createdAt: new Date().toISOString() }],
      };
      const result = validateBackupFile(backup);
      expect(result.parts.length).toBe(1);
      expect(result.parts[0].name).toBe('Brake Pad');
    });

    it('coerces numeric version to string', () => {
      const result = validateBackupFile({ ...validBackup, version: 2 });
      expect(result.version).toBe('2');
    });

    it('rejects missing version', () => {
      const { version, ...noVersion } = validBackup;
      expect(() => validateBackupFile(noVersion)).toThrow('Invalid backup file');
    });

    it('rejects invalid part data (negative quantity)', () => {
      const backup = {
        ...validBackup,
        parts: [{
          id: 'p1', name: 'Test', sku: 'T1', brandId: 'b1', categoryId: 'c1',
          quantity: -5, buyingPrice: 100, sellingPrice: 200,
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        }],
      };
      expect(() => validateBackupFile(backup)).toThrow();
    });

    it('rejects excessively long strings', () => {
      const backup = {
        ...validBackup,
        parts: [{
          id: 'p1', name: 'A'.repeat(1500), sku: 'T1', brandId: 'b1', categoryId: 'c1',
          quantity: 1, buyingPrice: 100, sellingPrice: 200,
          createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(),
        }],
      };
      expect(() => validateBackupFile(backup)).toThrow();
    });

    it('defaults optional fields', () => {
      const result = validateBackupFile({
        version: '1',
        exportedAt: new Date().toISOString(),
      });
      expect(result.parts).toEqual([]);
      expect(result.brands).toEqual([]);
      expect(result.sales).toEqual([]);
    });

    it('accepts sales with valid data', () => {
      const backup = {
        ...validBackup,
        sales: [{
          id: 's1', partId: 'p1', partName: 'Test', quantity: 5,
          unitPrice: 100, totalAmount: 500, buyingPrice: 50, profit: 250,
          createdAt: new Date().toISOString(),
        }],
      };
      const result = validateBackupFile(backup);
      expect(result.sales.length).toBe(1);
    });
  });

  describe('safeJsonParse', () => {
    it('parses valid JSON', () => {
      const result = safeJsonParse('{"key": "value"}');
      expect(result).toEqual({ key: 'value' });
    });

    it('throws on invalid JSON', () => {
      expect(() => safeJsonParse('not json')).toThrow('Invalid JSON format');
    });

    it('throws on oversized input', () => {
      const bigString = 'x'.repeat(200 * 1024 * 1024);
      expect(() => safeJsonParse(bigString, 100 * 1024 * 1024)).toThrow('too large');
    });
  });

  describe('sanitizeString', () => {
    it('removes null bytes and control characters', () => {
      expect(sanitizeString('Hello\x00World')).toBe('HelloWorld');
      expect(sanitizeString('Tab\tand\nnewline')).toBe('Tab\tand\nnewline');
    });

    it('returns empty string for non-string input', () => {
      expect(sanitizeString(123 as any)).toBe('');
    });

    it('preserves normal strings', () => {
      expect(sanitizeString('Normal string 123 !@#')).toBe('Normal string 123 !@#');
    });
  });
});
