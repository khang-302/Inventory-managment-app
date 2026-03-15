/**
 * Native file saving & sharing utilities.
 * Uses Capacitor plugins on Android APK, Web APIs as fallback.
 */
import { Filesystem, Directory, Encoding } from '@capacitor/filesystem';
import { Share } from '@capacitor/share';

// ---------------------------------------------------------------------------
// Platform detection
// ---------------------------------------------------------------------------

function isNativePlatform(): boolean {
  return !!(window as any).Capacitor?.isNativePlatform?.();
}

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

export function dataUrlToBase64(dataUrl: string): string {
  return dataUrl.split(',')[1] || '';
}

export function dataUrlToBlob(dataUrl: string): Blob {
  const [header, base64] = dataUrl.split(',');
  const mime = header.match(/:(.*?);/)?.[1] || 'application/octet-stream';
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return new Blob([bytes], { type: mime });
}

export function dataUrlToFile(dataUrl: string, filename: string, mimeType: string): File {
  const blob = dataUrlToBlob(dataUrl);
  return new File([blob], filename, { type: mimeType });
}

export function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] || '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

// ---------------------------------------------------------------------------
// Web fallback: download via anchor tag
// ---------------------------------------------------------------------------

function webDownload(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 5000);
}

// ---------------------------------------------------------------------------
// Web fallback: share via Web Share API
// ---------------------------------------------------------------------------

async function webShare(file: File, title?: string): Promise<boolean> {
  try {
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({ files: [file], title: title || file.name });
      return true;
    }
  } catch (err: any) {
    if (err?.name === 'AbortError') return true;
    console.warn('Web Share API failed:', err);
  }
  return false;
}

// ---------------------------------------------------------------------------
// Save to device: generic helper for all exports
// ---------------------------------------------------------------------------

export type SaveResult = {
  method: 'shared' | 'downloaded';
  path?: string;
};

/**
 * Save any blob to Documents/AmeerAutos/{subfolder}/{filename} on native,
 * or trigger a browser download on web.
 */
/**
 * Map caller-provided subfolder names to the AmeerAutos directory structure.
 */
function mapSubfolder(subfolder: string): string {
  const map: Record<string, string> = {
    Bills: 'Images',
    Backups: 'Backups',
    Reports: 'Reports',
    Images: 'Images',
    Exports: 'Exports',
  };
  return map[subfolder] || 'Exports';
}

export async function saveToDevice(
  blob: Blob,
  subfolder: string,
  filename: string,
): Promise<SaveResult> {
  if (isNativePlatform()) {
    const mappedFolder = mapSubfolder(subfolder);
    const savePath = `AmeerAutos/${mappedFolder}/${filename}`;

    // Try Directory.Documents first (visible in file managers on Android 11+)
    try {
      const base64Data = await blobToBase64(blob);
      await Filesystem.writeFile({
        path: savePath,
        data: base64Data,
        directory: Directory.Documents,
        recursive: true,
      });
      return { method: 'downloaded', path: `Documents/AmeerAutos/${mappedFolder}/${filename}` };
    } catch (err) {
      console.warn(`Documents write failed, trying ExternalStorage:`, err);
    }

    // Fallback to ExternalStorage
    try {
      const base64Data = await blobToBase64(blob);
      await Filesystem.writeFile({
        path: savePath,
        data: base64Data,
        directory: Directory.ExternalStorage,
        recursive: true,
      });
      return { method: 'downloaded', path: `AmeerAutos/${mappedFolder}/${filename}` };
    } catch (err) {
      console.error(`Native save failed, using web fallback:`, err);
    }
  }

  webDownload(blob, filename);
  return { method: 'downloaded' };
}

// ---------------------------------------------------------------------------
// Save image to Documents/AmeerAutos/Images/
// ---------------------------------------------------------------------------

export async function saveImageToGallery(
  dataUrl: string,
  filename: string,
): Promise<SaveResult> {
  const blob = dataUrlToBlob(dataUrl);
  return saveToDevice(blob, 'Bills', filename);
}

// ---------------------------------------------------------------------------
// Save PDF to AIM/Bills/
// ---------------------------------------------------------------------------

export async function savePdfToDevice(
  pdfBlob: Blob,
  filename: string,
): Promise<SaveResult> {
  return saveToDevice(pdfBlob, 'Bills', filename);
}

// ---------------------------------------------------------------------------
// Share a file via native share intent
// ---------------------------------------------------------------------------

export async function saveFile(
  dataOrBlob: string | Blob,
  filename: string,
  mimeType: string,
): Promise<'shared' | 'downloaded'> {
  const blob = typeof dataOrBlob === 'string' ? dataUrlToBlob(dataOrBlob) : dataOrBlob;

  if (isNativePlatform()) {
    try {
      const base64Data = await blobToBase64(blob);
      // Write temp file for sharing
      const writeResult = await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true,
      });

      // Get the native URI for sharing
      const fileUri = writeResult.uri;

      await Share.share({
        title: filename,
        url: fileUri,
        dialogTitle: 'Share Bill',
      });

      // Clean up temp file after a delay
      setTimeout(async () => {
        try {
          await Filesystem.deleteFile({ path: filename, directory: Directory.Cache });
        } catch { /* ignore cleanup errors */ }
      }, 10000);

      return 'shared';
    } catch (err: any) {
      if (err?.message?.includes('cancel') || err?.message?.includes('Cancel')) {
        return 'shared'; // User cancelled — not an error
      }
      console.error('Native share failed, trying fallback:', err);
    }
  }

  // Web fallback
  const file = new File([blob], filename, { type: mimeType });
  const shared = await webShare(file, filename);
  if (shared) return 'shared';

  webDownload(blob, filename);
  return 'downloaded';
}

// ---------------------------------------------------------------------------
// Share via WhatsApp (native intent)
// ---------------------------------------------------------------------------

export async function shareViaWhatsAppNative(
  dataUrl: string,
  filename: string,
): Promise<'shared' | 'fallback'> {
  if (isNativePlatform()) {
    try {
      const base64Data = dataUrlToBase64(dataUrl);

      const writeResult = await Filesystem.writeFile({
        path: filename,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true,
      });

      const fileUri = writeResult.uri;

      // Native share — Android will show share sheet; user picks WhatsApp
      await Share.share({
        title: filename,
        url: fileUri,
        dialogTitle: 'Share via WhatsApp',
      });

      // Clean up temp file
      setTimeout(async () => {
        try {
          await Filesystem.deleteFile({ path: filename, directory: Directory.Cache });
        } catch { /* ignore */ }
      }, 10000);

      return 'shared';
    } catch (err: any) {
      if (err?.message?.includes('cancel') || err?.message?.includes('Cancel')) {
        return 'shared';
      }
      console.error('Native WhatsApp share failed:', err);
    }
  }

  // Web fallback: try Web Share API then WhatsApp deep link
  const file = dataUrlToFile(dataUrl, filename, 'image/png');
  const shared = await webShare(file, filename);
  if (shared) return 'shared';

  try {
    window.open(`https://wa.me/?text=${encodeURIComponent(`Bill: ${filename}`)}`, '_blank');
  } catch { /* ignore */ }

  return 'fallback';
}

// ---------------------------------------------------------------------------
// Legacy export for compatibility
// ---------------------------------------------------------------------------

export async function shareFileNative(file: File, title?: string): Promise<boolean> {
  if (isNativePlatform()) {
    try {
      const base64Data = await blobToBase64(file);
      const writeResult = await Filesystem.writeFile({
        path: file.name,
        data: base64Data,
        directory: Directory.Cache,
        recursive: true,
      });
      await Share.share({ title: title || file.name, url: writeResult.uri });
      setTimeout(async () => {
        try { await Filesystem.deleteFile({ path: file.name, directory: Directory.Cache }); } catch {}
      }, 10000);
      return true;
    } catch (err: any) {
      if (err?.message?.includes('cancel')) return true;
      console.warn('Native share failed:', err);
    }
  }
  return webShare(file, title);
}
