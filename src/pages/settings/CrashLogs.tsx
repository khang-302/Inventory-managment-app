import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from '@/components/ui/alert-dialog';
import { Bug, Trash2, Mail, ChevronDown, ChevronUp, ShieldAlert, Inbox } from 'lucide-react';
import { format } from 'date-fns';
import type { CrashReport } from '@/types/crashReport';
import {
  getCrashReports,
  deleteCrashReport,
  clearAllCrashReports,
  getEmailMailtoUrl,
  markReportRead,
} from '@/services/crashReportService';
import { toast } from 'sonner';

export default function CrashLogs() {
  const navigate = useNavigate();
  const [reports, setReports] = useState<CrashReport[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [userNotes, setUserNotes] = useState<Record<string, string>>({});

  const loadReports = async () => {
    const data = await getCrashReports();
    setReports(data);
  };

  useEffect(() => {
    loadReports();
  }, []);

  const handleToggle = async (id: string) => {
    if (expandedId === id) {
      setExpandedId(null);
    } else {
      setExpandedId(id);
      await markReportRead(id);
      setReports((prev) => prev.map((r) => (r.id === id ? { ...r, isRead: true } : r)));
    }
  };

  const handleDelete = async (id: string) => {
    await deleteCrashReport(id);
    setReports((prev) => prev.filter((r) => r.id !== id));
    toast.success('Error log deleted');
  };

  const handleClearAll = async () => {
    await clearAllCrashReports();
    setReports([]);
    toast.success('All error logs cleared');
  };

  const handleSendReport = (report: CrashReport) => {
    const url = getEmailMailtoUrl(report, userNotes[report.id]);
    window.open(url, '_blank');
  };

  return (
    <AppLayout>
      <Header title="Error Logs" showBack onBack={() => navigate('/settings')} />

      <div className="p-4 space-y-4">
        {/* Header actions */}
        {reports.length > 0 && (
          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">
              {reports.length} error{reports.length !== 1 ? 's' : ''} logged
            </p>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-destructive">
                  <Trash2 className="h-4 w-4 mr-1.5" />
                  Clear All
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Clear all error logs?</AlertDialogTitle>
                  <AlertDialogDescription>
                    This will permanently delete all saved error logs. This cannot be undone.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={handleClearAll}>Clear All</AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        )}

        {/* Error list */}
        {reports.length === 0 ? (
          <Card>
            <CardContent className="py-16 flex flex-col items-center text-center gap-3">
              <div className="h-14 w-14 rounded-2xl bg-muted flex items-center justify-center">
                <Inbox className="h-7 w-7 text-muted-foreground" />
              </div>
              <h3 className="font-semibold text-lg">No Error Logs</h3>
              <p className="text-sm text-muted-foreground max-w-xs">
                The app hasn't recorded any errors. That's great!
              </p>
            </CardContent>
          </Card>
        ) : (
          reports.map((report) => {
            const isExpanded = expandedId === report.id;
            return (
              <Card key={report.id} className="overflow-hidden">
                <CardContent className="p-0">
                  {/* Summary row */}
                  <div
                    className="flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors"
                    onClick={() => handleToggle(report.id)}
                  >
                    <div className="h-10 w-10 rounded-xl bg-destructive/10 flex items-center justify-center shrink-0">
                      <Bug className="h-5 w-5 text-destructive" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className="font-mono text-sm font-semibold truncate">{report.errorCode}</p>
                        {!report.isRead && (
                          <Badge variant="destructive" className="text-[10px] px-1.5 py-0">NEW</Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {format(new Date(report.createdAt), 'dd MMM yyyy · HH:mm')} · {report.currentScreen}
                      </p>
                    </div>
                    {isExpanded ? (
                      <ChevronUp className="h-5 w-5 text-muted-foreground shrink-0" />
                    ) : (
                      <ChevronDown className="h-5 w-5 text-muted-foreground shrink-0" />
                    )}
                  </div>

                  {/* Expanded details */}
                  {isExpanded && (
                    <div className="border-t border-border p-4 space-y-4 bg-muted/20">
                      <div className="space-y-2">
                        <DetailRow label="Error Type" value={report.errorType} />
                        <DetailRow label="Screen" value={report.currentScreen} />
                        <DetailRow label="Action" value={report.lastAction} />
                        <DetailRow label="Device" value={report.deviceModel} />
                        <DetailRow label="Resolution" value={report.screenResolution} />
                        <DetailRow label="App Version" value={report.appVersion} />
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Error Message</p>
                        <pre className="text-xs bg-background rounded-lg p-3 overflow-x-auto whitespace-pre-wrap border border-border">
                          {report.errorMessage}
                        </pre>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">Stack Trace</p>
                        <pre className="text-xs bg-background rounded-lg p-3 overflow-x-auto whitespace-pre-wrap border border-border max-h-40 overflow-y-auto">
                          {report.stackTrace}
                        </pre>
                      </div>

                      <div>
                        <p className="text-xs font-semibold text-muted-foreground mb-1">
                          Add a note (optional)
                        </p>
                        <Textarea
                          placeholder="Describe what you were doing..."
                          value={userNotes[report.id] || ''}
                          onChange={(e) =>
                            setUserNotes((prev) => ({ ...prev, [report.id]: e.target.value }))
                          }
                          className="text-sm"
                          rows={2}
                        />
                      </div>

                      <div className="flex gap-2">
                        <Button
                          className="flex-1"
                          onClick={() => handleSendReport(report)}
                        >
                          <Mail className="h-4 w-4 mr-1.5" />
                          Send Error Report
                        </Button>
                        <Button
                          variant="outline"
                          size="icon"
                          className="text-destructive"
                          onClick={() => handleDelete(report.id)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </AppLayout>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start gap-2">
      <span className="text-xs font-medium text-muted-foreground w-24 shrink-0">{label}</span>
      <span className="text-xs">{value}</span>
    </div>
  );
}
