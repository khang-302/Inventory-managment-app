## Plan: Full Database Analysis, Optimization, and Production Cleanup

### Current State Analysis

**Database**: Dexie.js (IndexedDB) at schema version 12 with 13 tables. The schema has accumulated 12 version migrations, many of which are identical schema declarations used only for demo data cleanup.

**Key Issues Found**:

1. **Missing indexes on `sales` table**: No index on `totalAmount` or `profit`. Date-range queries load ALL sales via `toArray()` then filter in JS — inefficient at scale.
2. **No compound indexes**: The `sales` table lacks a `[partId+createdAt]` compound index for part-scoped date queries.
3. `**bills` table missing indexes**: No index on `buyerName` or `date` for search/filter.
4. **Redundant `toArray()` patterns**: Dashboard, Reports, and AppContext all call `db.sales.toArray()` and filter in memory instead of using indexed queries. This will degrade with thousands of records.
5. **Duplicate data loading**: AppContext loads ALL parts and ALL sales into memory via `useLiveQuery`, and Dashboard does a second full `db.sales.toArray()` for today's breakdown.
6. `**refreshStats` loads everything twice**: It calls `db.parts.toArray()` and `db.sales.toArray()` even though `useLiveQuery` already fetched them.
7. `**index.html` has wrong title**: Says "Lovable App" instead of app name.
8. **Hardcoded "Ameer Autos"** in `exportUtils.ts` line 364 (Excel summary header) — should use dynamic `appName`.
9. `**importDatabase` doesn't include bills/billItems/autocomplete**: Backup restore loses bill data.
10. `**exportDatabase` doesn't include bills/billItems/autocomplete**: Backup export is incomplete.
11. **Activity log N+1 pattern**: `getAllBrandsWithCounts` and `getAllCategoriesWithCounts` run per-item indexed queries in a loop — acceptable for small counts but could batch.

---

### Implementation Plan

#### 1. Schema Optimization — Version 13 (`src/db/database.ts`)

Add a new version(13) with improved indexes:

```
sales:    'id, partId, createdAt, [partId+createdAt]'
bills:    'id, billNumber, buyerName, createdAt'
billItems:'id, billId, [billId+id]'
```

The compound index `[partId+createdAt]` enables efficient part-scoped date queries. Adding `buyerName` to bills enables search without full scans.

#### 2. Optimize Query Patterns

`**src/contexts/AppContext.tsx**` — Refactor `refreshStats`:

- Use `db.sales.where('createdAt').between(todayStart, todayEnd)` instead of loading all sales
- Use `db.sales.where('createdAt').aboveOrEqual(monthStart)` for monthly profit
- Remove redundant full-table scans

`**src/pages/Dashboard.tsx**` — Optimize today's sales query:

- Replace `db.sales.toArray().then(filter)` with `db.sales.where('createdAt').aboveOrEqual(todayStart).toArray()`

`**src/services/salesService.ts**` — Optimize date-range queries:

- `getAllSales(dateRange)`: Use `.where('createdAt').between()` instead of `.toArray()` + filter
- `getTodaySales()`: Use indexed query on `createdAt`
- `getSalesSummary()`, `getSalesByDate()`, `getTopSellingParts()`: Use indexed range queries

#### 3. Complete Backup/Restore (`src/db/database.ts`)

Update `exportDatabase` to include `bills`, `billItems`, and `autocompleteEntries`.

Update `importDatabase` to clear and restore `bills`, `billItems`, and `autocompleteEntries` within the transaction.

Update `clearDatabase` to also clear `bills`, `billItems`, `autocompleteEntries`, `notifications`, `crashReports`.

#### 4. Fix App Naming

`**index.html**`: Change title to "Ameer Autos" and update meta tags (og:title, description).

`**src/utils/exportUtils.ts**`: Replace hardcoded `'Ameer Autos - Report Summary'` on line 364 with the dynamic `shopName` parameter.

`**src/components/layout/SidebarNav.tsx**`: Line 184 has hardcoded `"v1.0.0 • Ameer Autos"` — use dynamic `appName`.

#### 5. Production Data Integrity

Add a startup integrity check in `initializeDatabase()`:

- Remove any sales with `NaN` or invalid `totalAmount`/`profit` values
- Remove orphaned `billItems` whose `billId` doesn't exist in `bills`
- No demo data generators exist (already removed per project status)

#### 6. Backup Validation Update (`src/utils/backupValidation.ts`)

Add `bills`, `billItems`, and `autocompleteEntries` schemas to `backupFileSchema` so restored backups validate completely.

---

### Files Modified


| File                                   | Changes                                          |
| -------------------------------------- | ------------------------------------------------ |
| `src/db/database.ts`                   | Version 13 indexes, complete export/import/clear |
| `src/contexts/AppContext.tsx`          | Indexed queries in refreshStats                  |
| `src/pages/Dashboard.tsx`              | Indexed today's sales query                      |
| `src/services/salesService.ts`         | Indexed date-range queries                       |
| `src/utils/exportUtils.ts`             | Dynamic app name in Excel export                 |
| `src/utils/backupValidation.ts`        | Add bill/autocomplete schemas                    |
| `src/components/layout/SidebarNav.tsx` | Dynamic app name in footer                       |
| `index.html`                           | Correct title and meta tags                      |


### Performance Impact

- Sales queries go from O(n) full-table scan to O(log n) indexed lookups
- Dashboard load reduces from 2 full sales scans to 1 indexed query
- Backup/restore becomes complete (no data loss on restore)
- System scales to 10,000+ parts and thousands of sales without degradation  
  
The plan looks good.
  Before implementing, please also add two improvements:
  1. Add indexing for sale type so the report page can efficiently filter and compare:
  sales: id, partId, createdAt, saleType, [saleType+createdAt]
  This is important because the app uses two systems:
  New Sale and Quick Sale.
  2. Improve spare parts search performance by indexing common search fields in the parts table:
  name, sku, brand, category.
  This will make the part search fast when the user types in the New Sale section.
  Please include these optimizations in the implementation plan.
  &nbsp;