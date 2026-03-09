import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
  AlertDialogAction,
} from '@/components/ui/alert-dialog';
import { Button } from '@/components/ui/button';
import { Mail, Eye, X } from 'lucide-react';
import {
  getLastPendingCrash,
  clearPendingCrash,
  getCrashReport,
  getEmailMailtoUrl,
} from '@/services/crashReportService';

export function CrashRecoveryPrompt() {
  const navigate = useNavigate();
  const [open, setOpen] = useState(false);
  const [pendingId, setPendingId] = useState<string | null>(null);

  useEffect(() => {
    const id = getLastPendingCrash();
    if (id) {
      setPendingId(id);
      setOpen(true);
    }
  }, []);

  const handleSendReport = async () => {
    if (!pendingId) return;
    const report = await getCrashReport(pendingId);
    if (report) {
      window.open(getEmailMailtoUrl(report), '_blank');
    }
    clearPendingCrash();
    setOpen(false);
  };

  const handleViewDetails = () => {
    clearPendingCrash();
    setOpen(false);
    navigate('/settings/crash-logs');
  };

  const handleIgnore = () => {
    clearPendingCrash();
    setOpen(false);
  };

  if (!open) return null;

  return (
    <AlertDialog open={open} onOpenChange={setOpen}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>The app encountered an error earlier</AlertDialogTitle>
          <AlertDialogDescription>
            A crash was detected during your last session. You can send the error details to the developer to help fix the issue.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
          <Button onClick={handleSendReport} className="w-full">
            <Mail className="h-4 w-4 mr-1.5" />
            Send Error Report
          </Button>
          <Button variant="outline" onClick={handleViewDetails} className="w-full">
            <Eye className="h-4 w-4 mr-1.5" />
            View Error Details
          </Button>
          <Button variant="ghost" onClick={handleIgnore} className="w-full text-muted-foreground">
            <X className="h-4 w-4 mr-1.5" />
            Ignore
          </Button>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}
