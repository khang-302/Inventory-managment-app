import { useState, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { ImageIcon, Upload, Trash2, Package, AlertCircle, Type, RotateCcw } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MAX_FILE_SIZE = 5 * 1024 * 1024;
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];
const MAX_APP_NAME_LENGTH = 40;

export default function Branding() {
  const { customLogo, setCustomLogo, appName, setAppName, isInitialized } = useApp();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [nameValue, setNameValue] = useState('');
  const [nameError, setNameError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isInitialized) {
      setNameValue(appName);
    }
  }, [isInitialized, appName]);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) return 'Invalid format. Upload PNG or JPEG only.';
    if (file.size > MAX_FILE_SIZE) return 'File too large. Max 5MB.';
    return null;
  };

  const compressImage = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const ctx = canvas.getContext('2d');
          const maxSize = 256;
          let { width, height } = img;
          if (width > maxSize || height > maxSize) {
            const ratio = Math.min(maxSize / width, maxSize / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          canvas.width = width;
          canvas.height = height;
          ctx?.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', 0.85));
        };
        img.onerror = () => reject(new Error('Failed to load image'));
        img.src = e.target?.result as string;
      };
      reader.onerror = () => reject(new Error('Failed to read file'));
      reader.readAsDataURL(file);
    });
  };

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setError(null);
    const validationError = validateFile(file);
    if (validationError) { setError(validationError); return; }
    setIsUploading(true);
    try {
      setPreviewUrl(await compressImage(file));
    } catch {
      setError('Failed to process image.');
    } finally {
      setIsUploading(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const handleSaveLogo = async () => {
    if (!previewUrl) return;
    setIsUploading(true);
    try {
      await setCustomLogo(previewUrl);
      setPreviewUrl(null);
      toast.success('Logo saved');
    } catch { toast.error('Failed to save logo'); }
    finally { setIsUploading(false); }
  };

  const handleRemoveLogo = async () => {
    setIsUploading(true);
    try {
      await setCustomLogo(null);
      setPreviewUrl(null);
      toast.success('Logo removed');
    } catch { toast.error('Failed to remove logo'); }
    finally { setIsUploading(false); }
  };

  const handleSaveName = async () => {
    const trimmed = nameValue.trim();
    if (!trimmed) { setNameError('App name is required'); return; }
    if (trimmed.length > MAX_APP_NAME_LENGTH) { setNameError(`Max ${MAX_APP_NAME_LENGTH} characters`); return; }
    setNameError(null);
    try {
      await setAppName(trimmed);
      toast.success('App name updated');
    } catch { toast.error('Failed to update app name'); }
  };

  const handleResetName = async () => {
    const defaultName = 'Ameer Autos';
    setNameValue(defaultName);
    setNameError(null);
    try {
      await setAppName(defaultName);
      toast.success('App name reset to default');
    } catch { toast.error('Failed to reset'); }
  };

  if (!isInitialized) {
    return (
      <AppLayout>
        <Header title="Branding" showBack />
        <LoadingScreen />
      </AppLayout>
    );
  }

  const displayLogo = previewUrl || customLogo;

  return (
    <AppLayout>
      <Header title="Branding" showBack />
      <div className="p-4 space-y-4">
        {/* App Name */}
        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Type className="h-5 w-5 text-primary" />
              App Name
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label htmlFor="app-name">App Name *</Label>
              <Input
                id="app-name"
                value={nameValue}
                onChange={(e) => {
                  setNameValue(e.target.value);
                  setNameError(null);
                }}
                maxLength={MAX_APP_NAME_LENGTH}
                placeholder="Enter app name"
                className="mt-1"
              />
              <div className="flex justify-between mt-1">
                {nameError ? (
                  <p className="text-xs text-destructive">{nameError}</p>
                ) : <span />}
                <p className="text-xs text-muted-foreground">{nameValue.length}/{MAX_APP_NAME_LENGTH}</p>
              </div>
            </div>

            {/* Live Preview */}
            <div className="p-3 bg-muted rounded-lg">
              <p className="text-xs text-muted-foreground mb-1">Preview</p>
              <div className="flex items-center gap-2">
                {displayLogo ? (
                  <img src={displayLogo} alt="Logo" className="h-8 w-8 rounded-lg object-cover" />
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-primary flex items-center justify-center">
                    <Package className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                <div>
                  <p className="font-semibold text-sm">{nameValue.trim() || 'App Name'}</p>
                  <p className="text-[10px] text-muted-foreground">Inventory & Sales Manager</p>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button onClick={handleSaveName} className="flex-1" disabled={!nameValue.trim() || nameValue.trim() === appName}>
                Save Name
              </Button>
              <Button variant="outline" onClick={handleResetName} size="icon">
                <RotateCcw className="h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Logo */}
        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Logo
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            <div className={cn(
              'w-32 h-32 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden',
              displayLogo ? 'border-primary bg-primary/5' : 'border-border bg-muted/50'
            )}>
              {displayLogo ? (
                <img src={displayLogo} alt="Custom Logo" className="w-full h-full object-cover" />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Package className="h-12 w-12" />
                  <span className="text-xs">Default Logo</span>
                </div>
              )}
            </div>

            {previewUrl && (
              <>
                <span className="text-xs bg-warning/20 text-warning px-2 py-1 rounded-full">Preview - Not Saved</span>
                <div className="flex gap-2 w-full">
                  <Button variant="outline" className="flex-1" onClick={() => { setPreviewUrl(null); setError(null); }} disabled={isUploading}>Cancel</Button>
                  <Button className="flex-1" onClick={handleSaveLogo} disabled={isUploading}>{isUploading ? 'Saving...' : 'Save Logo'}</Button>
                </div>
              </>
            )}

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <input ref={fileInputRef} type="file" accept=".png,.jpg,.jpeg,image/png,image/jpeg" onChange={handleFileSelect} className="hidden" />
            <Button variant="outline" className="w-full h-20 border-dashed" onClick={() => fileInputRef.current?.click()} disabled={isUploading}>
              <div className="flex flex-col items-center gap-1">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">{isUploading ? 'Processing...' : 'Upload Logo'}</span>
              </div>
            </Button>

            <div className="text-xs text-muted-foreground space-y-1 w-full">
              <p>• PNG, JPEG • Max 5MB • 256×256 recommended</p>
            </div>

            {customLogo && !previewUrl && (
              <div className="flex gap-2 w-full">
                <Button variant="destructive" className="flex-1" onClick={handleRemoveLogo} disabled={isUploading}>
                  <Trash2 className="h-4 w-4 mr-2" />Remove Logo
                </Button>
                <Button variant="outline" className="flex-1" onClick={() => { handleRemoveLogo(); }}>
                  <RotateCcw className="h-4 w-4 mr-2" />Reset Default
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Visibility Info */}
        <Card className="bg-card">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-2">Where It Appears</p>
            <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
              <li>Top App Bar title</li>
              <li>Sidebar / Drawer header</li>
              <li>Dashboard header</li>
              <li>Reports and exports</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
