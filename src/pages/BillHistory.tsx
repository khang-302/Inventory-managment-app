import { useState, useEffect, useRef, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Plus, Palette, MoreVertical, Image as ImageIcon, FileText, Share2, Trash2, MessageCircle, Pencil } from 'lucide-react';
import { getAllBills, deleteBill, getBillSettings, getBillItems } from '@/services/billService';
import { formatCurrency } from '@/utils/currency';
import { generateBillPdf } from '@/utils/billPdf';
import { captureBillAsImage, downloadDataUrl, getExtension, getMimeType } from '@/utils/billImageExport';
import BillPreviewTemplate from '@/components/bill/BillPreviewTemplate';
import BillSearchFilter from '@/components/bill/BillSearchFilter';
import type { Bill, BillSettings as BillSettingsType, BillItem } from '@/types/bill';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';

export default function BillHistory() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bills, setBills] = useState<Bill[]>([]);
  const [filteredBills, setFilteredBills] = useState<Bill[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const previewRef = useRef<HTMLDivElement>(null);
  const [renderBill, setRenderBill] = useState<{
    settings: BillSettingsType; bill: Bill; items: BillItem[];
  } | null>(null);
  const pendingAction = useRef<'image' | 'share' | 'whatsapp' | null>(null);

  const loadBills = async () => {
    setLoading(true);
    const data = await getAllBills();
    setBills(data);
    setLoading(false);
  };

  useEffect(() => { loadBills(); }, []);

  // Image capture with proper delay
  useEffect(() => {
    if (!renderBill || !pendingAction.current) return;
    const action = pendingAction.current;
    const billData = renderBill;

    const timer = setTimeout(async () => {
      if (!previewRef.current) {
        setRenderBill(null);
        pendingAction.current = null;
        return;
      }
      try {
        const dataUrl = await captureBillAsImage(previewRef.current, 'png');
        if (!dataUrl || dataUrl.length < 1000) throw new Error('Blank image');
        if (action === 'image') {
          downloadDataUrl(dataUrl, `${billData.bill.billNumber}.png`);
          toast({ title: 'Image downloaded' });
        } else if (action === 'share') {
          await shareFile(dataUrl, billData.bill, 'png');
        } else if (action === 'whatsapp') {
          await shareViaWhatsApp(dataUrl, billData.bill);
        }
      } catch (err) {
        console.error('Image export error:', err);
        toast({ title: 'Image export failed', variant: 'destructive' });
      } finally {
        setRenderBill(null);
        pendingAction.current = null;
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [renderBill]);

  const prepareBillData = useCallback(async (bill: Bill) => {
    const [settings, items] = await Promise.all([getBillSettings(), getBillItems(bill.id)]);
    return { settings, bill, items };
  }, []);

  const handleExportImage = async (bill: Bill) => {
    const data = await prepareBillData(bill);
    pendingAction.current = 'image';
    setRenderBill(data);
  };

  const handleExportPdf = async (bill: Bill) => {
    const data = await prepareBillData(bill);
    const pdf = generateBillPdf(data.settings, data.bill, data.items);
    pdf.save(`${data.bill.billNumber}.pdf`);
    toast({ title: 'PDF downloaded' });
  };

  const shareFile = async (dataUrl: string, bill: Bill, format: 'png' | 'pdf') => {
    if (navigator.share) {
      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const ext = format === 'pdf' ? 'pdf' : getExtension(format as 'png');
        const mime = format === 'pdf' ? 'application/pdf' : getMimeType(format as 'png');
        const file = new File([blob], `${bill.billNumber}.${ext}`, { type: mime });
        await navigator.share({ title: `Bill ${bill.billNumber}`, text: `Bill for ${bill.buyerName} – Rs ${bill.finalTotal.toLocaleString()}`, files: [file] });
        return;
      } catch { /* fallback */ }
    }
    const text = `Bill ${bill.billNumber}\nBuyer: ${bill.buyerName}\nTotal: Rs ${bill.finalTotal.toLocaleString()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  const shareViaWhatsApp = async (dataUrl: string, bill: Bill) => {
    const text = `*Bill ${bill.billNumber}*\nCustomer: ${bill.buyerName}\nTotal: *Rs ${bill.finalTotal.toLocaleString()}*\nDate: ${new Date(bill.date).toLocaleDateString('en-PK')}`;
    // On mobile, navigator.share with files will open WhatsApp as an option
    if (navigator.share && navigator.canShare) {
      try {
        const res = await fetch(dataUrl);
        const blob = await res.blob();
        const file = new File([blob], `${bill.billNumber}.png`, { type: 'image/png' });
        if (navigator.canShare({ files: [file] })) {
          // First download the image so user has it, then open WhatsApp
          downloadDataUrl(dataUrl, `${bill.billNumber}.png`);
          // Open WhatsApp with text (user can manually attach the downloaded image)
          setTimeout(() => {
            window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
          }, 500);
          toast({ title: 'Image saved. Share it on WhatsApp!', description: 'Attach the downloaded image in the WhatsApp chat' });
          return;
        }
      } catch { /* fallback */ }
    }
    // Fallback: download image + open WhatsApp with text
    downloadDataUrl(dataUrl, `${bill.billNumber}.png`);
    setTimeout(() => {
      window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
    }, 500);
    toast({ title: 'Image saved. Share it on WhatsApp!', description: 'Attach the downloaded image in the WhatsApp chat' });
  };

  const handleShare = async (bill: Bill) => {
    const data = await prepareBillData(bill);
    pendingAction.current = 'share';
    setRenderBill(data);
  };

  const handleWhatsApp = async (bill: Bill) => {
    const data = await prepareBillData(bill);
    pendingAction.current = 'whatsapp';
    setRenderBill(data);
  };

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteBill(deleteId);
    toast({ title: 'Bill deleted' });
    setDeleteId(null);
    loadBills();
  };

  return (
    <AppLayout>
      <Header title="Bills" showBack />
      <div className="p-4 space-y-4">
        {/* Two-button header */}
        <div className="flex gap-3">
          <Button className="flex-1 gap-2" onClick={() => navigate('/bills/create')}>
            <Plus className="h-4 w-4" /> Create New Bill
          </Button>
          <Button variant="outline" className="flex-1 gap-2" onClick={() => navigate('/bills/settings')}>
            <Palette className="h-4 w-4" /> Bill Designer
          </Button>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground text-sm py-8">Loading...</div>
        ) : bills.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">No bills yet</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Create your first bill to get started</p>
          </div>
        ) : (
          <>
            <BillSearchFilter bills={bills} onFiltered={setFilteredBills} />
            {filteredBills.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-muted-foreground text-sm">No bills match your search</p>
              </div>
            ) : (
              <div className="space-y-2">
                {filteredBills.map(bill => (
              <Card key={bill.id} className="bg-card">
                <CardContent className="p-3">
                  <div className="flex items-center justify-between">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-mono text-primary">{bill.billNumber}</span>
                        <span className="text-xs text-muted-foreground">{new Date(bill.date).toLocaleDateString('en-PK')}</span>
                      </div>
                      <p className="text-sm font-medium mt-0.5 truncate">{bill.buyerName}</p>
                      <p className="text-xs text-muted-foreground">{formatCurrency(bill.finalTotal)}</p>
                    </div>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0"><MoreVertical className="h-4 w-4" /></Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => navigate(`/bills/edit/${bill.id}`)}><Pencil className="h-4 w-4 mr-2" /> Edit</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportImage(bill)}><ImageIcon className="h-4 w-4 mr-2" /> Export as Image</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportPdf(bill)}><FileText className="h-4 w-4 mr-2" /> Export as PDF</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare(bill)}><Share2 className="h-4 w-4 mr-2" /> Share</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleWhatsApp(bill)}><MessageCircle className="h-4 w-4 mr-2" /> WhatsApp</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(bill.id)}><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex gap-2 mt-2 pt-2 border-t border-border">
                    <Button variant="outline" size="sm" className="flex-1 h-7 text-xs gap-1" onClick={() => handleExportImage(bill)}><ImageIcon className="h-3 w-3" /> Image</Button>
                    <Button variant="outline" size="sm" className="flex-1 h-7 text-xs gap-1" onClick={() => handleExportPdf(bill)}><FileText className="h-3 w-3" /> PDF</Button>
                    <Button size="sm" className="flex-1 h-7 text-xs gap-1 bg-[#25D366] hover:bg-[#1DA851] text-white" onClick={() => handleWhatsApp(bill)}><MessageCircle className="h-3 w-3" /> WhatsApp</Button>
                  </div>
                </CardContent>
              </Card>
            ))}
              </div>
            )}
          </>
        )}
      </div>

      {/* Offscreen template for image capture — visible but off-viewport for rendering */}
      {renderBill && (
        <div
          style={{
            position: 'absolute',
            left: '-9999px',
            top: '0',
            width: '794px',
            background: '#ffffff',
            zIndex: -1,
          }}
          aria-hidden="true"
        >
          <BillPreviewTemplate
            ref={previewRef}
            settings={renderBill.settings}
            bill={renderBill.bill}
            items={renderBill.items}
          />
        </div>
      )}

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bill?</AlertDialogTitle>
            <AlertDialogDescription>This action cannot be undone.</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground">Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
