import { useState, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { exportDatabase, importDatabase, db } from '@/db/database';
import { logActivity } from '@/services/activityLogService';
import { toast } from 'sonner';
import { saveToDevice } from '@/utils/nativeShare';
import { openFileManager } from '@/utils/fileManagerLauncher';
import { 
  Download, 
  Upload, 
  FileJson, 
  FileSpreadsheet, 
  FileText,
  Database,
  AlertTriangle,
  Check,
  Loader2
} from 'lucide-react';
import * as XLSX from 'xlsx';
import { validateBackupFile, safeJsonParse } from '@/utils/backupValidation';

export default function BackupRestore() {
  const [isExporting, setIsExporting] = useState<string | null>(null);
  const [isRestoring, setIsRestoring] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const generateFilename = (extension: string) => {
    const date = new Date().toISOString().split('T')[0];
    return `ameer-autos-backup-${date}.${extension}`;
  };

  const handleExportJSON = async () => {
    setIsExporting('json');
    try {
      const data = await exportDatabase();
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const result = await saveToDevice(blob, 'Backups', generateFilename('json'));
      
      await logActivity({
        action: 'backup',
        entityType: 'backup',
        description: 'Created JSON backup'
      });
      toast.success(result.path ? `Backup saved to ${result.path}` : 'JSON backup created successfully', { description: '📂 Documents/AmeerAutos/', action: { label: '📂 Open Folder', onClick: () => openFileManager() } });
    } catch (error) {
      toast.error('Failed to create backup');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportExcel = async () => {
    setIsExporting('xlsx');
    try {
      const [parts, brands, categories, sales] = await Promise.all([
        db.parts.toArray(),
        db.brands.toArray(),
        db.categories.toArray(),
        db.sales.toArray(),
      ]);

      const workbook = XLSX.utils.book_new();

      // Parts sheet
      const partsData = parts.map(p => ({
        Name: p.name,
        SKU: p.sku,
        'Brand ID': p.brandId,
        'Category ID': p.categoryId,
        Quantity: p.quantity,
        'Buying Price (Rs)': p.buyingPrice,
        'Selling Price (Rs)': p.sellingPrice,
        Location: p.location,
        Notes: p.notes,
        'Created At': new Date(p.createdAt).toLocaleString(),
      }));
      const partsSheet = XLSX.utils.json_to_sheet(partsData);
      XLSX.utils.book_append_sheet(workbook, partsSheet, 'Parts');

      // Sales sheet
      const salesData = sales.map(s => ({
        'Part Name': s.partName,
        Quantity: s.quantity,
        'Unit Price (Rs)': s.unitPrice,
        'Total Amount (Rs)': s.totalAmount,
        'Profit (Rs)': s.profit,
        'Customer Name': s.customerName || '',
        'Customer Phone': s.customerPhone || '',
        'Date': new Date(s.createdAt).toLocaleString(),
      }));
      const salesSheet = XLSX.utils.json_to_sheet(salesData);
      XLSX.utils.book_append_sheet(workbook, salesSheet, 'Sales');

      // Brands sheet
      const brandsSheet = XLSX.utils.json_to_sheet(brands.map(b => ({
        Name: b.name,
        'Created At': new Date(b.createdAt).toLocaleString(),
      })));
      XLSX.utils.book_append_sheet(workbook, brandsSheet, 'Brands');

      // Categories sheet
      const categoriesSheet = XLSX.utils.json_to_sheet(categories.map(c => ({
        Name: c.name,
        'Created At': new Date(c.createdAt).toLocaleString(),
      })));
      XLSX.utils.book_append_sheet(workbook, categoriesSheet, 'Categories');

      const buffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const result = await saveToDevice(blob, 'Backups', generateFilename('xlsx'));

      await logActivity({
        action: 'backup',
        entityType: 'backup',
        description: 'Created Excel backup'
      });
      toast.success(result.path ? `Backup saved to ${result.path}` : 'Excel backup created successfully', { description: '📂 Documents/AmeerAutos/', action: { label: '📂 Open Folder', onClick: () => openFileManager() } });
    } catch (error) {
      toast.error('Failed to create backup');
    } finally {
      setIsExporting(null);
    }
  };

  const handleExportCSV = async () => {
    setIsExporting('csv');
    try {
      const parts = await db.parts.toArray();
      
      const headers = ['Name', 'SKU', 'Brand ID', 'Category ID', 'Quantity', 'Buying Price (Rs)', 'Selling Price (Rs)', 'Location', 'Notes'];
      const rows = parts.map(p => [
        p.name,
        p.sku,
        p.brandId,
        p.categoryId,
        p.quantity,
        p.buyingPrice,
        p.sellingPrice,
        p.location,
        p.notes?.replace(/,/g, ';') || '',
      ]);

      const csv = [headers.join(','), ...rows.map(r => r.join(','))].join('\n');
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const result = await saveToDevice(blob, 'Backups', generateFilename('csv'));

      await logActivity({
        action: 'backup',
        entityType: 'backup',
        description: 'Created CSV backup'
      });
      toast.success(result.path ? `Backup saved to ${result.path}` : 'CSV backup created successfully', { description: '📂 Open your file manager → Documents/AmeerAutos/' });
    } catch (error) {
      toast.error('Failed to create backup');
    } finally {
      setIsExporting(null);
    }
  };

  const handleRestore = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!file.name.endsWith('.json')) {
      toast.error('Please select a valid JSON backup file');
      return;
    }

    // Check file size (100MB max)
    if (file.size > 100 * 1024 * 1024) {
      toast.error('Backup file is too large. Maximum size is 100MB.');
      return;
    }

    setIsRestoring(true);
    try {
      const text = await file.text();
      
      // Safe JSON parse with size validation
      const rawData = safeJsonParse(text);
      
      // Validate backup structure using Zod schema
      const validatedData = validateBackupFile(rawData);

      // Extract validated data for import (schema validates and transforms)
      const importData = {
        parts: validatedData.parts,
        brands: validatedData.brands,
        categories: validatedData.categories,
        sales: validatedData.sales,
        activityLogs: validatedData.activityLogs,
        settings: validatedData.settings,
      };

      const result = await importDatabase(importData as Parameters<typeof importDatabase>[0]);
      
      if (result.success) {
        await logActivity({
          action: 'restore',
          entityType: 'backup',
          description: 'Restored from backup'
        });
        toast.success('Backup restored! Reloading...');
        setTimeout(() => window.location.reload(), 800);
      } else {
        toast.error(result.message);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Invalid backup file format';
      toast.error(message);
    } finally {
      setIsRestoring(false);
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };

  return (
    <AppLayout>
      <Header title="Backup & Restore" showBack />

      <div className="p-4 space-y-4">
        {/* Export Section */}
        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Download className="h-5 w-5 text-primary" />
              Export Data
            </CardTitle>
            <CardDescription>
              Create a backup of all your data in different formats
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={handleExportJSON}
              disabled={isExporting !== null}
            >
              {isExporting === 'json' ? (
                <Loader2 className="h-4 w-4 mr-3 animate-spin" />
              ) : (
                <FileJson className="h-4 w-4 mr-3 text-blue-500" />
              )}
              Export as JSON
              <span className="ml-auto text-xs text-muted-foreground">Full backup</span>
            </Button>

            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={handleExportExcel}
              disabled={isExporting !== null}
            >
              {isExporting === 'xlsx' ? (
                <Loader2 className="h-4 w-4 mr-3 animate-spin" />
              ) : (
                <FileSpreadsheet className="h-4 w-4 mr-3 text-green-500" />
              )}
              Export as Excel
              <span className="ml-auto text-xs text-muted-foreground">Spreadsheet</span>
            </Button>

            <Button 
              className="w-full justify-start" 
              variant="outline"
              onClick={handleExportCSV}
              disabled={isExporting !== null}
            >
              {isExporting === 'csv' ? (
                <Loader2 className="h-4 w-4 mr-3 animate-spin" />
              ) : (
                <FileText className="h-4 w-4 mr-3 text-orange-500" />
              )}
              Export as CSV
              <span className="ml-auto text-xs text-muted-foreground">Parts only</span>
            </Button>
          </CardContent>
        </Card>

        {/* Restore Section */}
        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Restore Data
            </CardTitle>
            <CardDescription>
              Restore your data from a JSON backup file
            </CardDescription>
          </CardHeader>
          <CardContent>
            <input
              ref={fileInputRef}
              type="file"
              accept=".json"
              onChange={handleRestore}
              className="hidden"
            />
            <Button 
              className="w-full" 
              variant="outline"
              onClick={() => fileInputRef.current?.click()}
              disabled={isRestoring}
            >
              {isRestoring ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Restoring...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Select Backup File
                </>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Warning */}
        <Card className="bg-card border-warning/30">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <AlertTriangle className="h-5 w-5 text-warning shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Important Notice</p>
                <p className="text-sm text-muted-foreground mt-1">
                  Restoring from a backup will replace all existing data. Make sure to export 
                  your current data before restoring if needed.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Offline Notice */}
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-start gap-3">
              <Database className="h-5 w-5 text-muted-foreground shrink-0 mt-0.5" />
              <div>
                <p className="font-medium text-sm">Offline Backup</p>
                <p className="text-sm text-muted-foreground mt-1">
                  All backup and restore operations work completely offline. 
                  Files are saved directly to your device.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
