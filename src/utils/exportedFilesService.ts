/**
 * Service for listing, sharing, and deleting exported files
 * stored in Documents/AmeerAutos/ via Capacitor Filesystem.
 */

const SUBFOLDERS = ['Backups', 'Reports', 'Images', 'Exports'] as const;
export type ExportSubfolder = (typeof SUBFOLDERS)[number];

export interface ExportedFile {
  subfolder: ExportSubfolder;
  name: string;
  uri: string;
  size: number;
  modifiedAt: number;
}

function isNative(): boolean {
  return !!(window as any).Capacitor?.isNativePlatform?.();
}

function getFilesystem() {
  return (window as any).Capacitor?.Plugins?.Filesystem;
}

function getShare() {
  return (window as any).Capacitor?.Plugins?.Share;
}

export async function listExportedFiles(): Promise<ExportedFile[]> {
  if (!isNative()) return [];

  const Filesystem = getFilesystem();
  if (!Filesystem) return [];

  const files: ExportedFile[] = [];

  for (const subfolder of SUBFOLDERS) {
    try {
      const result = await Filesystem.readdir({
        path: `AmeerAutos/${subfolder}`,
        directory: 'DOCUMENTS',
      });

      for (const entry of result.files || []) {
        if (entry.type === 'directory') continue;
        try {
          const stat = await Filesystem.stat({
            path: `AmeerAutos/${subfolder}/${entry.name}`,
            directory: 'DOCUMENTS',
          });
          files.push({
            subfolder,
            name: entry.name,
            uri: stat.uri || '',
            size: stat.size || 0,
            modifiedAt: stat.mtime || 0,
          });
        } catch {
          files.push({
            subfolder,
            name: entry.name,
            uri: '',
            size: 0,
            modifiedAt: 0,
          });
        }
      }
    } catch {
      // Folder doesn't exist yet — skip
    }
  }

  return files.sort((a, b) => b.modifiedAt - a.modifiedAt);
}

export async function deleteExportedFile(subfolder: ExportSubfolder, filename: string): Promise<void> {
  const Filesystem = getFilesystem();
  if (!Filesystem) throw new Error('Filesystem not available');

  await Filesystem.deleteFile({
    path: `AmeerAutos/${subfolder}/${filename}`,
    directory: 'DOCUMENTS',
  });
}

export async function shareExportedFile(subfolder: ExportSubfolder, filename: string): Promise<void> {
  const Filesystem = getFilesystem();
  const Share = getShare();
  if (!Filesystem || !Share) throw new Error('Plugins not available');

  // Read file and write to cache for sharing
  const fileData = await Filesystem.readFile({
    path: `AmeerAutos/${subfolder}/${filename}`,
    directory: 'DOCUMENTS',
  });

  const cached = await Filesystem.writeFile({
    path: `cache_share_${filename}`,
    data: fileData.data,
    directory: 'CACHE',
  });

  await Share.share({
    title: filename,
    url: cached.uri,
  });
}

export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
}

export { SUBFOLDERS };
