

## Plan: Make PDF Bills Match Image Bill Design

### Problem
The PDF generator (`billPdf.ts`) uses hardcoded TEAL/GOLD/RED colors, ignoring the user's selected color theme. The image bill template (`BillPreviewTemplate.tsx`) dynamically uses `getBillPalette(settings.billColorTheme)` for all colors. This causes the PDF and image to look completely different.

### Key Differences to Fix

| Element | Image Bill (correct) | PDF Bill (broken) |
|---|---|---|
| All colors | Dynamic from `BillColorPalette` | Hardcoded TEAL/GOLD/RED |
| Header accent bar | `accent1 → accent2` gradient | Hardcoded GOLD |
| Table header | `headerBg` | Hardcoded TEAL |
| Grand total bar | `totalGradientStart/End` + `totalAmountBg` | Hardcoded GOLD + TEAL |
| Footer banner | `accent2 → accent1` gradient pill | Red 3-segment bar |
| Footer icon circles | `iconCircle1`, `iconCircle2` | Hardcoded RED |
| Footer text color | `silver` from palette | Hardcoded white |
| Footer message | Shown with muted text | Missing |
| Invoice To border | `lightSilver` rounded | Hardcoded gray |
| Payment box | Left accent border, `warmBg` | Dashed gold border |
| Terms underline | `accent2` color | Hardcoded GOLD |

### Solution

Rewrite `src/utils/billPdf.ts` to:

1. **Import and use `getBillPalette`** — derive all RGB colors from the user's selected `billColorTheme`
2. **Add hex-to-RGB helper** — palette uses hex strings, jsPDF needs `[r,g,b]` tuples
3. **Match header exactly** — top accent gradient bar (approximated as accent1), headerBg background, accent1 logo ring, accent divider with diamond
4. **Match "Invoice From" bar** — pale background, lightSilver border
5. **Match Invoice To block** — headerBg header row, accent1 for bill number, lightSilver border with rounded rect
6. **Match table** — headerBg for head fill, pale for alternate rows, lightSilver for grid lines
7. **Match grand total bar** — left side uses totalGradientStart→End (approximate with totalGradientEnd), right side uses totalAmountBg with totalAmountText
8. **Match footer** — accent gradient separator line, headerBg background, accent gradient pill banner, iconCircle1/iconCircle2 for icon circles, silver for text, include footerMessage
9. **Match terms/payment** — accent2 underline for terms title, textPrimary for titles, warmBg + accent1 left border for payment box
10. **Match watermark colors** — use palette accent1/silver instead of hardcoded values

### Files Modified
1. `src/utils/billPdf.ts` — Full rewrite of color logic and footer/total bar to match image template

### What Stays Unchanged
- `src/components/bill/BillPreviewTemplate.tsx` — not touched
- All bill data fields and structure — same data, same sections
- Overall layout flow (header → invoice from → invoice to → table → total → terms/payment → footer)

