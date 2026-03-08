import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { db } from '@/db/database';
import { recordMultiSale } from '@/services/salesService';
import { formatCurrency, calculateProfit } from '@/utils/currency';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from 'sonner';
import { Loader2, Package, Plus, Pencil, Trash2, ShoppingCart } from 'lucide-react';
import { persistFormValues } from '@/services/autocompleteService';
import { cn } from '@/lib/utils';

interface CartItem {
  id: string;
  partId: string;
  partName: string;
  partSku: string;
  availableStock: number;
  buyingPrice: number;
  quantity: number;
  unitPrice: number;
}

export default function RecordSale() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [customerName, setCustomerName] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [notes, setNotes] = useState('');

  // Add item form state
  const [selectedPartId, setSelectedPartId] = useState('');
  const [addQuantity, setAddQuantity] = useState(1);
  const [addUnitPrice, setAddUnitPrice] = useState(0);
  const [editingItemId, setEditingItemId] = useState<string | null>(null);
  const [addError, setAddError] = useState<string | null>(null);

  const parts = useLiveQuery(() => db.parts.filter(p => p.quantity > 0).toArray(), []) ?? [];

  const selectedPart = parts.find(p => p.id === selectedPartId);

  const handlePartSelect = (partId: string) => {
    const part = parts.find(p => p.id === partId);
    if (part) {
      setSelectedPartId(partId);
      setAddUnitPrice(part.sellingPrice);
      setAddQuantity(1);
      setAddError(null);
    }
  };

  const getAvailableStock = useCallback((partId: string, excludeCartItemId?: string) => {
    const part = parts.find(p => p.id === partId);
    if (!part) return 0;
    const cartUsed = cart
      .filter(c => c.partId === partId && c.id !== excludeCartItemId)
      .reduce((sum, c) => sum + c.quantity, 0);
    return part.quantity - cartUsed;
  }, [parts, cart]);

  const handleAddToCart = () => {
    if (!selectedPartId || !selectedPart) { setAddError('Select a part'); return; }
    if (addQuantity <= 0) { setAddError('Quantity must be > 0'); return; }
    if (addUnitPrice < 0) { setAddError('Price cannot be negative'); return; }

    const available = getAvailableStock(selectedPartId, editingItemId || undefined);
    if (addQuantity > available) { setAddError(`Only ${available} available`); return; }

    setAddError(null);

    if (editingItemId) {
      setCart(prev => prev.map(item =>
        item.id === editingItemId
          ? { ...item, quantity: addQuantity, unitPrice: addUnitPrice }
          : item
      ));
      setEditingItemId(null);
    } else {
      // Check if part already in cart
      const existing = cart.find(c => c.partId === selectedPartId);
      if (existing) {
        const newQty = existing.quantity + addQuantity;
        if (newQty > getAvailableStock(selectedPartId)) {
          setAddError(`Total would exceed stock`);
          return;
        }
        setCart(prev => prev.map(item =>
          item.id === existing.id ? { ...item, quantity: newQty, unitPrice: addUnitPrice } : item
        ));
      } else {
        setCart(prev => [...prev, {
          id: crypto.randomUUID(),
          partId: selectedPartId,
          partName: selectedPart.name,
          partSku: selectedPart.sku,
          availableStock: selectedPart.quantity,
          buyingPrice: selectedPart.buyingPrice,
          quantity: addQuantity,
          unitPrice: addUnitPrice,
        }]);
      }
    }

    // Reset
    setSelectedPartId('');
    setAddQuantity(1);
    setAddUnitPrice(0);
  };

  const handleEditCartItem = (item: CartItem) => {
    setSelectedPartId(item.partId);
    setAddQuantity(item.quantity);
    setAddUnitPrice(item.unitPrice);
    setEditingItemId(item.id);
    setAddError(null);
  };

  const handleRemoveCartItem = (id: string) => {
    setCart(prev => prev.filter(item => item.id !== id));
    if (editingItemId === id) {
      setEditingItemId(null);
      setSelectedPartId('');
      setAddQuantity(1);
      setAddUnitPrice(0);
    }
  };

  const cancelEdit = () => {
    setEditingItemId(null);
    setSelectedPartId('');
    setAddQuantity(1);
    setAddUnitPrice(0);
    setAddError(null);
  };

  // Calculations
  const totalQuantity = cart.reduce((s, c) => s + c.quantity, 0);
  const grandTotal = cart.reduce((s, c) => s + c.quantity * c.unitPrice, 0);
  const totalProfit = cart.reduce((s, c) => s + calculateProfit(c.buyingPrice, c.unitPrice, c.quantity), 0);

  const handleCompleteSale = async () => {
    if (cart.length === 0) { toast.error('Cart is empty'); return; }

    setIsSubmitting(true);
    try {
      const result = await recordMultiSale({
        items: cart.map(c => ({
          partId: c.partId,
          quantity: c.quantity,
          unitPrice: c.unitPrice,
        })),
        customerName: customerName || undefined,
        customerPhone: customerPhone || undefined,
        notes: notes || undefined,
      });

      if ('error' in result) {
        toast.error(result.error);
        return;
      }

      await persistFormValues({ customerName: customerName.trim(), customerPhone: customerPhone.trim() });
      toast.success(`Sale completed • ${cart.length} item(s)`);
      navigate('/');
    } catch (error) {
      console.error('Failed to complete sale:', error);
      toast.error('Failed to complete sale');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <AppLayout hideNav>
      <Header title="Record Sale" showBack />

      <div className="p-4 pb-28 space-y-4">
        {/* Add Item Section */}
        <Card className="bg-card">
          <CardHeader className="pb-2 pt-4 px-4">
            <CardTitle className="text-sm flex items-center gap-2">
              <Plus className="h-4 w-4 text-primary" />
              {editingItemId ? 'Edit Item' : 'Add Item to Sale'}
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-2 space-y-3">
            <div>
              <Label className="text-xs">Select Part *</Label>
              <Select onValueChange={handlePartSelect} value={selectedPartId}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Choose a part" />
                </SelectTrigger>
                <SelectContent>
                  {parts.map(part => (
                    <SelectItem key={part.id} value={part.id}>
                      <span>{part.name}</span>
                      <span className="text-xs text-muted-foreground ml-2">
                        ({getAvailableStock(part.id, editingItemId || undefined)} avail)
                      </span>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedPart && (
              <div className="p-2 bg-muted rounded-lg flex items-center gap-2">
                <Package className="h-4 w-4 text-muted-foreground shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-xs font-medium truncate">{selectedPart.name}</p>
                  <p className="text-[10px] text-muted-foreground">SKU: {selectedPart.sku} • Stock: {getAvailableStock(selectedPartId, editingItemId || undefined)}</p>
                </div>
                <p className="text-xs font-semibold text-primary">{formatCurrency(selectedPart.sellingPrice)}</p>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Quantity *</Label>
                <Input
                  type="number"
                  min={1}
                  value={addQuantity}
                  onChange={e => setAddQuantity(Math.max(1, parseInt(e.target.value) || 1))}
                  onFocus={e => e.target.select()}
                  className="mt-1"
                />
              </div>
              <div>
                <Label className="text-xs">Unit Price (Rs) *</Label>
                <Input
                  type="number"
                  min={0}
                  step={1}
                  value={addUnitPrice}
                  onChange={e => setAddUnitPrice(parseFloat(e.target.value) || 0)}
                  onFocus={e => e.target.select()}
                  className="mt-1"
                />
              </div>
            </div>

            {addError && <p className="text-xs text-destructive">{addError}</p>}

            <div className="flex gap-2">
              <Button onClick={handleAddToCart} className="flex-1" size="sm" disabled={!selectedPartId}>
                <Plus className="h-4 w-4 mr-1" />
                {editingItemId ? 'Update Item' : 'Add to Cart'}
              </Button>
              {editingItemId && (
                <Button variant="outline" size="sm" onClick={cancelEdit}>Cancel</Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Cart */}
        {cart.length > 0 && (
          <Card className="bg-card">
            <CardHeader className="pb-2 pt-4 px-4">
              <CardTitle className="text-sm flex items-center gap-2">
                <ShoppingCart className="h-4 w-4 text-primary" />
                Cart ({cart.length} item{cart.length > 1 ? 's' : ''})
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0 divide-y divide-border">
              {cart.map(item => {
                const subtotal = item.quantity * item.unitPrice;
                const profit = calculateProfit(item.buyingPrice, item.unitPrice, item.quantity);
                return (
                  <div key={item.id} className="px-4 py-3 flex items-center gap-3">
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{item.partName}</p>
                      <p className="text-[10px] text-muted-foreground">
                        {item.quantity} × {formatCurrency(item.unitPrice)} = {formatCurrency(subtotal)}
                      </p>
                      <p className={cn('text-[10px]', profit >= 0 ? 'text-primary' : 'text-destructive')}>
                        Profit: {profit >= 0 ? '+' : ''}{formatCurrency(profit)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1 shrink-0">
                      <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => handleEditCartItem(item)}>
                        <Pencil className="h-3.5 w-3.5" />
                      </Button>
                      <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleRemoveCartItem(item.id)}>
                        <Trash2 className="h-3.5 w-3.5" />
                      </Button>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}

        {/* Summary */}
        {cart.length > 0 && (
          <Card className="bg-card">
            <CardContent className="p-4 space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Items</span>
                <span>{totalQuantity}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Subtotal</span>
                <span>{formatCurrency(grandTotal)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">Total Profit</span>
                <span className={cn(totalProfit >= 0 ? 'text-primary' : 'text-destructive')}>
                  {totalProfit >= 0 ? '+' : ''}{formatCurrency(totalProfit)}
                </span>
              </div>
              <div className="flex justify-between font-semibold text-lg pt-2 border-t border-border">
                <span>Grand Total</span>
                <span className="text-primary">{formatCurrency(grandTotal)}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Customer Info */}
        <Card className="bg-card">
          <CardContent className="p-4 space-y-3">
            <p className="text-xs font-medium text-muted-foreground">Customer Info (Optional)</p>
            <div>
              <Label className="text-xs">Customer Name</Label>
              <AutocompleteInput field="customerName" placeholder="Enter name" value={customerName} onChange={setCustomerName} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Phone Number</Label>
              <AutocompleteInput field="customerPhone" placeholder="03XX XXXXXXX" value={customerPhone} onChange={setCustomerPhone} className="mt-1" />
            </div>
            <div>
              <Label className="text-xs">Notes</Label>
              <Textarea placeholder="Sale notes..." className="min-h-[60px] mt-1" value={notes} onChange={e => setNotes(e.target.value)} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Complete Sale Button */}
      <div className="fixed bottom-0 left-0 right-0 p-4 bg-background border-t border-border">
        <Button
          className="w-full h-12"
          disabled={isSubmitting || cart.length === 0}
          onClick={handleCompleteSale}
        >
          {isSubmitting && <Loader2 className="h-4 w-4 mr-2 animate-spin" />}
          Complete Sale • {formatCurrency(grandTotal)}
        </Button>
      </div>
    </AppLayout>
  );
}
