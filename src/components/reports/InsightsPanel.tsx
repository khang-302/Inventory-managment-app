import { TrendingUp, TrendingDown, Award, AlertCircle, BarChart3, Lightbulb } from 'lucide-react';
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';
import { Card, CardContent } from '@/components/ui/card';
import { cn } from '@/lib/utils';

interface InsightsPanelProps {
  salesGrowth: number;
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
  const { formatValue } = useCurrencyFormat();
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
      value: `Rs ${formatValue(avgDailySales)}`,
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
    <Card className="bg-card border-border/30 shadow-sm overflow-hidden rounded-2xl">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <Lightbulb className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">Quick Insights</h3>
        </div>
        <div className="grid grid-cols-2 gap-2">
          {insights.map((insight, i) => {
            const Icon = insight.icon;
            return (
              <div
                key={i}
                className="flex items-center gap-2.5 p-3 rounded-xl bg-muted/20 border border-border/20 overflow-hidden"
              >
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center shrink-0', insight.bgColor)}>
                  <Icon className={cn('h-4 w-4', insight.color)} />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[10px] text-muted-foreground/60 uppercase tracking-wider whitespace-nowrap">{insight.label}</p>
                  <p className={cn('text-sm font-bold truncate', insight.color)}>{insight.value}</p>
                  {insight.subValue && (
                    <p className="text-[10px] text-muted-foreground/50">{insight.subValue}</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
