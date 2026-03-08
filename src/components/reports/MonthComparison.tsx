import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';
import { ArrowUpRight, ArrowDownRight, Minus, CalendarRange } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Sale } from '@/types';
import { startOfMonth, endOfMonth, subMonths, format } from 'date-fns';
import { toSafeNumber, safeAdd } from '@/utils/safeNumber';

interface MonthComparisonProps {
  sales: Sale[];
}

interface MonthMetrics {
  revenue: number;
  profit: number;
  orders: number;
  itemsSold: number;
}

function computeMetrics(sales: Sale[], start: Date, end: Date): MonthMetrics {
  let revenue = 0, profit = 0, orders = 0, itemsSold = 0;
  for (const s of sales) {
    const d = new Date(s.createdAt);
    if (d >= start && d <= end) {
      revenue = safeAdd(revenue, toSafeNumber(s.totalAmount, 0));
      profit = safeAdd(profit, toSafeNumber(s.profit, 0));
      orders++;
      itemsSold += toSafeNumber(s.quantity, 0);
    }
  }
  return { revenue, profit, orders, itemsSold };
}

function ChangeIndicator({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) {
    return <Minus className="h-3 w-3 text-muted-foreground" />;
  }
  const pct = previous === 0 ? 100 : ((current - previous) / previous) * 100;
  const isUp = pct > 0;
  const isFlat = pct === 0;

  if (isFlat) return <Minus className="h-3 w-3 text-muted-foreground" />;

  return (
    <span className={cn(
      'inline-flex items-center gap-0.5 text-[10px] font-bold',
      isUp ? 'text-emerald-500' : 'text-red-500'
    )}>
      {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(pct).toFixed(0)}%
    </span>
  );
}

function MetricRow({ label, current, previous, isCurrency }: {
  label: string; current: number; previous: number; isCurrency?: boolean;
}) {
  const { formatFull } = useCurrencyFormat();
  const fmt = (v: number) => isCurrency ? formatFull(v) : v.toLocaleString();
  return (
    <div className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2 py-2 border-b border-border/20 last:border-0">
      <span className="text-[11px] font-medium text-muted-foreground">{label}</span>
      <span className="text-[12px] font-semibold text-right">{fmt(current)}</span>
      <span className="text-[12px] font-medium text-muted-foreground/70 text-right">{fmt(previous)}</span>
      <div className="w-10 flex justify-end">
        <ChangeIndicator current={current} previous={previous} />
      </div>
    </div>
  );
}

export function MonthComparison({ sales }: MonthComparisonProps) {
  const { current, previous, currentLabel, previousLabel } = useMemo(() => {
    const now = new Date();
    const thisStart = startOfMonth(now);
    const thisEnd = endOfMonth(now);
    const lastStart = startOfMonth(subMonths(now, 1));
    const lastEnd = endOfMonth(subMonths(now, 1));

    return {
      current: computeMetrics(sales, thisStart, thisEnd),
      previous: computeMetrics(sales, lastStart, lastEnd),
      currentLabel: format(now, 'MMM yyyy'),
      previousLabel: format(subMonths(now, 1), 'MMM yyyy'),
    };
  }, [sales]);

  return (
    <Card className="bg-card border-border/30 shadow-sm overflow-hidden rounded-2xl">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <CalendarRange className="h-4 w-4 text-primary" />
          </div>
          <div>
            <h3 className="text-sm font-semibold">Month Comparison</h3>
            <p className="text-[10px] text-muted-foreground">{currentLabel} vs {previousLabel}</p>
          </div>
        </div>

        {/* Column headers */}
        <div className="grid grid-cols-[1fr_1fr_1fr_auto] items-center gap-2 pb-1.5 mb-1 border-b border-border/40">
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-semibold">Metric</span>
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-semibold text-right">Current</span>
          <span className="text-[9px] uppercase tracking-wider text-muted-foreground/50 font-semibold text-right">Previous</span>
          <span className="w-10 text-[9px] uppercase tracking-wider text-muted-foreground/50 font-semibold text-right">Chg</span>
        </div>

        {/* Metric rows */}
        <MetricRow label="Revenue" current={current.revenue} previous={previous.revenue} isCurrency />
        <MetricRow label="Profit" current={current.profit} previous={previous.profit} isCurrency />
        <MetricRow label="Orders" current={current.orders} previous={previous.orders} />
        <MetricRow label="Items Sold" current={current.itemsSold} previous={previous.itemsSold} />
      </CardContent>
    </Card>
  );
}
