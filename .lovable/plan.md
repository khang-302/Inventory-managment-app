

## Plan: Fix KPI Card Truncation in Reports

### Problem
Large currency values (e.g. Rs 523,904,526) get truncated with ellipsis because the card uses `truncate` on the value text and the font size doesn't scale down enough for very long numbers.

### Changes — Single File: `src/components/reports/KPICard.tsx`

1. **Remove `truncate`** from the value `<p>` — replace with `break-all` or allow wrapping so numbers are never cut off
2. **Add more aggressive font scaling** — extend the `textSize` logic to scale down to `text-sm` or `text-xs` for very long formatted values (12+ chars)
3. **Remove `overflow-hidden`** from the value container div
4. **Increase card padding** — bump from `p-4` to `p-4 pb-5` for more vertical breathing room

No other files will be modified.

