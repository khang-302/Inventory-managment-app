

## Plan: Add Exports Page in Settings

### Overview
Create a new "Exported Files" settings page that lists all files saved in `Documents/AmeerAutos/` using the Capacitor Filesystem API, with options to share or delete each file. On web (non-native), show a message that this feature is only available on the mobile app.

### New Files

**`src/pages/settings/ExportedFiles.tsx`**
- Page with `AppLayout` + `Header` (title "Exported Files", showBack)
- On mount, scan all 4 subdirectories (`Backups`, `Reports`, `Images`, `Exports`) using `Filesystem.readdir()` with `Directory.Documents` and path `AmeerAutos/{subfolder}`
- Display files grouped by subfolder in collapsible sections (Accordion or Cards)
- Each file row shows: icon (based on extension), filename, file size (from stat), date modified
- Two action buttons per file:
  - **Share**: Write to Cache, use `Share.share()` with the URI
  - **Delete**: Confirm via AlertDialog, then `Filesystem.deleteFile()`
- Loading skeleton while scanning
- Empty state when no files found
- On web: show info card saying "Available on mobile app only"

**`src/utils/exportedFilesService.ts`**
- `listExportedFiles()`: Scans all AmeerAutos subdirectories, returns `{ subfolder, name, uri, size, modifiedAt }[]`
- `deleteExportedFile(subfolder, filename)`: Deletes a file
- `shareExportedFile(subfolder, filename)`: Copies to Cache + shares via Share plugin
- Handles errors gracefully (folder doesn't exist yet = empty list)

### Modified Files

**`src/pages/Settings.tsx`**
- Add a new item in `syncItems` array: `{ icon: FolderOpen, title: 'Exported Files', description: 'View and manage saved exports', path: '/settings/exports' }`

**`src/App.tsx`**
- Import `ExportedFiles` page, add route `/settings/exports`

### File List UI Design
Each file card:
```text
┌──────────────────────────────────┐
│ 📄 backup-2026-03-15.json       │
│ 12.4 KB · Mar 15, 2026          │
│                    [Share] [Delete] │
└──────────────────────────────────┘
```

Grouped under section headers: **Backups**, **Reports**, **Images**, **Exports**

