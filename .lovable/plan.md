

## Plan: Fix File Export Location for Capacitor Android

### Problem
`saveToDevice` uses `Directory.ExternalStorage` with path `AIM/…` — on modern Android (11+) with scoped storage, this lands in the app's private sandbox and is invisible in file managers.

### Fix
One change in `src/utils/nativeShare.ts`:

1. **Change `Directory.ExternalStorage` → `Directory.Documents`** in the `saveToDevice` function
2. **Change path prefix from `AIM/` → `AmeerAutos/`** (matching the user's requested structure)
3. **Map subfolder names** to the new structure:
   - `Backups` → `AmeerAutos/Backups`
   - `Reports` → `AmeerAutos/Reports`
   - `Bills` → `AmeerAutos/Images` (bill images/PDFs)
4. **Update toast descriptions** — change "AIM/Bills" references to "Documents/AmeerAutos/"
5. **Add `Directory.Documents` fallback** — if `Documents` write fails, try `Directory.ExternalStorage` as fallback

No changes needed to callers (`BackupRestore.tsx`, `exportUtils.ts`, `BillHistory.tsx`) — they all go through `saveToDevice` with subfolder names that already map correctly.

### File Changes

| File | Change |
|---|---|
| `src/utils/nativeShare.ts` | Change directory to `Directory.Documents`, path prefix to `AmeerAutos/`, update all path references |
| `src/pages/BillHistory.tsx` | Update toast messages from "AIM/Bills" to "Documents/AmeerAutos/" |
| `src/components/sale/SaleSuccessDialog.tsx` | Update toast path references if any |

