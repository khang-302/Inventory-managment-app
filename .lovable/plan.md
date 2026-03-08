

## Plan: Redesign Invoice to Match Reference Image

The reference image shows a **dark teal header** design with **gold accent bar**, **teal table headers**, a **split gold/teal Grand Total bar**, and a **dark teal footer with colored icon circles** — completely different from the current light/white design.

### Color Palette (from reference)

```text
Dark Teal:     #1B4D4D (header, table header, footer, invoice-to header)
Gold/Mustard:  #C9A020 (accent bar, grand total left, bill number)
Red/Orange:    #CC3333 (footer icon circles)
White:         #FFFFFF (text on dark, background)
Charcoal:      #2B2B2B (body text)
Light Gray:    #F0F0F0 (alternating rows)
Gray:          #888888 (secondary text)
```

### Changes to `BillPreviewTemplate.tsx`

1. **Header**: Dark teal background, white shop name text, white tagline, circular logo with gold double-border
2. **Gold accent bar**: Full-width mustard/gold stripe below header
3. **"Invoice From"**: White background with dark text
4. **"Invoice To" block**: Teal header row with white text, white body
5. **Table**: Teal header with white bold text, gray borders, light alternating rows
6. **Grand Total bar**: Full-width split — left half gold, right half teal, white text
7. **Terms & Payment**: Same structure, below table
8. **Footer**: Dark teal background with 3 columns, each having a **red/orange circular icon** (location pin, phone, globe drawn as simple SVG) above the text

### Changes to `billPdf.ts`

Mirror all the same changes:
1. **Header**: Teal filled rectangle, white circle with gold border for logo, white text
2. **Gold bar**: Full-width gold rectangle below header
3. **Invoice To**: Teal header row in the bordered block
4. **Table**: `autoTable` with teal `fillColor` on head, white text
5. **Grand Total**: Two adjacent rectangles (gold left, teal right) with white text
6. **Footer**: Teal rectangle at bottom, draw red filled circles for icons, then draw simple geometric shapes inside (pin=triangle+circle, phone=rectangle, globe=circle with lines) in white
7. **Terms & Payment**: Ensure rendered before footer position

### Icon Strategy (no icon fonts)

**Preview**: Inline SVG elements for location pin, phone handset, and globe
**PDF**: Simple geometric shapes drawn with jsPDF primitives (circles, triangles, lines) — white shapes on red circles, matching the reference's icon style

### Files to Edit
- `src/components/bill/BillPreviewTemplate.tsx` — full redesign
- `src/utils/billPdf.ts` — full redesign to match

