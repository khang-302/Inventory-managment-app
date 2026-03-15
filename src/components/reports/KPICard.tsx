import { cn } from '@/lib/utils';
import { Skeleton } from '@/components/ui/skeleton';
import { useCountUp } from '@/hooks/useCountUp';
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';

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
  const numericEnd = typeof value === 'number' ? value : 0;
  const animatedValue = useCountUp(loading ? 0 : numericEnd, 800);
  const { formatValue } = useCurrencyFormat();

  const formatted = (() => {
    if (isCurrency && typeof value === 'number') {
      return formatValue(animatedValue);
    }
    if (typeof value === 'number') {
      return `${Math.round(animatedValue)}${suffix}`;
    }
    return `${value}${suffix}`;
  })();

  const textSize = formatted.length > 14 ? 'text-xs' : formatted.length > 12 ? 'text-sm' : formatted.length > 10 ? 'text-base' : formatted.length > 8 ? 'text-lg' : 'text-xl';

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-4 pb-5',
        'bg-card border border-border/40',
        'shadow-sm hover:shadow-md transition-all duration-300',
        highlight && 'border-destructive/30',
        className,
      )}
    >
      {/* Accent gradient line at top */}
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
        style={{
          background: accentColor
            ? `linear-gradient(90deg, ${accentColor}, ${accentColor}99)`
            : 'hsl(var(--primary))',
        }}
      />

      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1.5">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70 whitespace-nowrap">
            {title}
          </p>
          {loading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <div className="flex items-baseline gap-1">
              {isCurrency && (
                <span className="text-xs font-medium text-muted-foreground shrink-0">Rs</span>
              )}
              <p className={cn(textSize, 'font-bold tracking-tight tabular-nums break-all')}>{formatted}</p>
            </div>
          )}
        </div>
        <div
          className={cn(
            'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
            'bg-primary/10 border border-primary/10',
            highlight && 'bg-destructive/10 border-destructive/10',
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}
