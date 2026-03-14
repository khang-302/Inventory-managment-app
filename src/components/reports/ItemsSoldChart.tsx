import { Card, CardContent } from '@/components/ui/card';
import { Boxes } from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface ItemsSoldData {
  date: string;
  items: number;
}

interface ItemsSoldChartProps {
  data: ItemsSoldData[];
  accentColor?: string;
}

export function ItemsSoldChart({ data, accentColor }: ItemsSoldChartProps) {
  if (data.length === 0) return null;

  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
  const gridColor = isDark ? 'hsl(220, 12%, 18%)' : 'hsl(220, 14%, 90%)';
  const textColor = isDark ? 'hsl(220, 10%, 45%)' : 'hsl(220, 10%, 55%)';
  const tooltipBg = isDark ? 'hsl(220, 16%, 12%)' : 'hsl(0, 0%, 100%)';
  const tooltipBorder = isDark ? 'hsl(220, 12%, 22%)' : 'hsl(220, 14%, 90%)';
  const lineColor = accentColor || (isDark ? 'hsl(280, 45%, 55%)' : 'hsl(280, 50%, 50%)');

  return (
    <Card className="bg-card border-border/30 shadow-sm overflow-hidden rounded-2xl">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-violet-500/10 flex items-center justify-center">
            <Boxes className="h-4 w-4 text-violet-500" />
          </div>
          <h3 className="text-sm font-semibold">Items Sold</h3>
        </div>
        <div className="h-52 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <defs>
                <linearGradient id="itemsGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={lineColor} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="date"
                tick={{ fontSize: 9, fill: textColor }}
                axisLine={false}
                tickLine={false}
                interval="preserveStartEnd"
              />
              <YAxis
                tick={{ fontSize: 9, fill: textColor }}
                axisLine={false}
                tickLine={false}
                allowDecimals={false}
                width={30}
              />
              <Tooltip
                contentStyle={{
                  backgroundColor: tooltipBg,
                  border: `1px solid ${tooltipBorder}`,
                  borderRadius: '12px',
                  fontSize: '11px',
                  boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                  padding: '8px 12px',
                }}
                formatter={(value: number) => [value, 'Items']}
                labelStyle={{ color: textColor, fontSize: '10px', marginBottom: '4px' }}
              />
              <Area
                name="Items"
                type="monotone"
                dataKey="items"
                stroke={lineColor}
                strokeWidth={2.5}
                fill="url(#itemsGrad)"
                dot={false}
                activeDot={{ r: 4, strokeWidth: 2, stroke: lineColor, fill: tooltipBg }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
