import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { getAllEntries, removeEntry, clearAllEntries, addEntry, updateEntry, type AutocompleteField } from '@/services/autocompleteService';
import type { AutocompleteEntry } from '@/types';
import { Trash2, User, Phone, Tag, FolderOpen, Plus, Pencil, Check, X } from 'lucide-react';
import { toast } from 'sonner';

const FIELD_CONFIG: { field: AutocompleteField; label: string; icon: React.ElementType; placeholder: string }[] = [
  { field: 'customerName', label: 'Customer Names', icon: User, placeholder: 'e.g. Ali Khan' },
  { field: 'customerPhone', label: 'Phone Numbers', icon: Phone, placeholder: 'e.g. 0300-1234567' },
  { field: 'brand', label: 'Brands', icon: Tag, placeholder: 'e.g. Toyota' },
  { field: 'category', label: 'Categories', icon: FolderOpen, placeholder: 'e.g. Brake Parts' },
];

interface EditState {
  id: string;
  value: string;
  linkedPhone: string;
}

export default function AutocompleteSettings() {
  const [entries, setEntries] = useState<Record<AutocompleteField, AutocompleteEntry[]>>({
    customerName: [],
    customerPhone: [],
    brand: [],
    category: [],
  });

  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [fieldInputs, setFieldInputs] = useState<Record<AutocompleteField, string>>({
    customerName: '',
    customerPhone: '',
    brand: '',
    category: '',
  });
  const [editing, setEditing] = useState<EditState | null>(null);

  const loadAll = async () => {
    const results = await Promise.all(
      FIELD_CONFIG.map(async ({ field }) => ({
        field,
        data: await getAllEntries(field),
      }))
    );
    const next: Record<string, AutocompleteEntry[]> = {};
    results.forEach(r => (next[r.field] = r.data));
    setEntries(next as any);
  };

  useEffect(() => { loadAll(); }, []);

  const handleRemove = async (id: string) => {
    await removeEntry(id);
    if (editing?.id === id) setEditing(null);
    await loadAll();
    toast.success('Entry removed');
  };

  const handleClearAll = async (field: AutocompleteField, label: string) => {
    await clearAllEntries(field);
    setEditing(null);
    await loadAll();
    toast.success(`All ${label.toLowerCase()} cleared`);
  };

  const handleAddCustomerPair = async () => {
    const name = newName.trim();
    const phone = newPhone.trim();
    if (!name) { toast.error('Customer name is required'); return; }
    if (name.length > 100) { toast.error('Name must be less than 100 characters'); return; }
    if (phone && phone.length > 20) { toast.error('Phone must be less than 20 characters'); return; }
    await addEntry('customerName', name, phone || undefined);
    if (phone) await addEntry('customerPhone', phone);
    setNewName('');
    setNewPhone('');
    await loadAll();
    toast.success(`Customer "${name}" added`);
  };

  const handleAddFieldEntry = async (field: AutocompleteField) => {
    const val = fieldInputs[field].trim();
    if (!val) return;
    if (val.length > 100) { toast.error('Entry must be less than 100 characters'); return; }
    await addEntry(field, val);
    setFieldInputs(prev => ({ ...prev, [field]: '' }));
    await loadAll();
    toast.success('Entry added');
  };

  const startEdit = (item: AutocompleteEntry) => {
    setEditing({
      id: item.id,
      value: item.value,
      linkedPhone: item.linkedPhone || '',
    });
  };

  const cancelEdit = () => setEditing(null);

  const saveEdit = async () => {
    if (!editing) return;
    const val = editing.value.trim();
    if (!val) { toast.error('Value cannot be empty'); return; }
    if (val.length > 100) { toast.error('Must be less than 100 characters'); return; }
    await updateEntry(editing.id, { value: val, linkedPhone: editing.linkedPhone });
    setEditing(null);
    await loadAll();
    toast.success('Entry updated');
  };

  const totalEntries = Object.values(entries).reduce((s, arr) => s + arr.length, 0);

  return (
    <AppLayout>
      <Header title="Smart Autocomplete" showBack />
      <div className="p-4 space-y-4 pb-24">
        <p className="text-sm text-muted-foreground">
          Manage saved autocomplete suggestions. {totalEntries} total entries.
        </p>

        {/* Add Customer Name + Phone Pair */}
        <Card className="bg-card border-primary/30">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              Add Customer
            </CardTitle>
          </CardHeader>
          <CardContent className="px-4 pb-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Name *</Label>
                <Input
                  value={newName}
                  onChange={e => setNewName(e.target.value)}
                  placeholder="Customer name"
                  className="text-sm mt-1"
                  maxLength={100}
                />
              </div>
              <div>
                <Label className="text-xs">Phone</Label>
                <Input
                  value={newPhone}
                  onChange={e => setNewPhone(e.target.value)}
                  placeholder="Phone number"
                  className="text-sm mt-1"
                  maxLength={20}
                />
              </div>
            </div>
            <Button
              size="sm"
              className="w-full h-8 text-xs"
              onClick={handleAddCustomerPair}
              disabled={!newName.trim()}
            >
              <Plus className="h-3 w-3 mr-1" /> Add Customer
            </Button>
          </CardContent>
        </Card>

        {FIELD_CONFIG.map(({ field, label, icon: Icon, placeholder }) => {
          const items = entries[field];
          const isCustomerField = field === 'customerName' || field === 'customerPhone';
          return (
            <Card key={field} className="bg-card">
              <CardHeader className="pb-2 pt-4 px-4">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm flex items-center gap-2">
                    <Icon className="h-4 w-4 text-primary" />
                    {label}
                    <Badge variant="secondary" className="text-[10px] h-5">{items.length}</Badge>
                  </CardTitle>
                  {items.length > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-7 text-xs text-destructive hover:text-destructive"
                      onClick={() => handleClearAll(field, label)}
                    >
                      Clear All
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent className="p-2 space-y-2">
                {!isCustomerField && (
                  <div className="flex gap-2 px-1">
                    <Input
                      value={fieldInputs[field]}
                      onChange={e => setFieldInputs(prev => ({ ...prev, [field]: e.target.value }))}
                      placeholder={placeholder}
                      className="text-xs h-8 flex-1"
                      maxLength={100}
                      onKeyDown={e => { if (e.key === 'Enter') handleAddFieldEntry(field); }}
                    />
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 px-2"
                      onClick={() => handleAddFieldEntry(field)}
                      disabled={!fieldInputs[field].trim()}
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </Button>
                  </div>
                )}
                {items.length === 0 ? (
                  <p className="text-xs text-muted-foreground text-center py-3">No saved entries</p>
                ) : (
                  <div className="space-y-1.5 px-1">
                    {items.map(item => {
                      const isEditing = editing?.id === item.id;

                      if (isEditing) {
                        return (
                          <div key={item.id} className="rounded-md border border-primary/40 bg-muted/30 p-2 space-y-2">
                            <div className={field === 'customerName' ? 'grid grid-cols-2 gap-2' : ''}>
                              <Input
                                value={editing.value}
                                onChange={e => setEditing({ ...editing, value: e.target.value })}
                                className="text-xs h-8"
                                maxLength={100}
                                autoFocus
                                onKeyDown={e => {
                                  if (e.key === 'Enter') saveEdit();
                                  if (e.key === 'Escape') cancelEdit();
                                }}
                              />
                              {field === 'customerName' && (
                                <Input
                                  value={editing.linkedPhone}
                                  onChange={e => setEditing({ ...editing, linkedPhone: e.target.value })}
                                  placeholder="Phone"
                                  className="text-xs h-8"
                                  maxLength={20}
                                  onKeyDown={e => {
                                    if (e.key === 'Enter') saveEdit();
                                    if (e.key === 'Escape') cancelEdit();
                                  }}
                                />
                              )}
                            </div>
                            <div className="flex gap-1.5">
                              <Button size="sm" className="h-7 text-xs flex-1 gap-1" onClick={saveEdit}>
                                <Check className="h-3 w-3" /> Save
                              </Button>
                              <Button size="sm" variant="outline" className="h-7 text-xs flex-1 gap-1" onClick={cancelEdit}>
                                <X className="h-3 w-3" /> Cancel
                              </Button>
                            </div>
                          </div>
                        );
                      }

                      return (
                        <div
                          key={item.id}
                          className="flex items-center gap-1.5 rounded-md border border-border px-2.5 py-1.5 text-xs group"
                        >
                          <span className="flex-1 truncate font-normal">
                            {item.value}
                            {item.linkedPhone && field === 'customerName' && (
                              <span className="text-[10px] text-muted-foreground ml-1.5">📞 {item.linkedPhone}</span>
                            )}
                          </span>
                          <button
                            onClick={() => startEdit(item)}
                            className="rounded-full p-0.5 opacity-60 hover:opacity-100 hover:bg-accent transition-all"
                            title="Edit"
                          >
                            <Pencil className="h-3 w-3 text-muted-foreground" />
                          </button>
                          <button
                            onClick={() => handleRemove(item.id)}
                            className="rounded-full p-0.5 opacity-60 hover:opacity-100 hover:bg-destructive/20 transition-all"
                            title="Delete"
                          >
                            <Trash2 className="h-3 w-3 text-destructive" />
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </AppLayout>
  );
}
