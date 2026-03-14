import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, X } from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import type { DateRange } from '@/types';

interface TimeRangeSelectorProps {
  dateRanges: DateRange[];
  selectedRangeIndex: number;
  onRangeChange: (index: number) => void;
  customStartDate?: Date;
  customEndDate?: Date;
  onCustomStartChange?: (date: Date | undefined) => void;
  onCustomEndChange?: (date: Date | undefined) => void;
}

// Shortened labels for the pill bar
const SHORT_LABELS: Record<string, string> = {
  'Today': 'Day',
  'Last 3 Days': '3D',
  'This Week': 'Week',
  'Last 2 Weeks': '2W',
  'Last 3 Weeks': '3W',
  'This Month': 'Month',
  'Previous Month': 'Prev Mo',
  'Last 2 Months': '2M',
  'Last 3 Months': '3M',
  'Last 6 Months': '6M',
  'Last 1 Year': 'Year',
};

export function TimeRangeSelector({
  dateRanges,
  selectedRangeIndex,
  onRangeChange,
  customStartDate,
  customEndDate,
  onCustomStartChange,
  onCustomEndChange,
}: TimeRangeSelectorProps) {
  const [isCustom, setIsCustom] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const activeRef = useRef<HTMLButtonElement>(null);

  // Scroll active pill into view
  useEffect(() => {
    if (activeRef.current && scrollRef.current) {
      const container = scrollRef.current;
      const el = activeRef.current;
      const left = el.offsetLeft - container.offsetWidth / 2 + el.offsetWidth / 2;
      container.scrollTo({ left: Math.max(0, left), behavior: 'smooth' });
    }
  }, [selectedRangeIndex, isCustom]);

  const isCustomActive = isCustom && customStartDate && customEndDate;

  const displayRange = isCustomActive
    ? `${format(customStartDate, 'dd MMM')} — ${format(customEndDate, 'dd MMM')}`
    : dateRanges[selectedRangeIndex]
      ? `${format(dateRanges[selectedRangeIndex].startDate, 'dd MMM')} — ${format(dateRanges[selectedRangeIndex].endDate, 'dd MMM')}`
      : '';

  const handleSelect = (index: number) => {
    setIsCustom(false);
    onCustomStartChange?.(undefined);
    onCustomEndChange?.(undefined);
    onRangeChange(index);
  };

  return (
    <div className="space-y-2.5">
      {/* Horizontal scrollable pill bar */}
      <div
        ref={scrollRef}
        className="flex items-center gap-1.5 overflow-x-auto no-scrollbar pb-0.5 -mx-1 px-1"
        style={{ WebkitOverflowScrolling: 'touch' }}
      >
        {dateRanges.map((range, index) => {
          const isActive = !isCustom && selectedRangeIndex === index;
          const shortLabel = SHORT_LABELS[range.label] || range.label;
          return (
            <button
              key={index}
              ref={isActive ? activeRef : undefined}
              onClick={() => handleSelect(index)}
              className={cn(
                'shrink-0 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-200 whitespace-nowrap',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-sm'
                  : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/30',
              )}
            >
              {shortLabel}
            </button>
          );
        })}
        {/* Custom pill */}
        <button
          ref={isCustom ? activeRef : undefined}
          onClick={() => setIsCustom(true)}
          className={cn(
            'shrink-0 flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold transition-all duration-200 whitespace-nowrap',
            isCustom
              ? 'bg-primary text-primary-foreground shadow-sm'
              : 'bg-muted/50 text-muted-foreground hover:bg-muted hover:text-foreground border border-border/30',
          )}
        >
          <CalendarIcon className="h-3 w-3" />
          Custom
        </button>
      </div>

      {/* Custom date pickers */}
      {isCustom && onCustomStartChange && onCustomEndChange && (
        <div className="flex gap-2 items-end p-3 rounded-xl bg-muted/30 border border-border/30 animate-fade-in">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">From</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'w-full justify-start text-left h-9 text-xs rounded-lg',
                    !customStartDate && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-1.5 h-3 w-3" />
                  {customStartDate ? format(customStartDate, 'dd MMM yy') : 'Start'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={customStartDate}
                  onSelect={onCustomStartChange}
                  initialFocus
                  className="p-3 pointer-events-auto"
                  disabled={(date) => date > new Date()}
                />
              </PopoverContent>
            </Popover>
          </div>
          <span className="text-xs text-muted-foreground pb-2">→</span>
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">To</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    'w-full justify-start text-left h-9 text-xs rounded-lg',
                    !customEndDate && 'text-muted-foreground',
                  )}
                >
                  <CalendarIcon className="mr-1.5 h-3 w-3" />
                  {customEndDate ? format(customEndDate, 'dd MMM yy') : 'End'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={customEndDate}
                  onSelect={onCustomEndChange}
                  initialFocus
                  className="p-3 pointer-events-auto"
                  disabled={(date) =>
                    date > new Date() ||
                    (customStartDate ? date < customStartDate : false)
                  }
                />
              </PopoverContent>
            </Popover>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9 shrink-0"
            onClick={() => {
              setIsCustom(false);
              onCustomStartChange?.(undefined);
              onCustomEndChange?.(undefined);
            }}
          >
            <X className="h-3.5 w-3.5" />
          </Button>
        </div>
      )}

      {/* Active range display */}
      <div className="text-center">
        <span className="text-[11px] text-muted-foreground/60">{displayRange}</span>
      </div>
    </div>
  );
}
