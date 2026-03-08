import { Card, CardContent } from '@/components/ui/card';
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';
import { Trophy, TrendingUp, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TopPartData {
  partId: string;
  partName: string;
  sku: string;
  quantitySold: number;
  totalRevenue: number;
  totalProfit: number;
}

interface TopSellingPartsProps {
  data: TopPartData[];
  title?: string;
}

export function TopSellingParts({ data, title = "Top Sellers" }: TopSellingPartsProps) {
  const { formatFull } = useCurrencyFormat();

  if (data.length === 0) return null;

  const maxQty = Math.max(...data.map(d => d.quantitySold), 1);

  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1: return { bg: 'bg-amber-500/15', text: 'text-amber-500', icon: Crown };
      case 2: return { bg: 'bg-slate-400/15', text: 'text-slate-400', icon: null };
      case 3: return { bg: 'bg-orange-600/15', text: 'text-orange-600', icon: null };
      default: return { bg: 'bg-muted/50', text: 'text-muted-foreground', icon: null };
    }
  };

  return (
    <Card className="bg-card border-border/30 shadow-sm overflow-hidden rounded-2xl">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-amber-500/10 flex items-center justify-center">
            <Trophy className="h-4 w-4 text-amber-500" />
          </div>
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>

        <div className="space-y-2.5">
          {data.map((part, index) => {
            const rank = index + 1;
            const style = getRankStyle(rank);
            const barWidth = (part.quantitySold / maxQty) * 100;

            return (
              <div
                key={part.partId}
                className="relative rounded-xl p-3 bg-muted/20 border border-border/20 overflow-hidden"
              >
                {/* Progress bar background */}
                <div
                  className="absolute inset-y-0 left-0 bg-primary/[0.04] rounded-xl transition-all duration-700"
                  style={{ width: `${barWidth}%` }}
                />

                <div className="relative flex items-center gap-3">
                  {/* Rank badge */}
                  <div
                    className={cn(
                      'w-7 h-7 rounded-lg flex items-center justify-center shrink-0 text-xs font-bold',
                      style.bg, style.text,
                    )}
                  >
                    {style.icon ? <style.icon className="h-3.5 w-3.5" /> : rank}
                  </div>

                  {/* Product info */}
                  <div className="min-w-0 flex-1">
                    <p className="text-xs font-semibold truncate">{part.partName}</p>
                    <p className="text-[10px] text-muted-foreground/60">
                      {part.quantitySold} units · SKU: {part.sku}
                    </p>
                  </div>

                  {/* Revenue */}
                  <div className="text-right shrink-0">
                    <p className="text-xs font-bold whitespace-nowrap">{formatFull(part.totalRevenue)}</p>
                    <p className="text-[10px] text-emerald-500 flex items-center justify-end gap-0.5 whitespace-nowrap">
                      <TrendingUp className="h-2.5 w-2.5" />
                      {formatFull(part.totalProfit)}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
    </Card>
  );
}
