import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Save, RotateCcw } from 'lucide-react';
import { getBillSettings, updateBillSettings, resetBillCounter } from '@/services/billService';
import type { BillSettings } from '@/types/bill';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function BillSettingsPage() {
  const { toast } = useToast();
  const [settings, setSettings] = useState<BillSettings | null>(null);
  const [showResetDialog, setShowResetDialog] = useState(false);

  useEffect(() => {
    getBillSettings().then(setSettings);
  }, []);

  const handleSave = async () => {
    if (!settings) return;
    await updateBillSettings(settings);
    toast({ title: 'Bill settings saved' });
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
    reader.onload = (ev) => {
      setSettings({ ...settings, logoPath: ev.target?.result as string });
    };
    reader.readAsDataURL(file);
  };

  if (!settings) return <AppLayout><div className="p-8 text-center text-muted-foreground">Loading...</div></AppLayout>;

  return (
    <AppLayout>
      <Header title="Bill Settings" showBack />
      <div className="p-4 space-y-4 pb-24">
        <Card className="bg-card">
          <CardContent className="p-4 space-y-3">
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
              <Label className="text-xs">Footer Message</Label>
              <Input value={settings.footerMessage} onChange={e => setSettings({ ...settings, footerMessage: e.target.value })} className="text-sm" placeholder="Thank you for your business" />
            </div>
            <div>
              <Label className="text-xs">Logo</Label>
              <Input type="file" accept="image/*" onChange={handleLogoUpload} className="text-sm" />
              {settings.logoPath && (
                <div className="mt-2 flex items-center gap-2">
                  <img src={settings.logoPath} alt="Logo" className="h-10 w-10 rounded object-contain bg-muted" />
                  <Button variant="ghost" size="sm" className="text-xs text-destructive" onClick={() => setSettings({ ...settings, logoPath: null })}>
                    Remove
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

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
            <AlertDialogDescription>
              This will reset the bill number counter back to AMT-0001. Existing bills won't be affected.
            </AlertDialogDescription>
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
