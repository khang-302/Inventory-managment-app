import { useNavigate } from 'react-router-dom';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle } from '@/components/ui/drawer';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import { CheckCircle2, Eye, Share2 } from 'lucide-react';
import { toast } from 'sonner';
import { getBillSettings, getBillItems, getBillById } from '@/services/billService';
import { captureBillAsImage } from '@/utils/billImageExport';
import { saveImageToGallery, shareViaWhatsAppNative } from '@/utils/nativeShare';
import { useState, useRef } from 'react';
import BillPreviewTemplate from '@/components/bill/BillPreviewTemplate';
import type { BillSettings as BillSettingsType } from '@/types/bill';
import type { Bill, BillItem } from '@/types/bill';

interface SaleSuccessDialogProps {
  open: boolean;
  billId: string;
  billNumber: string;
  onClose: () => void;
}

export function SaleSuccessDialog({ open, billId, billNumber, onClose }: SaleSuccessDialogProps) {
  const isMobile = useIsMobile();
  const navigate = useNavigate();
  const [isSharing, setIsSharing] = useState(false);
  const [renderData, setRenderData] = useState<{ settings: BillSettingsType; bill: Bill; items: BillItem[] } | null>(null);
  const previewRef = useRef<HTMLDivElement>(null);

  const handleViewBill = () => {
    onClose();
    navigate(`/bills/edit/${billId}`);
  };

  const handleShare = async () => {
    setIsSharing(true);
    try {
      const [settings, bill, items] = await Promise.all([
        getBillSettings(),
        getBillById(billId),
        getBillItems(billId),
      ]);
      if (!bill) { toast.error('Bill not found'); return; }
      setRenderData({ settings, bill, items });
      // Wait for render
      setTimeout(async () => {
        try {
          if (!previewRef.current) { toast.error('Could not capture bill'); return; }
          const dataUrl = await captureBillAsImage(previewRef.current);
          const filename = `Bill-${billNumber}.png`;
          await saveImageToGallery(dataUrl, filename);
          toast.success('Bill image saved!');
        } catch {
          toast.error('Failed to share bill');
        } finally {
          setRenderData(null);
          setIsSharing(false);
        }
      }, 1200);
    } catch {
      toast.error('Failed to share bill');
      setIsSharing(false);
    }
  };

  const content = (
    <div className="flex flex-col items-center text-center space-y-4 py-4">
      <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
        <CheckCircle2 className="h-8 w-8 text-primary" />
      </div>
      <div>
        <h3 className="text-lg font-semibold">Sale Completed Successfully</h3>
        <p className="text-sm text-muted-foreground mt-1">Bill <span className="font-medium text-foreground">{billNumber}</span> Created</p>
      </div>
      <div className="flex flex-col gap-2 w-full pt-2">
        <Button onClick={handleViewBill} className="w-full">
          <Eye className="h-4 w-4 mr-2" />
          View Bill
        </Button>
        <Button variant="outline" onClick={handleShare} disabled={isSharing} className="w-full">
          <Share2 className="h-4 w-4 mr-2" />
          {isSharing ? 'Preparing...' : 'Share Bill'}
        </Button>
        <Button variant="ghost" onClick={onClose} className="w-full">
          Done
        </Button>
      </div>

      {/* Offscreen bill render for image capture */}
      {renderData && (
        <div className="fixed left-[-9999px] top-0" style={{ width: 800 }}>
          <BillPreviewTemplate
            ref={previewRef}
            settings={renderData.settings}
            bill={renderData.bill}
            items={renderData.items}
          />
        </div>
      )}
    </div>
  );

  if (isMobile) {
    return (
      <Drawer open={open} onOpenChange={(o) => !o && onClose()}>
        <DrawerContent>
          <DrawerHeader>
            <DrawerTitle className="sr-only">Sale Complete</DrawerTitle>
          </DrawerHeader>
          <div className="px-4 pb-6">{content}</div>
        </DrawerContent>
      </Drawer>
    );
  }

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">Sale Complete</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
}
