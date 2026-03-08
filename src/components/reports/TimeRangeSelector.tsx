import { useState } from 'react';
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

export function TimeRangeSelector({
  dateRanges,
  selectedRangeIndex,
  onRangeChange,
  customStartDate,
  customEndDate,
  onCustomStartChange,
  onCustomEndChange,
}: TimeRangeSelectorProps) {
  const [showCustom, setShowCustom] = useState(false);
  const isCustomActive = showCustom && customStartDate && customEndDate;

  const handlePillClick = (index: number) => {
    setShowCustom(false);
    onRangeChange(index);
  };

  // Show a compact subset of ranges as pills
  const quickRanges = [
    { label: 'Today', index: 0 },
    { label: 'Week', index: 2 },
    { label: 'Month', index: 4 },
    { label: '3 Months', index: 7 },
    { label: 'Year', index: 10 },
  ].filter(r => r.index < dateRanges.length);

  return (
    <div className="space-y-3">
      {/* Horizontal scrollable pill tabs */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-1 px-1">
        {quickRanges.map(r => (
          <button
            key={r.index}
            onClick={() => handlePillClick(r.index)}
            className={cn(
              'shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200',
              'border',
              !showCustom && selectedRangeIndex === r.index
                ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
                : 'bg-card text-muted-foreground border-border/50 hover:border-primary/40 hover:text-foreground',
            )}
          >
            {r.label}
          </button>
        ))}
        <button
          onClick={() => setShowCustom(true)}
          className={cn(
            'shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-200',
            'border flex items-center gap-1.5',
            isCustomActive
              ? 'bg-primary text-primary-foreground border-primary shadow-md shadow-primary/20'
              : 'bg-card text-muted-foreground border-border/50 hover:border-primary/40 hover:text-foreground',
          )}
        >
          <CalendarIcon className="h-3 w-3" />
          Custom
        </button>
      </div>

      {/* Custom Date Pickers */}
      {showCustom && onCustomStartChange && onCustomEndChange && (
        <div className="flex gap-2 items-end p-3 rounded-xl bg-muted/30 border border-border/30">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">From</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  size="sm"
                  className={cn(
                    "w-full justify-start text-left h-9 text-xs",
                    !customStartDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-1.5 h-3 w-3" />
                  {customStartDate ? format(customStartDate, "dd MMM yy") : "Start"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={customStartDate}
                  onSelect={onCustomStartChange}
                  initialFocus
                  className="pointer-events-auto"
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
                    "w-full justify-start text-left h-9 text-xs",
                    !customEndDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-1.5 h-3 w-3" />
                  {customEndDate ? format(customEndDate, "dd MMM yy") : "End"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="end">
                <Calendar
                  mode="single"
                  selected={customEndDate}
                  onSelect={onCustomEndChange}
                  initialFocus
                  className="pointer-events-auto"
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
              setShowCustom(false);
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
        <span className="text-[11px] text-muted-foreground/60">
          {isCustomActive
            ? `${format(customStartDate, 'dd MMM yyyy')} — ${format(customEndDate, 'dd MMM yyyy')}`
            : `${format(dateRanges[selectedRangeIndex].startDate, 'dd MMM yyyy')} — ${format(dateRanges[selectedRangeIndex].endDate, 'dd MMM yyyy')}`
          }
        </span>
      </div>
    </div>
  );
}
