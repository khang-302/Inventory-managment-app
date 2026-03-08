import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useIsMobile } from '@/hooks/use-mobile';
import { useApp } from '@/contexts/AppContext';
import { db } from '@/db/database';
import { logActivity } from '@/services/activityLogService';
import { formatCurrency } from '@/utils/currency';
import { toSafeNumber, toSafeQuantity, calculateTotalSafe, calculateProfitSafe } from '@/utils/safeNumber';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { persistFormValues } from '@/services/autocompleteService';

interface QuickSellModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickSellModal({ open, onOpenChange }: QuickSellModalProps) {
  const isMobile = useIsMobile();
  const { refreshStats } = useApp();

  const [partName, setPartName] = useState('');
  const [partNumber, setPartNumber] = useState('');
  const [brand, setBrand] = useState('');
  const [quantity, setQuantity] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [sellingPrice, setSellingPrice] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const calculations = useMemo(() => {
    const qty = toSafeQuantity(Number(quantity), 0);
    const buy = toSafeNumber(Number(purchasePrice), 0);
    const sell = toSafeNumber(Number(sellingPrice), 0);
    const totalPurchase = calculateTotalSafe(qty, buy);
    const totalSale = calculateTotalSafe(qty, sell);
    const profit = calculateProfitSafe(buy, sell, qty);
    return { totalPurchase, totalSale, profit, qty, buy, sell };
  }, [quantity, purchasePrice, sellingPrice]);

  const resetForm = () => {
    setPartName(''); setPartNumber(''); setBrand('');
    setQuantity(''); setPurchasePrice(''); setSellingPrice('');
    setBuyerName(''); setBuyerPhone(''); setNotes('');
    setErrors({});
  };

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!partName.trim()) e.partName = 'Part name is required';
    if (!quantity || Number(quantity) <= 0) e.quantity = 'Quantity must be > 0';
    if (!purchasePrice || Number(purchasePrice) < 0) e.purchasePrice = 'Purchase price is required';
    if (!sellingPrice || Number(sellingPrice) < 0) e.sellingPrice = 'Selling price is required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    if (!validate()) return;
    setIsSubmitting(true);
    try {
      const sale = {
        id: uuidv4(),
        partId: '', // no inventory link
        partName: partName.trim(),
        partSku: partNumber.trim() || 'QS-' + Date.now(),
        quantity: calculations.qty,
        unitPrice: calculations.sell,
        totalAmount: calculations.totalSale,
        buyingPrice: calculations.buy,
        profit: calculations.profit,
        customerName: buyerName.trim() || undefined,
        customerPhone: buyerPhone.trim() || undefined,
        notes: notes.trim() ? `[QuickSell]${brand ? ` Brand: ${brand}` : ''} ${notes.trim()}` : (brand ? `[QuickSell] Brand: ${brand}` : '[QuickSell]'),
        createdAt: new Date(),
      };

      await db.sales.add(sale);

      await logActivity({
        action: 'sale',
        entityType: 'sale',
        entityId: sale.id,
        description: `Quick Sell – ${sale.partName} sold | Profit: Rs ${calculations.profit.toLocaleString()}`,
        metadata: {
          saleType: 'quick_sell',
          partName: sale.partName,
          quantity: sale.quantity,
          totalAmount: sale.totalAmount,
          profit: sale.profit,
        },
      });

      await persistFormValues({
        customerName: buyerName.trim(),
        customerPhone: buyerPhone.trim(),
        brand: brand.trim(),
      });

      await refreshStats();
      toast.success('Quick sale recorded successfully!');
      resetForm();
      onOpenChange(false);
    } catch (error) {
      console.error('QuickSell error:', error);
      toast.error('Failed to record sale');
    } finally {
      setIsSubmitting(false);
    }
  };

  const formContent = (
    <div className="space-y-4 p-1">
      {/* Row 1 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="qs-part-name">Spare Part Name *</Label>
          <Input id="qs-part-name" value={partName} onChange={e => setPartName(e.target.value)} placeholder="e.g. Brake Pad" />
          {errors.partName && <p className="text-xs text-destructive mt-1">{errors.partName}</p>}
        </div>
        <div>
          <Label htmlFor="qs-part-number">Spare Part Number</Label>
          <Input id="qs-part-number" value={partNumber} onChange={e => setPartNumber(e.target.value)} placeholder="e.g. BP-001" />
        </div>
      </div>

      {/* Row 2 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="qs-brand">Brand</Label>
          <AutocompleteInput field="brand" value={brand} onChange={setBrand} placeholder="e.g. Toyota" />
        </div>
        <div>
          <Label htmlFor="qs-quantity">Quantity *</Label>
          <Input id="qs-quantity" type="number" min="1" value={quantity} onChange={e => setQuantity(e.target.value)} placeholder="0" />
          {errors.quantity && <p className="text-xs text-destructive mt-1">{errors.quantity}</p>}
        </div>
      </div>

      {/* Row 3 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="qs-purchase">Purchase Price (Rs) *</Label>
          <Input id="qs-purchase" type="number" min="0" value={purchasePrice} onChange={e => setPurchasePrice(e.target.value)} placeholder="0" />
          {errors.purchasePrice && <p className="text-xs text-destructive mt-1">{errors.purchasePrice}</p>}
        </div>
        <div>
          <Label htmlFor="qs-selling">Selling Price (Rs) *</Label>
          <Input id="qs-selling" type="number" min="0" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} placeholder="0" />
          {errors.sellingPrice && <p className="text-xs text-destructive mt-1">{errors.sellingPrice}</p>}
        </div>
      </div>

      {/* Profit Display */}
      {(calculations.qty > 0 && calculations.sell > 0) && (
        <div className="rounded-lg border border-border bg-muted/50 p-3 space-y-1">
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Total Purchase</span>
            <span>{formatCurrency(calculations.totalPurchase)}</span>
          </div>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Total Sale</span>
            <span>{formatCurrency(calculations.totalSale)}</span>
          </div>
          <div className="flex justify-between text-sm font-semibold pt-1 border-t border-border">
            <span className="flex items-center gap-1">
              {calculations.profit >= 0 ? <TrendingUp className="h-3.5 w-3.5 text-green-500" /> : <TrendingDown className="h-3.5 w-3.5 text-destructive" />}
              Profit
            </span>
            <span className={calculations.profit >= 0 ? 'text-green-500' : 'text-destructive'}>
              {formatCurrency(calculations.profit)}
            </span>
          </div>
        </div>
      )}

      {/* Row 4 */}
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="qs-buyer">Buyer Name</Label>
          <AutocompleteInput field="customerName" value={buyerName} onChange={setBuyerName} placeholder="Optional" />
        </div>
        <div>
          <Label htmlFor="qs-phone">Buyer Phone</Label>
          <AutocompleteInput field="customerPhone" value={buyerPhone} onChange={setBuyerPhone} placeholder="Optional" />
        </div>
      </div>

      {/* Notes */}
      <div>
        <Label htmlFor="qs-notes">Notes</Label>
        <Textarea id="qs-notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." rows={2} />
      </div>

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <Button variant="outline" className="flex-1" onClick={() => { resetForm(); onOpenChange(false); }} disabled={isSubmitting}>
          Cancel
        </Button>
        <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
          {isSubmitting ? 'Recording...' : 'Confirm Sale'}
        </Button>
      </div>
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={onOpenChange}>
        <DrawerContent className="max-h-[90vh]">
          <DrawerHeader>
            <DrawerTitle>⚡ Quick Sell</DrawerTitle>
          </DrawerHeader>
          <div className="overflow-y-auto px-4 pb-6">
            {formContent}
          </div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>⚡ Quick Sell</DialogTitle>
        </DialogHeader>
        {formContent}
      </DialogContent>
    </Dialog>
  );
}
