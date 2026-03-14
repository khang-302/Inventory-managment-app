import { useState, useEffect, useRef, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { FilePlus2, SwatchBook, MoreVertical, Camera, FileText, Share2, Trash2, MessageCircleMore, Pencil } from 'lucide-react';
import { getAllBills, deleteBill, getBillSettings, getBillItems } from '@/services/billService';
import { formatCurrency } from '@/utils/currency';
import { generateBillPdf } from '@/utils/billPdf';
import { captureBillAsImage } from '@/utils/billImageExport';
import { saveImageToGallery, savePdfToDevice, shareViaWhatsAppNative, saveFile, type SaveResult } from '@/utils/nativeShare';
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
        const filename = `AIM_Bill_${billData.bill.billNumber}.png`;
        if (action === 'image') {
          const result = await saveImageToGallery(dataUrl, filename);
          toast({
            title: '✅ Image saved',
            description: result.path ? `Saved to: ${result.path}\n📂 Open your file manager → AIM/Bills` : `File: ${filename}`,
          });
        } else if (action === 'share') {
          await saveFile(dataUrl, filename, 'image/png');
          toast({ title: '📤 Share sheet opened' });
        } else if (action === 'whatsapp') {
          const result = await shareViaWhatsAppNative(dataUrl, filename);
          if (result === 'fallback') {
            toast({ title: 'Image saved', description: 'Open WhatsApp and attach the downloaded image manually.' });
          }
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
    const pdfBlob = pdf.output('blob');
    const filename = `AIM_Bill_${data.bill.billNumber}.pdf`;
    const result = await savePdfToDevice(pdfBlob, filename);
    toast({
      title: '✅ PDF saved',
      description: result.path ? `Saved to: ${result.path}\n📂 Open your file manager → AIM/Bills` : `File: ${filename}`,
    });
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
            <FilePlus2 className="h-4 w-4" /> Create New Bill
          </Button>
          <Button variant="outline" className="flex-1 gap-2" onClick={() => navigate('/bills/settings')}>
            <SwatchBook className="h-4 w-4" /> Bill Designer
          </Button>
        </div>

        {loading ? (
          <div className="text-center text-muted-foreground text-sm py-8">Loading...</div>
        ) : bills.length === 0 ? (
          <div className="text-center py-12">
            <div className="h-20 w-20 rounded-2xl bg-muted/50 flex items-center justify-center mx-auto mb-4">
              <FileText className="h-10 w-10 text-muted-foreground/40" />
            </div>
            <p className="text-muted-foreground text-sm font-medium">No bills yet</p>
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
                        <DropdownMenuItem onClick={() => handleExportImage(bill)}><Camera className="h-4 w-4 mr-2" /> Export as Image</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleExportPdf(bill)}><FileText className="h-4 w-4 mr-2" /> Export as PDF</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleShare(bill)}><Share2 className="h-4 w-4 mr-2" /> Share</DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleWhatsApp(bill)}><MessageCircleMore className="h-4 w-4 mr-2" /> WhatsApp</DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(bill.id)}><Trash2 className="h-4 w-4 mr-2" /> Delete</DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                  <div className="flex gap-2 mt-2 pt-2 border-t border-border">
                    <Button variant="outline" size="sm" className="flex-1 h-7 text-xs gap-1" onClick={() => handleExportImage(bill)}><Camera className="h-3 w-3" /> Image</Button>
                    <Button variant="outline" size="sm" className="flex-1 h-7 text-xs gap-1" onClick={() => handleExportPdf(bill)}><FileText className="h-3 w-3" /> PDF</Button>
                    <Button size="sm" className="flex-1 h-7 text-xs gap-1 bg-[#25D366] hover:bg-[#1DA851] text-white" onClick={() => handleWhatsApp(bill)}><MessageCircleMore className="h-3 w-3" /> WhatsApp</Button>
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
