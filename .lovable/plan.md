

## Plan: Demo Data Generator for Performance Testing

### Overview
Create a utility to generate 1,000 realistic spare parts and 1,000 bills, accessible via a new "Developer Tools" section in Settings. Parts and bills will be tagged as demo data for safe cleanup.

### 1. Create `src/utils/generateDemoData.ts`

**`generateDemoSpareParts(count: number)`** — returns `Part[]`:
- Use expanded part name templates (20+ categories x 50+ variations) to produce 1,000 unique, natural-looking parts
- SKUs follow pattern: `DEMO-XXXX` (0001–1000)
- Randomly assign from 15 existing brands and 10 categories
- Randomize prices (PKR 500–150,000 buying, 20–40% markup selling), quantities (0–200), minStockLevel (2–20), locations (Shelf A1–Z10)
- Set `isDemo: true` on every part for cleanup tagging

**`generateDemoBills(count: number, parts: Part[])`** — returns `{ bills: Bill[], billItems: BillItem[] }`:
- Generate 1,000 bills with sequential numbering (DEMO-0001 to DEMO-1000)
- Random customer names from a pool of 100+ Pakistani names + random phone numbers (03XX-XXXXXXX)
- Each bill has 1–5 items randomly selected from the generated parts
- Dates spread across the last 6 months
- Calculate subtotals, random discounts (0–10%), finalTotal
- Tag bills with a `isDemo` flag (add to Bill type)

**`clearDemoData()`** — deletes all demo-tagged parts, bills, and billItems

### 2. Update Types

**`src/types/bill.ts`**: Add optional `isDemo?: boolean` to `Bill` interface

### 3. Update Database Schema

**`src/db/database.ts`**: Add version 8 with `isDemo` index on `bills` table for efficient demo cleanup

### 4. Add Settings UI Section

**`src/pages/Settings.tsx`**: Add a "Developer / Testing Tools" section (visible between "Activity & Logs" and "Help & Support") containing:
- **Generate Demo Data** button — with AlertDialog confirmation warning "This will add 1,000 spare parts and 1,000 bills for testing purposes only"
- **Clear Demo Data** button — with AlertDialog confirmation
- Progress indicator during generation (batch inserts to avoid UI freeze)
- Guard against duplicate generation (check if demo parts already exist)

### 5. Batch Insert Strategy for Performance

Insert data in batches of 100 records using `db.parts.bulkAdd()` and `db.table('bills').bulkAdd()` within transactions. Use `setTimeout` chunks to keep UI responsive during generation. Skip activity logging for demo data to avoid flooding the log.

### Files to Create/Edit
| File | Action |
|------|--------|
| `src/utils/generateDemoData.ts` | Create — generator + cleanup functions |
| `src/types/bill.ts` | Edit — add `isDemo?` to Bill |
| `src/db/database.ts` | Edit — version 8 with bills isDemo index |
| `src/pages/Settings.tsx` | Edit — add Developer Tools section |

