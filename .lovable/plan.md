

## Problem

The Version 11 migration already ran in your browser but its bill cleanup regex was too narrow. It only matched part names starting with "Pitman Arm|Tie Rod|Ball Joint|Brake Pad|Oil Filter|Air Filter|Spark Plug|Clutch Plate|Shock Absorber|Radiator Hose" — but your demo data also contains "Camshaft Bearing", "Radiator Cap", "Transmission Mount", "Valve Spring", and many more. Those bills survived the migration.

Additionally, the v11 migration deleted demo parts but left behind **orphaned sales records** that reference now-deleted part IDs — which is why revenue/profit/dashboard still show inflated numbers.

## Plan

**Add Database Version 12** with a comprehensive cleanup migration:

1. **Delete orphaned sales** — any sale whose `partId` no longer exists in the parts table (these are leftover from deleted demo parts)
2. **Delete ALL remaining bills and bill items** that contain items with `partCode` starting with `DEMO-` OR items whose part names match an expanded list covering all demo-generated categories
3. **Delete activity logs** referencing deleted entity IDs to clean up the activity feed
4. **Reset `lastBillNumber`** in billSettings back to 0 so new real bills start fresh

This approach is surgical — it targets demo artifacts specifically rather than wiping all data.

### File: `src/db/database.ts`
- Add Version 12 migration after Version 11
- Upgrade function that:
  - Scans `sales` table, cross-references `parts` table, deletes any sale where the referenced part no longer exists
  - Scans `billItems` for `partCode` starting with `DEMO-`, collects their `billId`s, deletes those bills + items
  - Resets `billSettings.lastBillNumber` to 0

