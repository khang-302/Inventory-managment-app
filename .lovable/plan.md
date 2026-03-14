

## Plan: Searchable Part Selector on Record Sale

### Problem
The current part selector uses a Radix `<Select>` dropdown which only supports scrolling — no type-to-search.

### Solution
Replace the `<Select>` with a **Combobox** pattern using the existing `<Command>` (cmdk) + `<Popover>` components. This gives both type-to-filter AND scroll-to-browse in one control.

### File: `src/pages/RecordSale.tsx`

1. **Replace imports**: Swap `Select/SelectContent/SelectItem/SelectTrigger/SelectValue` with `Popover/PopoverTrigger/PopoverContent` + `Command/CommandInput/CommandList/CommandEmpty/CommandGroup/CommandItem`
2. **Add local state**: `partSearchOpen` boolean to control popover
3. **Replace the Select block (lines 244-258)** with a Popover+Command combo:
   - `PopoverTrigger` styled like a SelectTrigger (shows selected part name or placeholder)
   - `CommandInput` for typing to filter parts by name or SKU
   - `CommandList` with `CommandGroup` rendering filtered parts (name + available stock)
   - On item select: call `handlePartSelect(partId)`, close popover
4. **No other changes** — cart, submission, customer info all stay the same

This is a contained change to ~20 lines in one file.

