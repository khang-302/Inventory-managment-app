

## Plan: Save All Exports to External `AIM/` Folders

### Problem
Backups and reports use `saveAs()` (file-saver) and `doc.save()` which only trigger browser downloads — files aren't accessible in the phone's file manager. Bills save to `AIM Bills/` instead of `AIM/Bills/`.

### Solution
Add a generic `saveToDevice(blob, folder, filename)` function in `nativeShare.ts` that writes to `AIM/{folder}/` on native (Capacitor Filesystem) and falls back to browser download on web. Then replace all `saveAs()`/`doc.save()` calls with this function.

---

### File Changes

#### 1. `src/utils/nativeShare.ts` — Add generic save function

Add a new export:
```ts
export async function saveToDevice(
  blob: Blob, subfolder: string, filename: string
): Promise<SaveResult>
```
- On native: converts blob to base64, writes to `AIM/${subfolder}/${filename}` in `Directory.ExternalStorage` with `recursive: true`
- On web: falls back to `webDownload(blob, filename)`
- Returns `{ method: 'downloaded', path: 'AIM/{subfolder}/{filename}' }`

Also update existing functions:
- `saveImageToGallery`: change path from `AIM Bills/` → `AIM/Bills/`
- `savePdfToDevice`: change path from `AIM Bills/` → `AIM/Bills/`

#### 2. `src/pages/settings/BackupRestore.tsx` — Use `saveToDevice`

Replace 3 `saveAs()` calls:
- JSON backup → `saveToDevice(blob, 'Backups', filename)`
- Excel backup → `saveToDevice(blob, 'Backups', filename)`
- CSV backup → `saveToDevice(blob, 'Backups', filename)`

Show the save path in the toast on success.

#### 3. `src/utils/exportUtils.ts` — Use `saveToDevice`

- `exportReportToPDF`: replace `doc.save(filename)` with `doc.output('blob')` → `saveToDevice(blob, 'Reports', filename)`
- `exportReportToExcel`: replace `saveAs(blob, filename)` with `saveToDevice(blob, 'Reports', filename)`
- `exportReportToCSV`: replace 3 `saveAs()` calls with `saveToDevice()` to `AIM/Reports/`

Note: These functions become `async` (they already are or return void).

---

### Folder Structure on Device
```
AIM/
├── Backups/    ← JSON, Excel, CSV backups
├── Bills/      ← Bill images and PDFs
└── Reports/    ← Report PDFs, Excel, CSVs
```

### Files Modified
1. `src/utils/nativeShare.ts` — add `saveToDevice()`, update paths
2. `src/pages/settings/BackupRestore.tsx` — replace `saveAs` with `saveToDevice`
3. `src/utils/exportUtils.ts` — replace `saveAs`/`doc.save` with `saveToDevice`

