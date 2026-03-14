

## Current State

The demo data system has **already been fully removed** in a previous round:

- `src/utils/generateDemoData.ts` — deleted
- `src/utils/demoDataConstants.ts` — deleted  
- `src/data/demoParts.ts` — deleted
- `src/services/demoSeedService.ts` — deleted
- `isDemo` field removed from `Part`, `Sale`, and `Bill` types
- Demo buttons removed from Settings page
- Database migrated to Version 10 (no `isDemo` indexes)

**What remains** are minor comment artifacts in two files — these have zero functional impact but should be cleaned for production hygiene:

### File 1: `src/db/database.ts`
- Comments like `"Add isDemo index to parts"`, `"Add isDemo index on bills for demo data cleanup"`, `"Remove isDemo indexes (demo data feature removed)"` in version history comments (lines 53, 128, 146, 164)
- These are just Dexie version migration history — they cannot be removed without breaking the migration chain, but the comments can be neutralized

### File 2: `src/services/inventoryService.ts`
- Comment on line 127: `"Delete a part - hard delete for demo items, soft delete logging for all"`
- Comment on line 133: `"Always hard delete from parts table (both demo and real items)"`
- These are just stale comments referencing demo — the actual code is already clean

### Plan

1. **Update comments in `src/db/database.ts`** — replace demo-referencing comments with neutral version descriptions (e.g., "Version 3: Schema update")
2. **Update comments in `src/services/inventoryService.ts`** — remove demo references from the two comment lines

No functional code changes needed. No data deletion needed — demo records were already removed.

### About the Screenshots

The screenshots show real data (bills for "Walk-in Customer" / "Bilal", parts like "Pitman Arm V06" with SKU "DEMO-0855"). These are **records already in your IndexedDB** from a previous demo generation. They persist in the browser's local database even after code removal.

To purge these remaining records from your browser, we should add a **one-time cleanup migration** in database Version 11 that deletes any parts with SKU starting with "DEMO-" and any bills/sales that reference them.

### Updated Plan

1. Clean stale demo comments in `src/db/database.ts` and `src/services/inventoryService.ts`
2. Add **Database Version 11** migration that runs a data cleanup:
   - Delete all parts where SKU starts with `DEMO-`
   - Delete all sales referencing deleted part IDs
   - Delete all bills and bill items that were created from demo data
   - This runs automatically on app load via Dexie's upgrade mechanism

