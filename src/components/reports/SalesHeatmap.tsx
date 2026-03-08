import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Calendar } from 'lucide-react';
import { useMemo } from 'react';
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';

interface SalesHeatmapData {
  date: string; // YYYY-MM-DD format
  value: number;
}

interface SalesHeatmapProps {
  data: SalesHeatmapData[];
  title?: string;
}

// Muted green scale for heatmap - no glow in dark mode
const HEATMAP_COLORS = {
  light: {
    empty: 'hsl(220, 14%, 92%)',
    low: 'hsl(152, 35%, 75%)',
    medium: 'hsl(152, 40%, 60%)',
    high: 'hsl(152, 45%, 48%)',
    max: 'hsl(152, 50%, 38%)',
  },
  dark: {
    empty: 'hsl(220, 12%, 16%)',
    low: 'hsl(152, 30%, 28%)',
    medium: 'hsl(152, 35%, 36%)',
    high: 'hsl(152, 38%, 44%)',
    max: 'hsl(152, 40%, 50%)',
  },
};

export function SalesHeatmap({ data, title = "Sales Activity Heatmap" }: SalesHeatmapProps) {
  const { formatFull } = useCurrencyFormat();
  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
  const colors = isDark ? HEATMAP_COLORS.dark : HEATMAP_COLORS.light;

  const { weeks, maxValue, monthLabels } = useMemo(() => {
    if (data.length === 0) {
      return { weeks: [], maxValue: 0, monthLabels: [] };
    }

    // Create a map of date -> value
    const valueMap = new Map(data.map(d => [d.date, d.value]));
    
    // Get date range
    const dates = data.map(d => new Date(d.date));
    const minDate = new Date(Math.min(...dates.map(d => d.getTime())));
    const maxDate = new Date(Math.max(...dates.map(d => d.getTime())));
    
    // Align to week start (Monday)
    const startDate = new Date(minDate);
    startDate.setDate(startDate.getDate() - ((startDate.getDay() + 6) % 7));
    
    // Extend to end of week (Sunday)
    const endDate = new Date(maxDate);
    endDate.setDate(endDate.getDate() + (7 - endDate.getDay()) % 7);
    
    // Generate weeks
    const weeksData: { date: Date; value: number }[][] = [];
    const currentDate = new Date(startDate);
    let currentWeek: { date: Date; value: number }[] = [];
    
    while (currentDate <= endDate) {
      const dateStr = currentDate.toISOString().split('T')[0];
      currentWeek.push({
        date: new Date(currentDate),
        value: valueMap.get(dateStr) || 0,
      });
      
      if (currentWeek.length === 7) {
        weeksData.push(currentWeek);
        currentWeek = [];
      }
      
      currentDate.setDate(currentDate.getDate() + 1);
    }
    
    if (currentWeek.length > 0) {
      weeksData.push(currentWeek);
    }
    
    // Calculate max value for color scaling
    const max = Math.max(...data.map(d => d.value), 1);
    
    // Generate month labels
    const labels: { label: string; weekIndex: number }[] = [];
    let lastMonth = -1;
    weeksData.forEach((week, weekIndex) => {
      const firstDayOfWeek = week[0].date;
      const month = firstDayOfWeek.getMonth();
      if (month !== lastMonth) {
        labels.push({
          label: firstDayOfWeek.toLocaleDateString('en-US', { month: 'short' }),
          weekIndex,
        });
        lastMonth = month;
      }
    });
    
    return { weeks: weeksData, maxValue: max, monthLabels: labels };
  }, [data]);

  if (data.length === 0) return null;

  const getColorIntensity = (value: number): string => {
    if (value === 0) return colors.empty;
    const intensity = Math.min(value / maxValue, 1);
    
    if (intensity < 0.25) return colors.low;
    if (intensity < 0.5) return colors.medium;
    if (intensity < 0.75) return colors.high;
    return colors.max;
  };

  const dayLabels = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];

  return (
    <Card className="bg-card border-border/50 card-shadow animate-fade-in">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-2">
          <Calendar className="h-4 w-4 text-primary" />
          {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Legend */}
        <div className="flex items-center justify-end gap-1 mb-4 text-xs text-muted-foreground">
          <span>Less</span>
          <div className="flex gap-0.5">
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.empty }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.low }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.medium }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.high }} />
            <div className="w-3 h-3 rounded-sm" style={{ backgroundColor: colors.max }} />
          </div>
          <span>More</span>
        </div>

        <div className="overflow-x-auto">
          {/* Month labels */}
          <div className="flex mb-1 ml-6">
            {monthLabels.map((label, idx) => (
              <div
                key={idx}
                className="text-[10px] text-muted-foreground"
                style={{
                  position: 'relative',
                  left: `${label.weekIndex * 14}px`,
                  marginRight: idx < monthLabels.length - 1 
                    ? `${(monthLabels[idx + 1]?.weekIndex - label.weekIndex - 1) * 14}px`
                    : 0,
                }}
              >
                {label.label}
              </div>
            ))}
          </div>

          <div className="flex">
            {/* Day labels */}
            <div className="flex flex-col gap-0.5 mr-1">
              {dayLabels.map((day, idx) => (
                <div
                  key={idx}
                  className="w-4 h-3 text-[9px] text-muted-foreground flex items-center justify-end pr-0.5"
                >
                  {idx % 2 === 0 ? day : ''}
                </div>
              ))}
            </div>

            {/* Heatmap grid */}
            <div className="flex gap-0.5">
              {weeks.map((week, weekIdx) => (
                <div key={weekIdx} className="flex flex-col gap-0.5">
                  {week.map((day, dayIdx) => (
                    <div
                      key={dayIdx}
                      className="w-3 h-3 rounded-sm transition-colors duration-150 hover:ring-1 hover:ring-primary/40 cursor-pointer"
                      style={{ backgroundColor: getColorIntensity(day.value) }}
                      title={`${day.date.toLocaleDateString('en-GB')}: ${formatFull(day.value)}`}
                    />
                  ))}
                </div>
              ))}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
