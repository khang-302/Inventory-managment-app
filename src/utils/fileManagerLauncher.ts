/**
 * Utility to open the device's file manager to the AmeerAutos folder.
 * Uses Capacitor FileOpener or Android intent fallback.
 */

function isNativePlatform(): boolean {
  return !!(window as any).Capacitor?.isNativePlatform?.();
}

/**
 * Attempt to open the file manager on Android.
 * Falls back to a no-op on web.
 */
export async function openFileManager(): Promise<void> {
  if (!isNativePlatform()) {
    // On web, nothing to do — file was already downloaded via browser
    return;
  }

  try {
    // Try using Android intent to open file manager at Documents
    const { App } = await import('@capacitor/app');
    // Unfortunately Capacitor doesn't have a direct "open folder" API,
    // so we use the native file manager intent via a content URI
    // This opens the default file manager app
    await (window as any).Capacitor?.Plugins?.App?.openUrl?.({
      url: 'content://com.android.externalstorage.documents/document/primary%3ADocuments%2FAmeerAutos',
    });
  } catch {
    try {
      // Fallback: try opening generic file manager
      await (window as any).Capacitor?.Plugins?.App?.openUrl?.({
        url: 'content://com.android.externalstorage.documents/root/primary',
      });
    } catch {
      // Silent fail — toast already shows the path
      console.warn('Could not open file manager automatically');
    }
  }
}

export const FILE_MANAGER_PATH = 'Documents/AmeerAutos';
