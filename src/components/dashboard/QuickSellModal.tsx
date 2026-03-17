import { useState, useMemo, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { AutocompleteInput } from '@/components/ui/autocomplete-input';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useIsMobile } from '@/hooks/use-mobile';
import { useApp } from '@/contexts/AppContext';
import { db, getSetting } from '@/db/database';
import { logActivity } from '@/services/activityLogService';
import { createBillFromSale } from '@/services/saleBillService';
import { formatCurrency } from '@/utils/currency';
import { toSafeNumber, toSafeQuantity, calculateTotalSafe, calculateProfitSafe } from '@/utils/safeNumber';
import { v4 as uuidv4 } from 'uuid';
import { toast } from 'sonner';
import { TrendingUp, TrendingDown, FileText, Plus, X, Package } from 'lucide-react';
import { persistFormValues } from '@/services/autocompleteService';
import { SaleSuccessDialog } from '@/components/sale/SaleSuccessDialog';

interface QuickSellItem {
  partName: string;
  partNumber: string;
  brand: string;
  quantity: string;
  purchasePrice: string;
  sellingPrice: string;
}

const emptyItem = (): QuickSellItem => ({
  partName: '', partNumber: '', brand: '',
  quantity: '', purchasePrice: '', sellingPrice: '',
});

function calcItem(item: QuickSellItem) {
  const qty = toSafeQuantity(Number(item.quantity), 0);
  const buy = toSafeNumber(Number(item.purchasePrice), 0);
  const sell = toSafeNumber(Number(item.sellingPrice), 0);
  return {
    qty, buy, sell,
    totalPurchase: calculateTotalSafe(qty, buy),
    totalSale: calculateTotalSafe(qty, sell),
    profit: calculateProfitSafe(buy, sell, qty),
  };
}

interface QuickSellModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function QuickSellModal({ open, onOpenChange }: QuickSellModalProps) {
  const isMobile = useIsMobile();
  const { refreshStats } = useApp();

  // Items list
  const [items, setItems] = useState<QuickSellItem[]>([]);
  // Current item being entered
  const [current, setCurrent] = useState<QuickSellItem>(emptyItem());
  // Shared fields
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [autoGenerateBill, setAutoGenerateBill] = useState(false);
  const [createdBillId, setCreatedBillId] = useState('');
  const [createdBillNumber, setCreatedBillNumber] = useState('');
  const [showSuccessDialog, setShowSuccessDialog] = useState(false);

  useEffect(() => {
    if (open) {
      getSetting<boolean>('autoGenerateBill').then(v => { if (v) setAutoGenerateBill(true); });
    }
  }, [open]);

  // Aggregated calculations
  const totals = useMemo(() => {
    const currentCalc = calcItem(current);
    const hasCurrentData = currentCalc.qty > 0 && currentCalc.sell > 0;

    let totalPurchase = 0, totalSale = 0, totalProfit = 0;
    for (const item of items) {
      const c = calcItem(item);
      totalPurchase += c.totalPurchase;
      totalSale += c.totalSale;
      totalProfit += c.profit;
    }
    if (hasCurrentData) {
      totalPurchase += currentCalc.totalPurchase;
      totalSale += currentCalc.totalSale;
      totalProfit += currentCalc.profit;
    }
    return { totalPurchase, totalSale, totalProfit, itemCount: items.length + (hasCurrentData ? 1 : 0), hasCurrentData };
  }, [items, current]);

  const resetForm = () => {
    setItems([]);
    setCurrent(emptyItem());
    setBuyerName(''); setBuyerPhone(''); setNotes('');
    setErrors({}); setAutoGenerateBill(false);
  };

  const validateCurrent = (): boolean => {
    const e: Record<string, string> = {};
    if (!current.partName.trim()) e.partName = 'Part name is required';
    if (!current.quantity || Number(current.quantity) <= 0) e.quantity = 'Quantity must be > 0';
    if (!current.purchasePrice || Number(current.purchasePrice) < 0) e.purchasePrice = 'Required';
    if (!current.sellingPrice || Number(current.sellingPrice) < 0) e.sellingPrice = 'Required';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const isCurrentEmpty = () => !current.partName.trim() && !current.quantity && !current.sellingPrice;

  const handleAddItem = () => {
    if (!validateCurrent()) return;
    setItems(prev => [...prev, { ...current }]);
    setCurrent(emptyItem());
    setErrors({});
  };

  const handleRemoveItem = (index: number) => {
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    // Auto-add current item if it has data
    let finalItems = [...items];
    if (!isCurrentEmpty()) {
      if (!validateCurrent()) return;
      finalItems = [...finalItems, { ...current }];
    }
    if (finalItems.length === 0) {
      setErrors({ partName: 'Add at least one item' });
      return;
    }

    setIsSubmitting(true);
    try {
      const saleRecords = finalItems.map(item => {
        const c = calcItem(item);
        return {
          id: uuidv4(),
          partId: '',
          partName: item.partName.trim(),
          partSku: item.partNumber.trim() || 'QS-' + Date.now(),
          quantity: c.qty,
          unitPrice: c.sell,
          totalAmount: c.totalSale,
          buyingPrice: c.buy,
          profit: c.profit,
          customerName: buyerName.trim() || undefined,
          customerPhone: buyerPhone.trim() || undefined,
          notes: `[QuickSell]${item.brand ? ` Brand: ${item.brand}` : ''}${notes.trim() ? ' ' + notes.trim() : ''}`,
          createdAt: new Date(),
        };
      });

      await db.transaction('rw', [db.sales, db.activityLogs], async () => {
        for (const sale of saleRecords) {
          await db.sales.add(sale);
        }
        await logActivity({
          action: 'sale',
          entityType: 'sale',
          entityId: saleRecords[0].id,
          description: `Quick Sell – ${saleRecords.length} item(s) | Profit: Rs ${totals.totalProfit.toLocaleString()}`,
          metadata: {
            saleType: 'quick_sell',
            itemCount: saleRecords.length,
            totalAmount: totals.totalSale,
            profit: totals.totalProfit,
          },
        });
      });

      await persistFormValues({
        customerName: buyerName.trim(),
        customerPhone: buyerPhone.trim(),
        brand: finalItems[0]?.brand?.trim() || '',
      });

      await refreshStats();

      if (autoGenerateBill) {
        try {
          const billResult = await createBillFromSale({
            buyerName: buyerName.trim(),
            buyerPhone: buyerPhone.trim(),
            items: finalItems.map(item => {
              const c = calcItem(item);
              return {
                partName: item.partName.trim(),
                partCode: item.partNumber.trim() || 'QS-' + Date.now(),
                brand: item.brand.trim(),
                quantity: c.qty,
                price: c.sell,
              };
            }),
            notes: notes.trim(),
          });
          setCreatedBillId(billResult.billId);
          setCreatedBillNumber(billResult.billNumber);
          resetForm();
          onOpenChange(false);
          setShowSuccessDialog(true);
        } catch (err) {
          console.error('Bill generation failed:', err);
          toast.error('Sale recorded but bill generation failed');
          resetForm();
          onOpenChange(false);
        }
      } else {
        toast.success(`${saleRecords.length} item(s) sold successfully!`);
        resetForm();
        onOpenChange(false);
      }
    } catch (error) {
      console.error('QuickSell error:', error);
      toast.error('Failed to record sale');
    } finally {
      setIsSubmitting(false);
    }
  };

  const updateCurrent = (field: keyof QuickSellItem, value: string) => {
    setCurrent(prev => ({ ...prev, [field]: value }));
  };

  // ---------- Added items list ----------
  const itemsList = items.length > 0 && (
    <div className="space-y-2 mb-3">
      <Label className="text-xs text-muted-foreground">Added Items ({items.length})</Label>
      {items.map((item, idx) => {
        const c = calcItem(item);
        return (
          <div key={idx} className="flex items-center gap-2 rounded-lg border border-border bg-muted/30 px-3 py-2">
            <Package className="h-3.5 w-3.5 text-muted-foreground shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{item.partName}</p>
              <p className="text-xs text-muted-foreground">Qty: {c.qty} × {formatCurrency(c.sell)}</p>
            </div>
            <span className="text-sm font-medium shrink-0">{formatCurrency(c.totalSale)}</span>
            <button type="button" onClick={() => handleRemoveItem(idx)} className="text-muted-foreground hover:text-destructive shrink-0">
              <X className="h-4 w-4" />
            </button>
          </div>
        );
      })}
    </div>
  );

  // ---------- Item input fields ----------
  const itemFields = (
    <div className="space-y-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="qs-part-name">Spare Part Name *</Label>
          <Input id="qs-part-name" value={current.partName} onChange={e => updateCurrent('partName', e.target.value)} placeholder="e.g. Brake Pad" />
          {errors.partName && <p className="text-xs text-destructive mt-1">{errors.partName}</p>}
        </div>
        <div>
          <Label htmlFor="qs-part-number">Spare Part Number</Label>
          <Input id="qs-part-number" value={current.partNumber} onChange={e => updateCurrent('partNumber', e.target.value)} placeholder="e.g. BP-001" />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="qs-brand">Brand</Label>
          <AutocompleteInput field="brand" value={current.brand} onChange={v => updateCurrent('brand', v)} placeholder="e.g. Toyota" />
        </div>
        <div>
          <Label htmlFor="qs-quantity">Quantity *</Label>
          <Input id="qs-quantity" type="number" min="1" value={current.quantity} onChange={e => updateCurrent('quantity', e.target.value)} placeholder="0" />
          {errors.quantity && <p className="text-xs text-destructive mt-1">{errors.quantity}</p>}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="qs-purchase">Purchase Price (Rs) *</Label>
          <Input id="qs-purchase" type="number" min="0" value={current.purchasePrice} onChange={e => updateCurrent('purchasePrice', e.target.value)} placeholder="0" />
          {errors.purchasePrice && <p className="text-xs text-destructive mt-1">{errors.purchasePrice}</p>}
        </div>
        <div>
          <Label htmlFor="qs-selling">Selling Price (Rs) *</Label>
          <Input id="qs-selling" type="number" min="0" value={current.sellingPrice} onChange={e => updateCurrent('sellingPrice', e.target.value)} placeholder="0" />
          {errors.sellingPrice && <p className="text-xs text-destructive mt-1">{errors.sellingPrice}</p>}
        </div>
      </div>
      {/* Add Part button */}
      <Button type="button" variant="outline" size="sm" className="w-full" onClick={handleAddItem}>
        <Plus className="h-4 w-4 mr-1" /> Add Part
      </Button>
    </div>
  );

  // ---------- Calculation card ----------
  const calculationCard = totals.itemCount > 0 && (
    <div className="rounded-lg border border-border bg-muted/50 p-3 space-y-1">
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Total Purchase ({totals.itemCount} item{totals.itemCount > 1 ? 's' : ''})</span>
        <span>{formatCurrency(totals.totalPurchase)}</span>
      </div>
      <div className="flex justify-between text-xs text-muted-foreground">
        <span>Total Sale</span>
        <span>{formatCurrency(totals.totalSale)}</span>
      </div>
      <div className="flex justify-between text-sm font-semibold pt-1 border-t border-border">
        <span className="flex items-center gap-1">
          {totals.totalProfit >= 0 ? <TrendingUp className="h-3.5 w-3.5 text-green-500" /> : <TrendingDown className="h-3.5 w-3.5 text-destructive" />}
          Profit
        </span>
        <span className={totals.totalProfit >= 0 ? 'text-green-500' : 'text-destructive'}>
          {formatCurrency(totals.totalProfit)}
        </span>
      </div>
    </div>
  );

  // ---------- Shared fields ----------
  const sharedFields = (
    <div className="space-y-3 mt-3">
      <div className="grid grid-cols-2 gap-3">
        <div>
          <Label htmlFor="qs-buyer">Buyer Name</Label>
          <AutocompleteInput
            field="customerName"
            value={buyerName}
            onChange={setBuyerName}
            onEntrySelect={(entry) => {
              if (entry.linkedPhone && !buyerPhone) setBuyerPhone(entry.linkedPhone);
            }}
            placeholder="Optional"
          />
        </div>
        <div>
          <Label htmlFor="qs-phone">Buyer Phone</Label>
          <AutocompleteInput field="customerPhone" value={buyerPhone} onChange={setBuyerPhone} placeholder="Optional" />
        </div>
      </div>
      <div>
        <Label htmlFor="qs-notes">Notes</Label>
        <Textarea id="qs-notes" value={notes} onChange={e => setNotes(e.target.value)} placeholder="Optional notes..." rows={2} />
      </div>
      <div className="flex items-center justify-between rounded-lg border border-border p-3">
        <div className="flex items-center gap-2">
          <FileText className="h-4 w-4 text-primary" />
          <Label htmlFor="qs-auto-bill" className="text-sm font-medium cursor-pointer">Auto Generate Bill</Label>
        </div>
        <Switch id="qs-auto-bill" checked={autoGenerateBill} onCheckedChange={setAutoGenerateBill} />
      </div>
    </div>
  );

  // ---------- Scrollable content ----------
  const scrollContent = (
    <div className="flex flex-col gap-4 p-1 pb-[calc(120px+env(safe-area-inset-bottom))]">
      {itemsList}
      {itemFields}
      {calculationCard}
      {sharedFields}
    </div>
  );

  // ---------- Fixed bottom action bar ----------
  const actionBar = (
    <div
      className="sticky bottom-0 flex gap-3 border-t border-border bg-background px-4 pt-3"
      style={{ paddingBottom: 'calc(16px + env(safe-area-inset-bottom, 0px))' }}
    >
      <Button variant="outline" className="flex-1" onClick={() => { resetForm(); onOpenChange(false); }} disabled={isSubmitting}>
        Cancel
      </Button>
      <Button className="flex-1" onClick={handleSubmit} disabled={isSubmitting}>
        {isSubmitting ? 'Recording...' : `Confirm Sale${totals.itemCount > 0 ? ` (${totals.itemCount})` : ''}`}
      </Button>
    </div>
  );

  const successDialog = (
    <SaleSuccessDialog
      open={showSuccessDialog}
      billId={createdBillId}
      billNumber={createdBillNumber}
      onClose={() => setShowSuccessDialog(false)}
    />
  );

  if (isMobile) {
    return (
      <>
        <Drawer open={open} onOpenChange={onOpenChange}>
          <DrawerContent className="max-h-[90vh] flex flex-col">
            <DrawerHeader>
              <DrawerTitle>⚡ Quick Sell</DrawerTitle>
            </DrawerHeader>
            <div className="flex-1 overflow-y-auto min-h-0 px-4">
              {scrollContent}
            </div>
            {actionBar}
          </DrawerContent>
        </Drawer>
        {successDialog}
      </>
    );
  }

  return (
    <>
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="sm:max-w-lg max-h-[90vh] flex flex-col">
          <DialogHeader>
            <DialogTitle>⚡ Quick Sell</DialogTitle>
          </DialogHeader>
          <div className="flex-1 overflow-y-auto min-h-0">
            {scrollContent}
          </div>
          {actionBar}
        </DialogContent>
      </Dialog>
      {successDialog}
    </>
  );
}
