import { TrendingUp, TrendingDown, Award, AlertCircle, BarChart3 } from 'lucide-react';
import { formatCurrencyShort } from '@/utils/currency';
import { cn } from '@/lib/utils';

interface InsightsPanelProps {
  salesGrowth: number; // percentage
  topProduct: { name: string; qty: number } | null;
  lowestProduct: { name: string; qty: number } | null;
  avgDailySales: number;
  profitMargin: number;
}

export function InsightsPanel({
  salesGrowth,
  topProduct,
  lowestProduct,
  avgDailySales,
  profitMargin,
}: InsightsPanelProps) {
  const insights = [
    {
      icon: salesGrowth >= 0 ? TrendingUp : TrendingDown,
      label: 'Sales Growth',
      value: `${salesGrowth >= 0 ? '+' : ''}${salesGrowth.toFixed(1)}%`,
      color: salesGrowth >= 0 ? 'text-emerald-500' : 'text-red-400',
      bgColor: salesGrowth >= 0 ? 'bg-emerald-500/10' : 'bg-red-400/10',
    },
    {
      icon: Award,
      label: 'Top Seller',
      value: topProduct ? `${topProduct.name}` : 'N/A',
      subValue: topProduct ? `${topProduct.qty} sold` : undefined,
      color: 'text-amber-500',
      bgColor: 'bg-amber-500/10',
    },
    {
      icon: BarChart3,
      label: 'Daily Avg',
      value: `Rs ${formatCurrencyShort(avgDailySales).replace('Rs ', '')}`,
      color: 'text-blue-400',
      bgColor: 'bg-blue-400/10',
    },
    {
      icon: AlertCircle,
      label: 'Profit Margin',
      value: `${profitMargin.toFixed(1)}%`,
      color: profitMargin >= 20 ? 'text-emerald-500' : 'text-amber-500',
      bgColor: profitMargin >= 20 ? 'bg-emerald-500/10' : 'bg-amber-500/10',
    },
  ];

  return (
    <div className="space-y-2">
      <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/60 px-1">
        Quick Insights
      </h3>
      <div className="grid grid-cols-2 gap-2">
        {insights.map((insight, i) => {
          const Icon = insight.icon;
          return (
            <div
              key={i}
              className="flex items-center gap-2.5 p-3 rounded-xl bg-card border border-border/30 shadow-sm"
            >
              <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', insight.bgColor)}>
                <Icon className={cn('h-4 w-4', insight.color)} />
              </div>
              <div className="min-w-0 flex-1">
                <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider">{insight.label}</p>
                <p className={cn('text-sm font-bold truncate', insight.color)}>{insight.value}</p>
                {insight.subValue && (
                  <p className="text-[10px] text-muted-foreground/50">{insight.subValue}</p>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
