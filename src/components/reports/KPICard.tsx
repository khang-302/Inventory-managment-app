import { cn } from '@/lib/utils';
import { formatCurrencyShort } from '@/utils/currency';
import { Skeleton } from '@/components/ui/skeleton';

interface KPICardProps {
  title: string;
  value: number | string;
  icon: React.ReactNode;
  isCurrency?: boolean;
  suffix?: string;
  className?: string;
  highlight?: boolean;
  loading?: boolean;
  accentColor?: string;
}

export function KPICard({
  title,
  value,
  icon,
  isCurrency = false,
  suffix = '',
  className,
  highlight,
  loading,
  accentColor,
}: KPICardProps) {
  const formatValue = () => {
    if (isCurrency && typeof value === 'number') {
      const abs = Math.abs(value);
      const sign = value < 0 ? '-' : '';
      if (abs >= 10000000) return `${sign}${(abs / 10000000).toFixed(2)} Cr`;
      if (abs >= 100000) return `${sign}${(abs / 100000).toFixed(2)} Lac`;
      if (abs >= 1000) return `${sign}${(abs / 1000).toFixed(1)}K`;
      return formatCurrencyShort(value).replace('Rs ', '');
    }
    return `${value}${suffix}`;
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-4',
        'bg-card border border-border/40',
        'shadow-sm hover:shadow-md transition-shadow duration-300',
        highlight && 'border-destructive/30',
        className,
      )}
    >
      {/* Accent line at top */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
        style={{
          background: accentColor || 'hsl(var(--primary))',
          opacity: 0.8,
        }}
      />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">
            {title}
          </p>
          {loading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <div className="flex items-baseline gap-1">
              {isCurrency && (
                <span className="text-xs font-medium text-muted-foreground">Rs</span>
              )}
              <p className="text-xl font-bold tracking-tight">{formatValue()}</p>
            </div>
          )}
        </div>
        <div
          className={cn(
            'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
            'bg-primary/10',
            highlight && 'bg-destructive/10',
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
