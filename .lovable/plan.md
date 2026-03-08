

# Bill Premium Enhancements — Three Tasks

## 1. Refine Header Proportions for Variable Shop Name Lengths

**Problem**: The header uses a fixed `fontSize: 28px` / `setFontSize(20)` which can overflow or look too small for very long or very short shop names.

**Solution**: Add dynamic font sizing based on shop name length.

| File | Change |
|------|--------|
| `BillPreviewTemplate.tsx` | Compute `fontSize` dynamically: 28px for ≤16 chars, 22px for ≤24 chars, 18px for longer. Add `overflow: hidden; textOverflow: ellipsis; whiteSpace: nowrap` as safety. |
| `billPdf.ts` | Same dynamic sizing logic: `setFontSize(20)` for short, `setFontSize(16)` for medium, `setFontSize(13)` for long names. Use `splitTextToSize` for very long names to wrap to 2 lines. |

## 2. Add Watermark / Background Pattern to Bill Body

**Problem**: The bill body area is plain white — user wants a premium watermark/pattern option.

**Solution**: Add a configurable watermark feature in Bill Designer settings.

### Type Changes (`src/types/bill.ts`)
Add to `BillSettings`:
```typescript
watermarkEnabled: boolean;
watermarkText: string;  // e.g. "AMEER AUTOS" or custom
watermarkOpacity: number; // 0.03 to 0.1
```

### Default Settings (`src/services/billService.ts`)
Add defaults:
```typescript
watermarkEnabled: false,
watermarkText: '',  // defaults to shopName if empty
watermarkOpacity: 0.05,
```

### Bill Designer UI (`src/pages/BillSettings.tsx`)
Add a new card section "Watermark & Background" with:
- Toggle switch to enable/disable
- Text input for watermark text (placeholder: shop name)
- Slider for opacity (3%–10%)

### Bill Preview (`BillPreviewTemplate.tsx`)
When `watermarkEnabled`, render a repeating diagonal watermark pattern in the body area using CSS:
- Absolutely positioned div covering the body
- Rotated text (-30deg) repeated in a grid pattern
- Very low opacity (from settings)
- `pointerEvents: none` so it doesn't interfere

### PDF Export (`billPdf.ts`)
When `watermarkEnabled`, after drawing the white body background and before content:
- Use `doc.setTextColor()` with very low opacity simulation (light gray like `[240, 240, 240]`)
- Draw the watermark text diagonally across the page using `doc.text()` with rotation
- Repeat in a grid pattern covering the body area

## 3. Testing Verification

The user asked to create a bill and verify — this is a manual action. The implementation above ensures both preview and PDF render consistently.

## Files Modified

| File | Changes |
|------|--------|
| `src/types/bill.ts` | Add `watermarkEnabled`, `watermarkText`, `watermarkOpacity` to `BillSettings` |
| `src/services/billService.ts` | Add watermark defaults |
| `src/pages/BillSettings.tsx` | Add "Watermark & Background" settings card |
| `src/components/bill/BillPreviewTemplate.tsx` | Dynamic header font size + watermark overlay |
| `src/utils/billPdf.ts` | Dynamic header font size + watermark drawing |

