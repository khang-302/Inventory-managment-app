import { useState, useEffect, useMemo, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, FileText, CreditCard, ScrollText } from 'lucide-react';
import { createBill, getNextBillNumber, getBillSettings } from '@/services/billService';
import { formatCurrency } from '@/utils/currency';
import type { BillFormItem, PaymentInfo } from '@/types/bill';

const emptyItem = (): BillFormItem => ({
  partName: '',
  partCode: '',
  brand: '',
  quantity: 1,
  price: 0,
});

const emptyPayment = (): PaymentInfo => ({
  bankName: '',
  accountTitle: '',
  accountNumber: '',
  iban: '',
  easypaisaNumber: '',
  jazzcashNumber: '',
});

export default function BillCreate() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [billNumber, setBillNumber] = useState('');
  const [buyerName, setBuyerName] = useState('');
  const [buyerPhone, setBuyerPhone] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [items, setItems] = useState<BillFormItem[]>([emptyItem()]);
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);

  // Advanced optional sections
  const [showPaymentInfo, setShowPaymentInfo] = useState(false);
  const [paymentInfo, setPaymentInfo] = useState<PaymentInfo>(emptyPayment());
  const [showTerms, setShowTerms] = useState(false);
  const [termsConditions, setTermsConditions] = useState<string[]>([]);

  useEffect(() => {
    getNextBillNumber().then(setBillNumber);
    // Load defaults from settings
    getBillSettings().then(s => {
      setShowPaymentInfo(s.showPaymentInfo);
      setPaymentInfo(s.paymentInfo || emptyPayment());
      setShowTerms(s.showTerms);
      setTermsConditions(s.termsConditions || []);
    });
  }, []);

  const subtotal = useMemo(() => items.reduce((sum, i) => sum + i.quantity * i.price, 0), [items]);
  const finalTotal = useMemo(() => Math.max(0, subtotal - discount), [subtotal, discount]);

  const updateItem = useCallback((index: number, field: keyof BillFormItem, value: string | number) => {
    setItems(prev => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: value };
      return next;
    });
  }, []);

  const addItem = () => setItems(prev => [...prev, emptyItem()]);
  const removeItem = (index: number) => {
    if (items.length <= 1) return;
    setItems(prev => prev.filter((_, i) => i !== index));
  };

  const updateTerm = (index: number, value: string) => {
    setTermsConditions(prev => { const n = [...prev]; n[index] = value; return n; });
  };
  const addTerm = () => setTermsConditions(prev => [...prev, '']);
  const removeTerm = (index: number) => setTermsConditions(prev => prev.filter((_, i) => i !== index));

  const handleSave = async () => {
    if (!buyerName.trim()) {
      toast({ title: 'Buyer name is required', variant: 'destructive' });
      return;
    }
    const validItems = items.filter(i => i.partName.trim() && i.quantity > 0 && i.price > 0);
    if (validItems.length === 0) {
      toast({ title: 'Add at least one valid item', variant: 'destructive' });
      return;
    }

    setSaving(true);
    try {
      const bill = await createBill(
        buyerName.trim(), buyerPhone.trim(), new Date(date), validItems, discount, notes.trim(),
        {
          showPaymentInfo,
          paymentInfo: showPaymentInfo ? paymentInfo : undefined,
          showTerms,
          termsConditions: showTerms ? termsConditions.filter(t => t.trim()) : undefined,
        }
      );

      toast({ title: `Bill ${bill.billNumber} saved successfully` });
      navigate('/bills');
    } catch (e) {
      toast({ title: 'Failed to create bill', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  return (
    <AppLayout>
      <Header title="Create Bill" showBack />
      <div className="p-4 space-y-4 pb-24">
        {/* Bill Info */}
        <Card className="bg-card">
          <CardContent className="p-4 space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Bill Number</Label>
                <Input value={billNumber} readOnly className="bg-muted/50 text-sm" />
              </div>
              <div>
                <Label className="text-xs">Date</Label>
                <Input type="date" value={date} onChange={e => setDate(e.target.value)} className="text-sm" />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Buyer Name *</Label>
                <Input value={buyerName} onChange={e => setBuyerName(e.target.value)} placeholder="Customer name" className="text-sm" />
              </div>
              <div>
                <Label className="text-xs">Phone</Label>
                <Input value={buyerPhone} onChange={e => setBuyerPhone(e.target.value)} placeholder="Phone number" className="text-sm" />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Items */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-medium text-muted-foreground">Items</h2>
            <Button size="sm" variant="outline" onClick={addItem} className="h-7 text-xs gap-1">
              <Plus className="h-3 w-3" /> Add Row
            </Button>
          </div>
          <div className="space-y-3">
            {items.map((item, idx) => (
              <Card key={idx} className="bg-card">
                <CardContent className="p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-muted-foreground font-medium">Item {idx + 1}</span>
                    {items.length > 1 && (
                      <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => removeItem(idx)}>
                        <Trash2 className="h-3.5 w-3.5 text-destructive" />
                      </Button>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label className="text-[10px]">Part Name *</Label>
                      <Input value={item.partName} onChange={e => updateItem(idx, 'partName', e.target.value)} placeholder="Name" className="text-sm h-8" />
                    </div>
                    <div>
                      <Label className="text-[10px]">Part Code</Label>
                      <Input value={item.partCode} onChange={e => updateItem(idx, 'partCode', e.target.value)} placeholder="Code" className="text-sm h-8" />
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    <div>
                      <Label className="text-[10px]">Brand</Label>
                      <Input value={item.brand} onChange={e => updateItem(idx, 'brand', e.target.value)} placeholder="Brand" className="text-sm h-8" />
                    </div>
                    <div>
                      <Label className="text-[10px]">Qty *</Label>
                      <Input type="number" min={1} value={item.quantity} onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value) || 0)} className="text-sm h-8" />
                    </div>
                    <div>
                      <Label className="text-[10px]">Price (Rs) *</Label>
                      <Input type="number" min={0} value={item.price || ''} onChange={e => updateItem(idx, 'price', parseFloat(e.target.value) || 0)} className="text-sm h-8" />
                    </div>
                  </div>
                  {item.quantity > 0 && item.price > 0 && (
                    <p className="text-xs text-right text-muted-foreground">
                      Total: <span className="font-medium text-foreground">{formatCurrency(item.quantity * item.price)}</span>
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        </div>

        {/* Totals */}
        <Card className="bg-card">
          <CardContent className="p-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="font-medium">{formatCurrency(subtotal)}</span>
            </div>
            <div className="flex items-center justify-between gap-3">
              <Label className="text-sm text-muted-foreground shrink-0">Discount</Label>
              <Input
                type="number" min={0} value={discount || ''} onChange={e => setDiscount(parseFloat(e.target.value) || 0)}
                className="text-sm h-8 w-28 text-right" placeholder="0"
              />
            </div>
            <div className="flex justify-between text-base font-bold pt-2 border-t border-border">
              <span>Final Total</span>
              <span className="text-primary">{formatCurrency(finalTotal)}</span>
            </div>
          </CardContent>
        </Card>

        {/* Payment Information Toggle */}
        <Card className="bg-card">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium">Payment Information</Label>
              </div>
              <Switch checked={showPaymentInfo} onCheckedChange={setShowPaymentInfo} />
            </div>
            {showPaymentInfo && (
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px]">Bank Name</Label>
                    <Input value={paymentInfo.bankName} onChange={e => setPaymentInfo(p => ({ ...p, bankName: e.target.value }))} className="text-sm h-8" placeholder="HBL Bank" />
                  </div>
                  <div>
                    <Label className="text-[10px]">Account Title</Label>
                    <Input value={paymentInfo.accountTitle} onChange={e => setPaymentInfo(p => ({ ...p, accountTitle: e.target.value }))} className="text-sm h-8" placeholder="Amir Traders" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px]">Account Number</Label>
                    <Input value={paymentInfo.accountNumber} onChange={e => setPaymentInfo(p => ({ ...p, accountNumber: e.target.value }))} className="text-sm h-8" />
                  </div>
                  <div>
                    <Label className="text-[10px]">IBAN</Label>
                    <Input value={paymentInfo.iban} onChange={e => setPaymentInfo(p => ({ ...p, iban: e.target.value }))} className="text-sm h-8" />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <Label className="text-[10px]">EasyPaisa</Label>
                    <Input value={paymentInfo.easypaisaNumber} onChange={e => setPaymentInfo(p => ({ ...p, easypaisaNumber: e.target.value }))} className="text-sm h-8" />
                  </div>
                  <div>
                    <Label className="text-[10px]">JazzCash</Label>
                    <Input value={paymentInfo.jazzcashNumber} onChange={e => setPaymentInfo(p => ({ ...p, jazzcashNumber: e.target.value }))} className="text-sm h-8" />
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Terms & Conditions Toggle */}
        <Card className="bg-card">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-primary" />
                <Label className="text-sm font-medium">Terms & Conditions</Label>
              </div>
              <Switch checked={showTerms} onCheckedChange={setShowTerms} />
            </div>
            {showTerms && (
              <div className="space-y-2 pt-2 border-t border-border">
                {termsConditions.map((term, i) => (
                  <div key={i} className="flex gap-2">
                    <Input value={term} onChange={e => updateTerm(i, e.target.value)} className="text-sm h-8 flex-1" placeholder={`Term ${i + 1}`} />
                    <Button size="icon" variant="ghost" className="h-8 w-8 shrink-0" onClick={() => removeTerm(i)}>
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </Button>
                  </div>
                ))}
                <Button size="sm" variant="outline" onClick={addTerm} className="h-7 text-xs gap-1 w-full">
                  <Plus className="h-3 w-3" /> Add Term
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Notes */}
        <div>
          <Label className="text-xs text-muted-foreground">Notes</Label>
          <Textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Additional notes..." rows={2} className="text-sm mt-1" />
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <Button variant="outline" className="flex-1" onClick={() => navigate('/bills')}>Cancel</Button>
          <Button className="flex-1 gap-1" onClick={handleSave} disabled={saving}>
            <FileText className="h-4 w-4" />
            {saving ? 'Saving...' : 'Generate Bill'}
          </Button>
        </div>
      </div>
    </AppLayout>
  );
}
