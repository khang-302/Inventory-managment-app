/**
 * Utility to open the device's file manager to the AmeerAutos folder.
 */

function isNativePlatform(): boolean {
  return !!(window as any).Capacitor?.isNativePlatform?.();
}

/**
 * Attempt to open the file manager on Android.
 * Falls back to a no-op on web.
 */
export async function openFileManager(): Promise<void> {
  if (!isNativePlatform()) return;

  try {
    // Try opening file manager via Capacitor App plugin (if available)
    await (window as any).Capacitor?.Plugins?.App?.openUrl?.({
      url: 'content://com.android.externalstorage.documents/document/primary%3ADocuments%2FAmeerAutos',
    });
  } catch {
    try {
      await (window as any).Capacitor?.Plugins?.App?.openUrl?.({
        url: 'content://com.android.externalstorage.documents/root/primary',
      });
    } catch {
      console.warn('Could not open file manager automatically');
    }
  }
}

export const FILE_MANAGER_PATH = 'Documents/AmeerAutos';
