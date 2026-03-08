import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
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

const CUSTOM_VALUE = 'custom';

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

  const handleValueChange = (value: string) => {
    if (value === CUSTOM_VALUE) {
      setIsCustom(true);
    } else {
      setIsCustom(false);
      onCustomStartChange?.(undefined);
      onCustomEndChange?.(undefined);
      onRangeChange(Number(value));
    }
  };

  const currentValue = isCustom ? CUSTOM_VALUE : String(selectedRangeIndex);
  const currentLabel = isCustom
    ? 'Custom Range'
    : dateRanges[selectedRangeIndex]?.label ?? 'Select';

  const isCustomActive = isCustom && customStartDate && customEndDate;

  const displayRange = isCustomActive
    ? `${format(customStartDate, 'dd MMM yyyy')} — ${format(customEndDate, 'dd MMM yyyy')}`
    : dateRanges[selectedRangeIndex]
      ? `${format(dateRanges[selectedRangeIndex].startDate, 'dd MMM yyyy')} — ${format(dateRanges[selectedRangeIndex].endDate, 'dd MMM yyyy')}`
      : '';

  return (
    <div className="space-y-3">
      {/* Dropdown selector */}
      <Select value={currentValue} onValueChange={handleValueChange}>
        <SelectTrigger
          className={cn(
            'w-full h-12 rounded-xl border-border/50 bg-card px-4',
            'text-sm font-semibold shadow-sm',
            'focus:ring-primary/30 focus:border-primary/60',
          )}
        >
          <div className="flex items-center gap-2.5 w-full">
            <CalendarIcon className="h-4 w-4 text-primary shrink-0" />
            <SelectValue placeholder="Select Time Range">
              {currentLabel}
            </SelectValue>
          </div>
        </SelectTrigger>
        <SelectContent className="rounded-xl">
          {dateRanges.map((range, index) => (
            <SelectItem
              key={index}
              value={String(index)}
              className="text-sm rounded-lg"
            >
              {range.label}
            </SelectItem>
          ))}
          <SelectItem value={CUSTOM_VALUE} className="text-sm rounded-lg">
            Custom Range
          </SelectItem>
        </SelectContent>
      </Select>

      {/* Custom date pickers */}
      {isCustom && onCustomStartChange && onCustomEndChange && (
        <div className="flex gap-2 items-end p-3 rounded-xl bg-muted/30 border border-border/30">
          <div className="flex-1 space-y-1">
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              From
            </label>
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
            <label className="text-[10px] font-medium text-muted-foreground uppercase tracking-wider">
              To
            </label>
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
