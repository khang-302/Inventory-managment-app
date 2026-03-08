import { useState, useEffect } from 'react';
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
import { Save, RotateCcw, Plus, Trash2, CreditCard, ScrollText, Store, Globe, Droplets } from 'lucide-react';
import { getBillSettings, updateBillSettings, resetBillCounter } from '@/services/billService';
import type { BillSettings } from '@/types/bill';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function BillSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<BillSettings | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);

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
                <div>
                  <Label className="text-xs">Watermark Text</Label>
                  <Input
                    value={settings.watermarkText}
                    onChange={e => setSettings({ ...settings, watermarkText: e.target.value })}
                    className="text-sm"
                    placeholder={settings.shopName || 'Shop name used by default'}
                  />
                </div>
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

        <Button className="w-full gap-2" onClick={handleSave}>
          <Save className="h-4 w-4" /> Save Settings
        </Button>
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
