import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { Plus, MoreVertical, Eye, Share2, Trash2, FileText } from 'lucide-react';
import { getAllBills, deleteBill, getBillSettings, getBillItems } from '@/services/billService';
import { formatCurrency } from '@/utils/currency';
import { generateBillPdf } from '@/utils/billPdf';
import type { Bill } from '@/types/bill';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
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

export default function BillHistory() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [bills, setBills] = useState<Bill[]>([]);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  const loadBills = async () => {
    setLoading(true);
    const data = await getAllBills();
    setBills(data);
    setLoading(false);
  };

  useEffect(() => { loadBills(); }, []);

  const handleDelete = async () => {
    if (!deleteId) return;
    await deleteBill(deleteId);
    toast({ title: 'Bill deleted' });
    setDeleteId(null);
    loadBills();
  };

  const handleDownloadPdf = async (bill: Bill) => {
    const settings = await getBillSettings();
    const items = await getBillItems(bill.id);
    const pdf = generateBillPdf(settings, bill, items);
    pdf.save(`${bill.billNumber}.pdf`);
    toast({ title: 'PDF downloaded' });
  };

  const handleShare = async (bill: Bill) => {
    const settings = await getBillSettings();
    const items = await getBillItems(bill.id);

    // Try native share first
    if (navigator.share) {
      try {
        const pdf = generateBillPdf(settings, bill, items);
        const blob = pdf.output('blob');
        const file = new File([blob], `${bill.billNumber}.pdf`, { type: 'application/pdf' });
        await navigator.share({
          title: `Bill ${bill.billNumber}`,
          text: `Bill for ${bill.buyerName} – Rs ${bill.finalTotal.toLocaleString()}`,
          files: [file],
        });
        return;
      } catch {
        // fallback below
      }
    }

    // WhatsApp fallback
    const text = `Bill ${bill.billNumber}\nBuyer: ${bill.buyerName}\nTotal: Rs ${bill.finalTotal.toLocaleString()}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(text)}`, '_blank');
  };

  return (
    <AppLayout>
      <Header title="Bill History" showBack />
      <div className="p-4 space-y-4">
        <Button className="w-full gap-2" onClick={() => navigate('/bills/create')}>
          <Plus className="h-4 w-4" /> Create New Bill
        </Button>

        {loading ? (
          <div className="text-center text-muted-foreground text-sm py-8">Loading...</div>
        ) : bills.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground text-sm">No bills yet</p>
            <p className="text-muted-foreground/60 text-xs mt-1">Create your first bill to get started</p>
          </div>
        ) : (
          <div className="space-y-2">
            {bills.map(bill => (
              <Card key={bill.id} className="bg-card">
                <CardContent className="p-3 flex items-center justify-between">
                  <div className="min-w-0 flex-1" onClick={() => handleDownloadPdf(bill)} role="button">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono text-primary">{bill.billNumber}</span>
                      <span className="text-xs text-muted-foreground">
                        {new Date(bill.date).toLocaleDateString('en-PK')}
                      </span>
                    </div>
                    <p className="text-sm font-medium mt-0.5 truncate">{bill.buyerName}</p>
                    <p className="text-xs text-muted-foreground">{formatCurrency(bill.finalTotal)}</p>
                  </div>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="icon" className="h-8 w-8 shrink-0">
                        <MoreVertical className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem onClick={() => handleDownloadPdf(bill)}>
                        <Eye className="h-4 w-4 mr-2" /> View / Download
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleShare(bill)}>
                        <Share2 className="h-4 w-4 mr-2" /> Share
                      </DropdownMenuItem>
                      <DropdownMenuItem className="text-destructive" onClick={() => setDeleteId(bill.id)}>
                        <Trash2 className="h-4 w-4 mr-2" /> Delete
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <AlertDialog open={!!deleteId} onOpenChange={() => setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Bill?</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this bill? This action cannot be undone.
            </AlertDialogDescription>
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
