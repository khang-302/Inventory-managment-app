

## Plan: Add Animated Number Counters to KPI Cards

### Approach
Create a `useCountUp` hook that animates numbers from 0 to the target value using `requestAnimationFrame`. Integrate it into `KPICard.tsx`.

### Changes

**1. Create `src/hooks/useCountUp.ts`**
- Custom hook accepting `end` value, `duration` (default ~800ms), and `isCurrency` flag
- Uses `requestAnimationFrame` with easeOutExpo easing for a satisfying deceleration effect
- Returns the current animated number value
- Re-triggers when `end` changes

**2. Update `src/components/reports/KPICard.tsx`**
- Import and use `useCountUp` for numeric values
- Apply the hook to animate the displayed number from 0 to the target
- Keep the existing formatting logic (Cr/Lac/K suffixes, Rs prefix) applied to the animated value
- Only animate when not in `loading` state

