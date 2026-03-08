import { describe, it, expect, beforeEach } from 'vitest';

// Mock Dexie before importing service
const mockEntries: any[] = [];

vi.mock('@/db/database', () => {
  const createTable = () => ({
    where: (field: string) => ({
      equals: (val: any) => ({
        filter: (fn: any) => ({
          limit: (n: number) => ({
            toArray: async () => mockEntries.filter(e => e.field === val).filter(fn).slice(0, n),
          }),
        }),
        first: async () => mockEntries.find(e => {
          if (field === '[field+value]') {
            return e.field === val[0] && e.value === val[1];
          }
          return e.field === val;
        }),
        delete: async () => {
          const idx = mockEntries.findIndex(e => e.field === val);
          if (idx >= 0) mockEntries.splice(idx, 1);
        },
        sortBy: async () => mockEntries.filter(e => e.field === val).sort((a: any, b: any) => a.value.localeCompare(b.value)),
      }),
    }),
    add: async (entry: any) => { mockEntries.push(entry); },
    delete: async (id: string) => {
      const idx = mockEntries.findIndex(e => e.id === id);
      if (idx >= 0) mockEntries.splice(idx, 1);
    },
  });

  return {
    db: {
      autocompleteEntries: createTable(),
    },
  };
});

import { addEntry, getSuggestions, removeEntry, getAllEntries } from '@/services/autocompleteService';

describe('autocompleteService', () => {
  beforeEach(() => {
    mockEntries.length = 0;
  });

  it('adds and retrieves suggestions', async () => {
    await addEntry('customerName', 'Ali Khan');
    await addEntry('customerName', 'Ahmed');
    await addEntry('customerPhone', '0300-1234567');

    const results = await getSuggestions('customerName', 'A');
    expect(results.length).toBe(2);
    expect(results.map(r => r.value)).toContain('Ali Khan');
    expect(results.map(r => r.value)).toContain('Ahmed');
  });

  it('deduplicates entries', async () => {
    await addEntry('brand', 'Toyota');
    await addEntry('brand', 'Toyota');
    // Second add should be skipped since mock finds existing
    const all = await getAllEntries('brand');
    // With our mock, the first call adds, second finds it, so only 1
    expect(all.length).toBe(1);
  });

  it('filters by prefix case-insensitively', async () => {
    await addEntry('customerName', 'Bilal');
    await addEntry('customerName', 'Bashir');
    await addEntry('customerName', 'Zahid');

    const results = await getSuggestions('customerName', 'b');
    expect(results.length).toBe(2);
    expect(results.every(r => r.value.toLowerCase().startsWith('b'))).toBe(true);
  });

  it('returns empty for empty query', async () => {
    await addEntry('customerName', 'Test');
    const results = await getSuggestions('customerName', '');
    expect(results.length).toBe(0);
  });

  it('removes entries', async () => {
    await addEntry('brand', 'Honda');
    const all = await getAllEntries('brand');
    expect(all.length).toBe(1);
    
    await removeEntry(all[0].id);
    const afterRemove = await getAllEntries('brand');
    expect(afterRemove.length).toBe(0);
  });
});
