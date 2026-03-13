/**
 * Native sharing & file saving utilities.
 * Works in both browser and Capacitor WebView environments.
 */

/**
 * Convert a data URL to a Blob.
 */
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

/**
 * Create a File from a data URL.
 */
export function dataUrlToFile(dataUrl: string, filename: string, mimeType: string): File {
  const blob = dataUrlToBlob(dataUrl);
  return new File([blob], filename, { type: mimeType });
}

/**
 * Try to share a file using Web Share API.
 * Returns true if share succeeded, false if unavailable.
 */
export async function shareFileNative(file: File, title?: string): Promise<boolean> {
  try {
    if (navigator.share && navigator.canShare?.({ files: [file] })) {
      await navigator.share({
        files: [file],
        title: title || file.name,
      });
      return true;
    }
  } catch (err: any) {
    // User cancelled share — not an error
    if (err?.name === 'AbortError') return true;
    console.warn('Web Share API failed:', err);
  }
  return false;
}

/**
 * Download/save a file using the best available method.
 * In Capacitor WebView, <a download> doesn't work, so we try:
 * 1. Web Share API (opens system share sheet — user can save to Files, Gallery, etc.)
 * 2. window.open with blob URL (some WebViews support this)
 * 3. Traditional anchor download as last resort
 */
export async function saveFile(
  dataOrBlob: string | Blob,
  filename: string,
  mimeType: string,
): Promise<'shared' | 'downloaded'> {
  const blob = typeof dataOrBlob === 'string' ? dataUrlToBlob(dataOrBlob) : dataOrBlob;
  const file = new File([blob], filename, { type: mimeType });

  // Try Web Share API first (works great in Capacitor)
  const shared = await shareFileNative(file);
  if (shared) return 'shared';

  // Fallback: blob URL download
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.style.display = 'none';
  document.body.appendChild(link);
  link.click();
  
  // Clean up after a delay
  setTimeout(() => {
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }, 5000);

  return 'downloaded';
}

/**
 * Save an image (data URL) with a proper filename.
 * Uses share sheet on mobile so user can save to Gallery.
 */
export async function saveImageToGallery(
  dataUrl: string,
  filename: string,
): Promise<'shared' | 'downloaded'> {
  return saveFile(dataUrl, filename, 'image/png');
}

/**
 * Save a PDF blob with a proper filename.
 * Uses share sheet on mobile so user can save to Files/Documents.
 */
export async function savePdfToDevice(
  pdfBlob: Blob,
  filename: string,
): Promise<'shared' | 'downloaded'> {
  return saveFile(pdfBlob, filename, 'application/pdf');
}

/**
 * Share an image via WhatsApp specifically.
 * Tries Web Share API first, then falls back to saving the file.
 */
export async function shareViaWhatsAppNative(
  dataUrl: string,
  filename: string,
): Promise<'shared' | 'fallback'> {
  const file = dataUrlToFile(dataUrl, filename, 'image/png');

  // Web Share API — opens the system share sheet, user picks WhatsApp
  const shared = await shareFileNative(file, filename);
  if (shared) return 'shared';

  // Fallback: try whatsapp:// deep link (text only, no image)
  try {
    const whatsappUrl = `https://wa.me/?text=${encodeURIComponent(`Bill: ${filename}`)}`;
    window.open(whatsappUrl, '_blank');
  } catch { /* ignore */ }

  return 'fallback';
}
