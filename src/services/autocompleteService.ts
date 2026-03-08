import { db } from '@/db/database';
import type { AutocompleteEntry } from '@/types';

export type AutocompleteField = 'customerName' | 'customerPhone' | 'brand' | 'category';

export async function getSuggestions(field: AutocompleteField, query: string): Promise<AutocompleteEntry[]> {
  if (!query.trim()) return [];
  const lower = query.toLowerCase();
  return db.autocompleteEntries
    .where('field')
    .equals(field)
    .filter(e => e.value.toLowerCase().startsWith(lower))
    .limit(10)
    .toArray();
}

export async function addEntry(field: AutocompleteField, value: string, linkedPhone?: string): Promise<void> {
  const trimmed = value.trim();
  if (!trimmed) return;
  const existing = await db.autocompleteEntries
    .where('[field+value]')
    .equals([field, trimmed])
    .first();
  if (existing) {
    if (field === 'customerName' && linkedPhone !== undefined && existing.linkedPhone !== linkedPhone) {
      await db.autocompleteEntries.update(existing.id, { linkedPhone });
    }
    return;
  }
  await db.autocompleteEntries.add({
    id: crypto.randomUUID(),
    field,
    value: trimmed,
    linkedPhone: field === 'customerName' ? linkedPhone : undefined,
    createdAt: new Date(),
  });
}

export async function updateEntry(id: string, updates: { value?: string; linkedPhone?: string }): Promise<void> {
  const patch: Record<string, unknown> = {};
  if (updates.value !== undefined) patch.value = updates.value.trim();
  if (updates.linkedPhone !== undefined) patch.linkedPhone = updates.linkedPhone.trim() || undefined;
  if (Object.keys(patch).length > 0) {
    await db.autocompleteEntries.update(id, patch);
  }
}

export async function removeEntry(id: string): Promise<void> {
  await db.autocompleteEntries.delete(id);
}

export async function getAllEntries(field: AutocompleteField): Promise<AutocompleteEntry[]> {
  return db.autocompleteEntries.where('field').equals(field).sortBy('value');
}

export async function clearAllEntries(field: AutocompleteField): Promise<void> {
  await db.autocompleteEntries.where('field').equals(field).delete();
}

/** Persist values after a successful sale/bill — links name ↔ phone */
export async function persistFormValues(data: {
  customerName?: string;
  customerPhone?: string;
  brand?: string;
}): Promise<void> {
  const promises: Promise<void>[] = [];
  if (data.customerName) {
    promises.push(addEntry('customerName', data.customerName, data.customerPhone?.trim() || undefined));
  }
  if (data.customerPhone) promises.push(addEntry('customerPhone', data.customerPhone));
  if (data.brand) promises.push(addEntry('brand', data.brand));
  await Promise.all(promises);
}
