import { toPng, toJpeg, toSvg } from 'html-to-image';

export type ImageFormat = 'png' | 'jpg' | 'svg';

/**
 * Captures an HTML element as an image data URL.
 */
export async function captureBillAsImage(
  el: HTMLElement,
  format: ImageFormat = 'png',
): Promise<string> {
  const options = { cacheBust: true, pixelRatio: 3 };

  switch (format) {
    case 'jpg':
      return toJpeg(el, { ...options, quality: 0.95 });
    case 'svg':
      return toSvg(el, options);
    default:
      return toPng(el, options);
  }
}

/**
 * Triggers a download for a data URL.
 */
export function downloadDataUrl(dataUrl: string, filename: string) {
  const link = document.createElement('a');
  link.download = filename;
  link.href = dataUrl;
  link.click();
}

/**
 * Returns the file extension for the format.
 */
export function getExtension(format: ImageFormat): string {
  return format === 'jpg' ? 'jpg' : format === 'svg' ? 'svg' : 'png';
}

/**
 * Returns the MIME type for a given image format.
 */
export function getMimeType(format: ImageFormat): string {
  switch (format) {
    case 'jpg': return 'image/jpeg';
    case 'svg': return 'image/svg+xml';
    default: return 'image/png';
  }
}
