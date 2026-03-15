import { useState, useEffect, useCallback } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
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
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import {
  FileText,
  FileImage,
  FileSpreadsheet,
  File,
  Share2,
  Trash2,
  ChevronDown,
  FolderOpen,
  Smartphone,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import {
  listExportedFiles,
  deleteExportedFile,
  deleteAllExportedFiles,
  shareExportedFile,
  formatFileSize,
  SUBFOLDERS,
  type ExportedFile,
  type ExportSubfolder,
} from '@/utils/exportedFilesService';

function getFileIcon(name: string) {
  const ext = name.split('.').pop()?.toLowerCase();
  switch (ext) {
    case 'json':
      return <FileText className="h-5 w-5 text-amber-500" />;
    case 'pdf':
      return <FileText className="h-5 w-5 text-red-500" />;
    case 'png':
    case 'jpg':
    case 'jpeg':
      return <FileImage className="h-5 w-5 text-blue-500" />;
    case 'xlsx':
    case 'csv':
      return <FileSpreadsheet className="h-5 w-5 text-emerald-500" />;
    default:
      return <File className="h-5 w-5 text-muted-foreground" />;
  }
}

const SUBFOLDER_ICONS: Record<ExportSubfolder, { bg: string; color: string }> = {
  Backups: { bg: 'bg-emerald-500/10', color: 'text-emerald-500' },
  Reports: { bg: 'bg-blue-500/10', color: 'text-blue-500' },
  Images: { bg: 'bg-purple-500/10', color: 'text-purple-500' },
  Exports: { bg: 'bg-amber-500/10', color: 'text-amber-500' },
};

export default function ExportedFiles() {
  const [files, setFiles] = useState<ExportedFile[]>([]);
  const [loading, setLoading] = useState(true);
  const [isNative, setIsNative] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<ExportedFile | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    Backups: true,
    Reports: true,
    Images: true,
    Exports: true,
  });

  const loadFiles = useCallback(async () => {
    setLoading(true);
    try {
      const result = await listExportedFiles();
      setFiles(result);
    } catch {
      toast.error('Failed to load files');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    const native = !!(window as any).Capacitor?.isNativePlatform?.();
    setIsNative(native);
    if (native) {
      loadFiles();
    } else {
      setLoading(false);
    }
  }, [loadFiles]);

  const handleShare = async (file: ExportedFile) => {
    try {
      await shareExportedFile(file.subfolder, file.name);
    } catch {
      toast.error('Failed to share file');
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await deleteExportedFile(deleteTarget.subfolder, deleteTarget.name);
      setFiles((prev) => prev.filter((f) => !(f.subfolder === deleteTarget.subfolder && f.name === deleteTarget.name)));
      toast.success('File deleted');
    } catch {
      toast.error('Failed to delete file');
    } finally {
      setDeleteTarget(null);
    }
  };

  const grouped = SUBFOLDERS.reduce(
    (acc, sub) => {
      acc[sub] = files.filter((f) => f.subfolder === sub);
      return acc;
    },
    {} as Record<ExportSubfolder, ExportedFile[]>
  );

  const totalFiles = files.length;

  return (
    <AppLayout>
      <Header
        title="Exported Files"
        showBack
        rightAction={
          isNative ? (
            <Button variant="ghost" size="icon" onClick={loadFiles}>
              <RefreshCw className="h-4 w-4" />
            </Button>
          ) : undefined
        }
      />

      <div className="p-4 space-y-4">
        {/* Web fallback */}
        {!isNative && !loading && (
          <Card className="border-dashed">
            <CardContent className="p-8 flex flex-col items-center text-center gap-3">
              <Smartphone className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="font-semibold">Mobile Only Feature</p>
                <p className="text-sm text-muted-foreground mt-1">
                  File management is available on the mobile app. Export files will be saved to Documents/AmeerAutos/ on your device.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Loading */}
        {loading && (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <Skeleton key={i} className="h-20 w-full rounded-xl" />
            ))}
          </div>
        )}

        {/* Empty state */}
        {isNative && !loading && totalFiles === 0 && (
          <Card className="border-dashed">
            <CardContent className="p-8 flex flex-col items-center text-center gap-3">
              <FolderOpen className="h-12 w-12 text-muted-foreground" />
              <div>
                <p className="font-semibold">No Exported Files</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Files you export (backups, reports, bills) will appear here.
                </p>
              </div>
            </CardContent>
          </Card>
        )}

        {/* File list grouped by subfolder */}
        {isNative && !loading && totalFiles > 0 && (
          <>
            <p className="text-sm text-muted-foreground">
              {totalFiles} file{totalFiles !== 1 ? 's' : ''} in Documents/AmeerAutos/
            </p>

            {SUBFOLDERS.map((sub) => {
              const subFiles = grouped[sub];
              if (subFiles.length === 0) return null;
              const style = SUBFOLDER_ICONS[sub];

              return (
                <Collapsible
                  key={sub}
                  open={openSections[sub]}
                  onOpenChange={(open) => setOpenSections((prev) => ({ ...prev, [sub]: open }))}
                >
                  <Card className="overflow-hidden">
                    <CollapsibleTrigger className="w-full">
                      <div className="flex items-center gap-3 p-4 hover:bg-muted/50 transition-colors">
                        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${style.bg}`}>
                          <FolderOpen className={`h-4 w-4 ${style.color}`} />
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-sm">{sub}</p>
                          <p className="text-xs text-muted-foreground">{subFiles.length} file{subFiles.length !== 1 ? 's' : ''}</p>
                        </div>
                        <ChevronDown className={`h-4 w-4 text-muted-foreground transition-transform ${openSections[sub] ? 'rotate-180' : ''}`} />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="divide-y divide-border">
                        {subFiles.map((file) => (
                          <div key={`${file.subfolder}-${file.name}`} className="p-4 space-y-2">
                            <div className="flex items-start gap-3">
                              {getFileIcon(file.name)}
                              <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium truncate">{file.name}</p>
                                <p className="text-xs text-muted-foreground">
                                  {formatFileSize(file.size)}
                                  {file.modifiedAt ? ` · ${new Date(file.modifiedAt).toLocaleDateString()}` : ''}
                                </p>
                              </div>
                            </div>
                            <div className="flex gap-2 justify-end">
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8"
                                onClick={() => handleShare(file)}
                              >
                                <Share2 className="h-3.5 w-3.5 mr-1.5" />
                                Share
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                className="h-8 text-destructive hover:text-destructive"
                                onClick={() => setDeleteTarget(file)}
                              >
                                <Trash2 className="h-3.5 w-3.5 mr-1.5" />
                                Delete
                              </Button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              );
            })}
          </>
        )}
      </div>

      {/* Delete confirmation */}
      <AlertDialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete File</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete "{deleteTarget?.name}"? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-destructive text-destructive-foreground hover:bg-destructive/90">
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </AppLayout>
  );
}
