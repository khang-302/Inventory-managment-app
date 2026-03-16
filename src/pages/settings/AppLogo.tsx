import { useState, useRef } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import { ImageIcon, Upload, Trash2, Package, AlertCircle } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Alert, AlertDescription } from '@/components/ui/alert';

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ['image/png', 'image/jpeg', 'image/jpg'];

export default function AppLogo() {
  const { customLogo, setCustomLogo, isInitialized } = useApp();
  const [isUploading, setIsUploading] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const validateFile = (file: File): string | null => {
    if (!ALLOWED_TYPES.includes(file.type)) {
      return 'Invalid file format. Please upload PNG or JPEG images only.';
    }
    if (file.size > MAX_FILE_SIZE) {
      return 'File is too large. Maximum size is 5MB.';
    }
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
          
          // Max dimensions for logo
          const maxWidth = 256;
          const maxHeight = 256;
          
          let { width, height } = img;
          
          if (width > maxWidth || height > maxHeight) {
            const ratio = Math.min(maxWidth / width, maxHeight / height);
            width = Math.round(width * ratio);
            height = Math.round(height * ratio);
          }
          
          canvas.width = width;
          canvas.height = height;
          
          ctx?.drawImage(img, 0, 0, width, height);
          
          // Convert to base64 with quality compression
          const quality = 0.85;
          const base64 = canvas.toDataURL('image/jpeg', quality);
          resolve(base64);
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
    
    // Validate file
    const validationError = validateFile(file);
    if (validationError) {
      setError(validationError);
      return;
    }

    setIsUploading(true);
    
    try {
      // Create preview
      const compressed = await compressImage(file);
      setPreviewUrl(compressed);
    } catch (err) {
      console.error('Failed to process image:', err);
      setError('Failed to process image. Please try another file.');
    } finally {
      setIsUploading(false);
    }

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleSaveLogo = async () => {
    if (!previewUrl) return;

    setIsUploading(true);
    try {
      await setCustomLogo(previewUrl);
      setPreviewUrl(null);
      toast.success('Logo saved successfully');
    } catch (err) {
      console.error('Failed to save logo:', err);
      toast.error('Failed to save logo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemoveLogo = async () => {
    setIsUploading(true);
    try {
      await setCustomLogo(null);
      setPreviewUrl(null);
      toast.success('Logo removed successfully');
    } catch (err) {
      console.error('Failed to remove logo:', err);
      toast.error('Failed to remove logo');
    } finally {
      setIsUploading(false);
    }
  };

  const handleCancelPreview = () => {
    setPreviewUrl(null);
    setError(null);
  };

  if (!isInitialized) {
    return (
      <AppLayout>
        <Header title="App Logo" showBack />
        <LoadingScreen />
      </AppLayout>
    );
  }

  const displayLogo = previewUrl || customLogo;

  return (
    <AppLayout>
      <Header title="App Logo" showBack />

      <div className="p-4 space-y-4">
        {/* Current Logo Preview */}
        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <ImageIcon className="h-5 w-5 text-primary" />
              Logo Preview
            </CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col items-center gap-4">
            {/* Logo Display */}
            <div className={cn(
              'w-32 h-32 rounded-xl border-2 border-dashed flex items-center justify-center overflow-hidden',
              displayLogo ? 'border-primary bg-primary/5' : 'border-border bg-muted/50'
            )}>
              {displayLogo ? (
                <img 
                  src={displayLogo} 
                  alt="Custom Logo" 
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="flex flex-col items-center gap-2 text-muted-foreground">
                  <Package className="h-12 w-12" />
                  <span className="text-xs">Default Logo</span>
                </div>
              )}
            </div>

            {/* Preview Badge */}
            {previewUrl && (
              <span className="text-xs bg-warning/20 text-warning px-2 py-1 rounded-full">
                Preview - Not Saved
              </span>
            )}

            {/* Action Buttons for Preview */}
            {previewUrl && (
              <div className="flex gap-2 w-full">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={handleCancelPreview}
                  disabled={isUploading}
                >
                  Cancel
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSaveLogo}
                  disabled={isUploading}
                >
                  {isUploading ? 'Saving...' : 'Save Logo'}
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Error Alert */}
        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {/* Upload Section */}
        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Upload className="h-5 w-5 text-primary" />
              Upload Logo
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <input
              ref={fileInputRef}
              type="file"
              accept=".png,.jpg,.jpeg,image/png,image/jpeg"
              onChange={handleFileSelect}
              className="hidden"
              id="logo-upload"
            />
            
            <Button
              variant="outline"
              className="w-full h-24 border-dashed"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploading}
            >
              <div className="flex flex-col items-center gap-2">
                <Upload className="h-6 w-6 text-muted-foreground" />
                <span className="text-sm">
                  {isUploading ? 'Processing...' : 'Tap to upload logo'}
                </span>
              </div>
            </Button>

            <div className="text-xs text-muted-foreground space-y-1">
              <p>• Supported formats: PNG, JPEG</p>
              <p>• Maximum file size: 5MB</p>
              <p>• Recommended size: 256x256 pixels</p>
            </div>
          </CardContent>
        </Card>

        {/* Reset to Default */}
        {customLogo && !previewUrl && (
          <Card className="bg-card">
            <CardContent className="p-4">
              <Button
                variant="destructive"
                className="w-full"
                onClick={handleRemoveLogo}
                disabled={isUploading}
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Remove Custom Logo
              </Button>
              <p className="text-xs text-muted-foreground text-center mt-2">
                This will reset the app logo to the default icon
              </p>
            </CardContent>
          </Card>
        )}

        {/* Where Logo Appears */}
        <Card className="bg-card">
          <CardContent className="p-4">
            <p className="text-sm font-medium mb-2">Logo Visibility</p>
            <p className="text-xs text-muted-foreground">
              Your custom logo will appear in:
            </p>
            <ul className="text-xs text-muted-foreground mt-2 space-y-1 list-disc list-inside">
              <li>Dashboard header</li>
              <li>Side navigation drawer</li>
              <li>Reports and exports</li>
            </ul>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}
