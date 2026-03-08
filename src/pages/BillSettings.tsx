import { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { useToast } from '@/hooks/use-toast';
import { Save, RotateCcw, Plus, Trash2, CreditCard, ScrollText, Store, Globe, Droplets, Type, Image, Frame, StretchHorizontal, Eye, EyeOff, ZoomIn, ZoomOut, RotateCcw as ResetZoom, Palette } from 'lucide-react';
import { getBillSettings, updateBillSettings, resetBillCounter } from '@/services/billService';
import type { BillSettings, WatermarkStyle, Bill, BillItem, BillColorThemeId } from '@/types/bill';
import { BILL_COLOR_THEMES } from '@/utils/billColorThemes';
import BillPreviewTemplate from '@/components/bill/BillPreviewTemplate';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function BillSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<BillSettings | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  // Dummy bill data for live preview
  const previewBill = useMemo<Bill>(() => ({
    id: 'preview', billNumber: 'AMT-0001', buyerName: 'Sample Customer',
    buyerPhone: '0300-1234567', date: new Date(), subtotal: 15500,
    discount: 500, finalTotal: 15000, notes: '',
    createdAt: new Date(),
  }), []);

  const previewItems = useMemo<BillItem[]>(() => [
    { id: '1', billId: 'preview', partName: 'Engine Oil Filter', partCode: 'EOF-201', brand: 'CAT', quantity: 2, price: 3500, total: 7000 },
    { id: '2', billId: 'preview', partName: 'Hydraulic Pump Seal', partCode: 'HPS-105', brand: 'Komatsu', quantity: 1, price: 8500, total: 8500 },
  ], []);

  // Zoom state for live preview
  const [zoom, setZoom] = useState(0.48);
  const previewContainerRef = useRef<HTMLDivElement>(null);
  const lastTouchDist = useRef<number | null>(null);

  const handleZoomIn = useCallback(() => setZoom(z => Math.min(z + 0.1, 1.2)), []);
  const handleZoomOut = useCallback(() => setZoom(z => Math.max(z - 0.1, 0.25)), []);
  const handleZoomReset = useCallback(() => setZoom(0.48), []);

  // Pinch-to-zoom handler
  useEffect(() => {
    const el = previewContainerRef.current;
    if (!el || !showPreview) return;

    const onTouchMove = (e: TouchEvent) => {
      if (e.touches.length !== 2) { lastTouchDist.current = null; return; }
      const dx = e.touches[0].clientX - e.touches[1].clientX;
      const dy = e.touches[0].clientY - e.touches[1].clientY;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (lastTouchDist.current !== null) {
        const delta = (dist - lastTouchDist.current) * 0.003;
        setZoom(z => Math.min(Math.max(z + delta, 0.25), 1.2));
      }
      lastTouchDist.current = dist;
      e.preventDefault();
    };
    const onTouchEnd = () => { lastTouchDist.current = null; };

    el.addEventListener('touchmove', onTouchMove, { passive: false });
    el.addEventListener('touchend', onTouchEnd);
    return () => { el.removeEventListener('touchmove', onTouchMove); el.removeEventListener('touchend', onTouchEnd); };
  }, [showPreview]);

  useEffect(() => { getBillSettings().then(setSettings); }, []);

  const handleSave = async () => {
    if (!settings) return;
    await updateBillSettings(settings);
    toast({ title: 'Bill Designer settings saved' });
  };

  const handleResetCounter = async () => {
    await resetBillCounter();
    const updated = await getBillSettings();
    setSettings(updated);
    setShowResetDialog(false);
    toast({ title: 'Bill counter reset to 0' });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !settings) return;
    const reader = new FileReader();
    reader.onload = (ev) => { setSettings({ ...settings, logoPath: ev.target?.result as string }); };
    reader.readAsDataURL(file);
  };

  const updatePayment = (field: string, value: string) => {
    if (!settings) return;
    setSettings({ ...settings, paymentInfo: { ...settings.paymentInfo, [field]: value } });
  };

  const updateTerm = (index: number, value: string) => {
    if (!settings) return;
    const terms = [...settings.termsConditions];
    terms[index] = value;
    setSettings({ ...settings, termsConditions: terms });
  };

  const addTerm = () => {
    if (!settings) return;
    setSettings({ ...settings, termsConditions: [...settings.termsConditions, ''] });
  };

  const removeTerm = (index: number) => {
    if (!settings) return;
    setSettings({ ...settings, termsConditions: settings.termsConditions.filter((_, i) => i !== index) });
  };

  if (!settings) return <AppLayout><div className="p-8 text-center text-muted-foreground">Loading...</div></AppLayout>;

  return (
    <AppLayout>
      <Header title="Bill Designer" showBack />
      <div className="p-4 space-y-4 pb-24">
        {/* Shop Info */}
        <Card className="bg-card">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Store className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Shop Information</h3>
            </div>
            <div>
              <Label className="text-xs">Shop Name</Label>
              <Input value={settings.shopName} onChange={e => setSettings({ ...settings, shopName: e.target.value })} className="text-sm" />
            </div>
            <div>
              <Label className="text-xs">Tagline</Label>
              <Input value={settings.tagline} onChange={e => setSettings({ ...settings, tagline: e.target.value })} className="text-sm" />
            </div>
            <div>
              <Label className="text-xs">Owner Name</Label>
              <Input value={settings.ownerName} onChange={e => setSettings({ ...settings, ownerName: e.target.value })} className="text-sm" />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label className="text-xs">Phone 1</Label>
                <Input value={settings.phone1} onChange={e => setSettings({ ...settings, phone1: e.target.value })} className="text-sm" />
              </div>
              <div>
                <Label className="text-xs">Phone 2</Label>
                <Input value={settings.phone2} onChange={e => setSettings({ ...settings, phone2: e.target.value })} className="text-sm" />
              </div>
            </div>
            <div>
              <Label className="text-xs">Address</Label>
              <Textarea value={settings.address} onChange={e => setSettings({ ...settings, address: e.target.value })} rows={2} className="text-sm" />
            </div>
            <div>
              <Label className="text-xs flex items-center gap-1"><Globe className="h-3 w-3" /> Website</Label>
              <Input value={settings.website || ''} onChange={e => setSettings({ ...settings, website: e.target.value })} className="text-sm" placeholder="www.yoursite.com" />
            </div>
            <div>
              <Label className="text-xs flex items-center gap-1"><Globe className="h-3 w-3" /> Social Media</Label>
              <Input value={settings.socialMedia || ''} onChange={e => setSettings({ ...settings, socialMedia: e.target.value })} className="text-sm" placeholder="Facebook / Instagram / WhatsApp link" />
            </div>
            <div>
              <Label className="text-xs">Footer Message</Label>
              <Input value={settings.footerMessage} onChange={e => setSettings({ ...settings, footerMessage: e.target.value })} className="text-sm" placeholder="Thank you for your business" />
            </div>
            <div>
              <Label className="text-xs">Logo</Label>
              <Input type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm" />
              {settings.logoPath && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={settings.logoPath} alt="Logo" className="h-10 w-10 rounded-full object-contain bg-muted" />
                  <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => setSettings({ ...settings, logoPath: null })}>Remove</Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Bill Color Theme */}
        <Card className="bg-card">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center gap-2 mb-1">
              <Palette className="h-4 w-4 text-primary" />
              <h3 className="text-sm font-semibold text-foreground">Bill Color Theme</h3>
            </div>
            <p className="text-xs text-muted-foreground">Choose a premium color palette for your invoices</p>
            <div className="grid grid-cols-1 gap-2">
              {BILL_COLOR_THEMES.map(theme => {
                const isActive = (settings.billColorTheme || 'modern-black-orange') === theme.id;
                return (
                  <button
                    key={theme.id}
                    type="button"
                    onClick={() => setSettings({ ...settings, billColorTheme: theme.id as BillColorThemeId })}
                    className={`flex items-center gap-3 p-3 rounded-lg border text-left transition-all ${
                      isActive
                        ? 'border-primary bg-primary/10 ring-1 ring-primary'
                        : 'border-border hover:border-muted-foreground/30'
                    }`}
                  >
                    {/* Color swatches */}
                    <div className="flex gap-0.5 shrink-0">
                      <div className="w-5 h-8 rounded-l-md" style={{ background: theme.preview.bg }} />
                      <div className="w-5 h-8" style={{ background: theme.preview.accent }} />
                      <div className="w-5 h-8" style={{ background: theme.preview.stripe }} />
                      <div className="w-5 h-8 rounded-r-md border border-border" style={{ background: theme.preview.text }} />
                    </div>
                    <div className="min-w-0">
                      <p className="text-xs font-semibold truncate">{theme.name}</p>
                      <p className="text-[10px] text-muted-foreground leading-tight">{theme.description}</p>
                    </div>
                    {isActive && (
                      <div className="ml-auto shrink-0 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
                          <polyline points="20 6 9 17 4 12" />
                        </svg>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Payment Information */}
        <Card className="bg-card">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CreditCard className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Payment Information</h3>
              </div>
              <Switch checked={settings.showPaymentInfo} onCheckedChange={v => setSettings({ ...settings, showPaymentInfo: v })} />
            </div>
            <p className="text-xs text-muted-foreground">Show payment details on bills by default</p>
            {settings.showPaymentInfo && (
              <div className="space-y-2 pt-2 border-t border-border">
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-[10px]">Bank Name</Label><Input value={settings.paymentInfo.bankName} onChange={e => updatePayment('bankName', e.target.value)} className="text-sm h-8" /></div>
                  <div><Label className="text-[10px]">Account Title</Label><Input value={settings.paymentInfo.accountTitle} onChange={e => updatePayment('accountTitle', e.target.value)} className="text-sm h-8" /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-[10px]">Account Number</Label><Input value={settings.paymentInfo.accountNumber} onChange={e => updatePayment('accountNumber', e.target.value)} className="text-sm h-8" /></div>
                  <div><Label className="text-[10px]">IBAN</Label><Input value={settings.paymentInfo.iban} onChange={e => updatePayment('iban', e.target.value)} className="text-sm h-8" /></div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div><Label className="text-[10px]">EasyPaisa</Label><Input value={settings.paymentInfo.easypaisaNumber} onChange={e => updatePayment('easypaisaNumber', e.target.value)} className="text-sm h-8" /></div>
                  <div><Label className="text-[10px]">JazzCash</Label><Input value={settings.paymentInfo.jazzcashNumber} onChange={e => updatePayment('jazzcashNumber', e.target.value)} className="text-sm h-8" /></div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Terms & Conditions */}
        <Card className="bg-card">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ScrollText className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Terms & Conditions</h3>
              </div>
              <Switch checked={settings.showTerms} onCheckedChange={v => setSettings({ ...settings, showTerms: v })} />
            </div>
            <p className="text-xs text-muted-foreground">Show terms on bills by default</p>
            {settings.showTerms && (
              <div className="space-y-2 pt-2 border-t border-border">
                {settings.termsConditions.map((term, i) => (
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

        {/* Watermark & Background */}
        <Card className="bg-card">
          <CardContent className="p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Droplets className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Watermark & Background</h3>
              </div>
              <Switch checked={settings.watermarkEnabled} onCheckedChange={v => setSettings({ ...settings, watermarkEnabled: v })} />
            </div>
            <p className="text-xs text-muted-foreground">Add a subtle diagonal watermark pattern to the bill body</p>
            {settings.watermarkEnabled && (
              <div className="space-y-3 pt-2 border-t border-border">
                {/* Style selector */}
                <div>
                  <Label className="text-xs mb-2 block">Watermark Style</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {([
                      { value: 'text' as WatermarkStyle, label: 'Text', icon: Type, desc: 'Diagonal text pattern' },
                      { value: 'logo' as WatermarkStyle, label: 'Logo / Initials', icon: Image, desc: 'Repeating logo or initials' },
                      { value: 'border-frame' as WatermarkStyle, label: 'Border Frame', icon: Frame, desc: 'Elegant ornamental border' },
                      { value: 'diagonal-lines' as WatermarkStyle, label: 'Diagonal Lines', icon: StretchHorizontal, desc: 'Gold diagonal line pattern' },
                    ]).map(opt => (
                      <button
                        key={opt.value}
                        type="button"
                        onClick={() => setSettings({ ...settings, watermarkStyle: opt.value })}
                        className={`flex items-start gap-2 p-2.5 rounded-lg border text-left transition-all ${
                          (settings.watermarkStyle || 'text') === opt.value
                            ? 'border-primary bg-primary/10 ring-1 ring-primary'
                            : 'border-border hover:border-muted-foreground/30'
                        }`}
                      >
                        <opt.icon className={`h-4 w-4 mt-0.5 shrink-0 ${(settings.watermarkStyle || 'text') === opt.value ? 'text-primary' : 'text-muted-foreground'}`} />
                        <div>
                          <p className="text-xs font-medium">{opt.label}</p>
                          <p className="text-[10px] text-muted-foreground leading-tight">{opt.desc}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Text input — only for text style */}
                {(settings.watermarkStyle || 'text') === 'text' && (
                  <div>
                    <Label className="text-xs">Watermark Text</Label>
                    <Input
                      value={settings.watermarkText}
                      onChange={e => setSettings({ ...settings, watermarkText: e.target.value })}
                      className="text-sm"
                      placeholder={settings.shopName || 'Shop name used by default'}
                    />
                  </div>
                )}

                <div>
                  <Label className="text-xs">Opacity ({Math.round(settings.watermarkOpacity * 100)}%)</Label>
                  <Slider
                    value={[settings.watermarkOpacity * 100]}
                    onValueChange={([v]) => setSettings({ ...settings, watermarkOpacity: v / 100 })}
                    min={3}
                    max={10}
                    step={1}
                    className="mt-2"
                  />
                  <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                    <span>Subtle</span>
                    <span>Visible</span>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Bill Counter */}
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Bill Counter</p>
                <p className="text-xs text-muted-foreground">Current: AMT-{String(settings.lastBillNumber).padStart(4, '0')}</p>
              </div>
              <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => setShowResetDialog(true)}>
                <RotateCcw className="h-3 w-3" /> Reset
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-2">
          <Button className="flex-1 gap-2" onClick={handleSave}>
            <Save className="h-4 w-4" /> Save Settings
          </Button>
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => setShowPreview(!showPreview)}
          >
            {showPreview ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            {showPreview ? 'Hide' : 'Preview'}
          </Button>
        </div>

        {/* Live Bill Preview */}
        {showPreview && (
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-primary" />
                <h3 className="text-sm font-semibold text-foreground">Live Preview</h3>
                <span className="text-[10px] text-muted-foreground">({Math.round(zoom * 100)}%)</span>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomOut} disabled={zoom <= 0.25}>
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomReset}>
                  <ResetZoom className="h-3.5 w-3.5" />
                </Button>
                <Button variant="ghost" size="icon" className="h-7 w-7" onClick={handleZoomIn} disabled={zoom >= 1.2}>
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
              </div>
            </div>
            <div
              ref={previewContainerRef}
              className="border border-border rounded-lg overflow-auto bg-muted/30 touch-pan-x touch-pan-y"
              style={{ height: '540px', WebkitOverflowScrolling: 'touch' }}
            >
              <div style={{
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                width: '794px',
                minHeight: `${1123 * zoom}px`,
              }}>
                <BillPreviewTemplate
                  settings={settings}
                  bill={previewBill}
                  items={previewItems}
                />
              </div>
            </div>
            <p className="text-[10px] text-muted-foreground text-center">Pinch to zoom on mobile • Scroll to explore</p>
          </div>
        )}
      </div>

      <AlertDialog open={showResetDialog} onOpenChange={setShowResetDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reset Bill Counter?</AlertDialogTitle>
            <AlertDialogDescription>This will reset the bill number counter back to AMT-0001.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleResetCounter}>Reset</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
