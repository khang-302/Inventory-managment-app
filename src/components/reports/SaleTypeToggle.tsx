import { ShoppingBag, Zap, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';

export type SaleType = 'all' | 'new' | 'quick';

interface SaleTypeToggleProps {
  saleType: SaleType;
  onChange: (type: SaleType) => void;
  counts?: { all: number; new: number; quick: number };
}

const options: { value: SaleType; label: string; icon: React.ReactNode; activeClass: string }[] = [
  {
    value: 'all',
    label: 'All',
    icon: <LayoutGrid className="h-3.5 w-3.5" />,
    activeClass: 'bg-primary text-primary-foreground shadow-sm',
  },
  {
    value: 'new',
    label: 'New Sale',
    icon: <ShoppingBag className="h-3.5 w-3.5" />,
    activeClass: 'bg-blue-500 text-white shadow-sm',
  },
  {
    value: 'quick',
    label: 'Quick Sale',
    icon: <Zap className="h-3.5 w-3.5" />,
    activeClass: 'bg-amber-500 text-white shadow-sm',
  },
];

export function SaleTypeToggle({ saleType, onChange, counts }: SaleTypeToggleProps) {
  return (
    <div className="flex items-center gap-1 p-1 rounded-xl bg-muted/50 border border-border/30">
      {options.map((opt) => {
        const isActive = saleType === opt.value;
        const count = counts?.[opt.value];
        return (
          <button
            key={opt.value}
            onClick={() => onChange(opt.value)}
            className={cn(
              'flex-1 flex items-center justify-center gap-1.5 py-2 px-2 rounded-lg text-[11px] font-semibold transition-all duration-200',
              isActive ? opt.activeClass : 'text-muted-foreground hover:text-foreground hover:bg-muted/80',
            )}
          >
            {opt.icon}
            <span className="whitespace-nowrap">{opt.label}</span>
            {count !== undefined && count > 0 && (
              <span className={cn(
                'text-[9px] font-bold min-w-[16px] h-4 flex items-center justify-center rounded-full px-1',
                isActive ? 'bg-white/20' : 'bg-muted-foreground/10',
              )}>
                {count > 999 ? '999+' : count}
              </span>
            )}
          </button>
        );
      })}
    </div>
  );
}
