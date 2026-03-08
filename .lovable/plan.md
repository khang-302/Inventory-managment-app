

## Plan: Smart Autocomplete for Forms

### Overview

Create a reusable `AutocompleteInput` component backed by a new `autocompleteEntries` Dexie table. The component provides filtered dropdown suggestions as the user types, with deduplication and persistence. Integrate it into all forms that use customer name, phone, brand (free-text), and category fields.

### Data Layer

**New Dexie table** (`autocompleteEntries`):
- Schema: `id, field, value` — indexed on `[field+value]` for uniqueness queries
- Fields tracked: `customerName`, `customerPhone`, `brand`, `category`
- Add as DB version 5 in `src/db/database.ts`

**New service** (`src/services/autocompleteService.ts`):
- `getSuggestions(field, query)` — case-insensitive prefix match, returns top 10
- `addEntry(field, value)` — deduped insert (skip if exact match exists)
- `removeEntry(id)` — delete single entry
- `getAllEntries(field)` — for settings management

### Reusable Component

**`src/components/ui/autocomplete-input.tsx`**:
- Props: `field` (which autocomplete pool), `value`, `onChange`, `placeholder`, standard input props
- On typing: queries `getSuggestions` with debounce (~150ms), shows a `Popover` dropdown below the input
- Dropdown items: highlight matching prefix, click to select
- On blur / select: calls `addEntry` to persist new values
- Mobile-friendly: uses `Popover` anchored to input, max-height with scroll
- Keyboard support: arrow keys + enter to select

### Integration Points

1. **`BillCreate.tsx`** — `buyerName`, `buyerPhone`, bill item `brand` fields → replace `<Input>` with `<AutocompleteInput>`
2. **`RecordSale.tsx`** — `customerName`, `customerPhone` fields → replace `<Input>`
3. **`QuickSellModal.tsx`** — `buyerName`, `buyerPhone`, `brand` fields → replace `<Input>`
4. **`AddEditPart.tsx`** — Brand and Category already use `<Select>` from DB records; no change needed (they already pull from the brands/categories tables)

### Auto-save Logic

When a sale is completed or bill is saved, the service auto-persists any new customer name, phone, or brand value that doesn't already exist in the autocomplete table.

### Settings Management (Optional)

**`src/pages/settings/AutocompleteSettings.tsx`**:
- Lists saved entries grouped by field type
- User can delete individual entries
- Add link to Settings main page

### Files Changed

| File | Change |
|---|---|
| `src/db/database.ts` | Add version 5 with `autocompleteEntries` table |
| `src/types/index.ts` | Add `AutocompleteEntry` interface |
| `src/services/autocompleteService.ts` | New — CRUD + suggestion queries |
| `src/components/ui/autocomplete-input.tsx` | New — reusable autocomplete component |
| `src/pages/BillCreate.tsx` | Swap 3 inputs to `AutocompleteInput` |
| `src/pages/RecordSale.tsx` | Swap 2 inputs to `AutocompleteInput` |
| `src/components/dashboard/QuickSellModal.tsx` | Swap 3 inputs to `AutocompleteInput` |
| `src/pages/settings/AutocompleteSettings.tsx` | New — manage saved entries |
| `src/pages/Settings.tsx` | Add link to autocomplete settings |
| `src/App.tsx` | Add route for autocomplete settings |

