import { useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';
import { ArrowUpRight, ArrowDownRight, Minus, GitCompareArrows } from 'lucide-react';
import { cn } from '@/lib/utils';
import type { Sale } from '@/types';
import { toSafeNumber, safeAdd } from '@/utils/safeNumber';
import type { DateRange } from '@/types';

interface PeriodComparisonBarProps {
  sales: Sale[];
  currentRange: DateRange;
  saleTypeFilter?: (s: Sale) => boolean;
}

interface Metrics {
  revenue: number;
  profit: number;
  orders: number;
  items: number;
}

function computeMetrics(sales: Sale[], start: Date, end: Date, filter?: (s: Sale) => boolean): Metrics {
  let revenue = 0, profit = 0, orders = 0, items = 0;
  for (const s of sales) {
    const d = new Date(s.createdAt);
    if (d >= start && d <= end) {
      if (filter && !filter(s)) continue;
      revenue = safeAdd(revenue, toSafeNumber(s.totalAmount, 0));
      profit = safeAdd(profit, toSafeNumber(s.profit, 0));
      orders++;
      items += toSafeNumber(s.quantity, 0);
    }
  }
  return { revenue, profit, orders, items };
}

function Change({ current, previous }: { current: number; previous: number }) {
  if (previous === 0 && current === 0) return <Minus className="h-3 w-3 text-muted-foreground" />;
  const pct = previous === 0 ? 100 : ((current - previous) / previous) * 100;
  if (pct === 0) return <Minus className="h-3 w-3 text-muted-foreground" />;
  const isUp = pct > 0;
  return (
    <span className={cn('inline-flex items-center gap-0.5 text-[10px] font-bold tabular-nums', isUp ? 'text-emerald-500' : 'text-red-500')}>
      {isUp ? <ArrowUpRight className="h-3 w-3" /> : <ArrowDownRight className="h-3 w-3" />}
      {Math.abs(pct).toFixed(0)}%
    </span>
  );
}

export function PeriodComparisonBar({ sales, currentRange, saleTypeFilter }: PeriodComparisonBarProps) {
  const { formatValue } = useCurrencyFormat();

  const { current, previous } = useMemo(() => {
    const startMs = currentRange.startDate.getTime();
    const endMs = currentRange.endDate.getTime();
    const rangeDays = Math.max(1, Math.ceil((endMs - startMs) / (1000 * 60 * 60 * 24)));
    const prevStart = new Date(startMs - rangeDays * 24 * 60 * 60 * 1000);
    const prevEnd = new Date(startMs - 1);

    return {
      current: computeMetrics(sales, currentRange.startDate, currentRange.endDate, saleTypeFilter),
      previous: computeMetrics(sales, prevStart, prevEnd, saleTypeFilter),
    };
  }, [sales, currentRange, saleTypeFilter]);

  const metrics = [
    { label: 'Revenue', current: current.revenue, previous: previous.revenue, fmt: (v: number) => formatValue(v) },
    { label: 'Profit', current: current.profit, previous: previous.profit, fmt: (v: number) => formatValue(v) },
    { label: 'Orders', current: current.orders, previous: previous.orders, fmt: (v: number) => v.toLocaleString() },
    { label: 'Items', current: current.items, previous: previous.items, fmt: (v: number) => v.toLocaleString() },
  ];

  return (
    <Card className="bg-card border-border/30 shadow-sm overflow-hidden rounded-2xl">
      <CardContent className="p-3">
        <div className="flex items-center gap-1.5 mb-2.5">
          <GitCompareArrows className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider">vs Previous Period</span>
        </div>
        <div className="grid grid-cols-4 gap-2">
          {metrics.map((m) => (
            <div key={m.label} className="text-center space-y-0.5">
              <p className="text-[9px] font-medium text-muted-foreground/60 uppercase tracking-wider">{m.label}</p>
              <p className="text-[13px] font-bold tabular-nums truncate">{m.fmt(m.current)}</p>
              <Change current={m.current} previous={m.previous} />
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
