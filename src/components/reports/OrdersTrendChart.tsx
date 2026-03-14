import { Card, CardContent } from '@/components/ui/card';
import { Receipt } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface OrdersTrendData {
  date: string;
  orders: number;
}

interface OrdersTrendChartProps {
  data: OrdersTrendData[];
  accentColor?: string;
}

export function OrdersTrendChart({ data, accentColor }: OrdersTrendChartProps) {
  if (data.length === 0) return null;

  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
  const gridColor = isDark ? 'hsl(220, 12%, 18%)' : 'hsl(220, 14%, 90%)';
  const textColor = isDark ? 'hsl(220, 10%, 45%)' : 'hsl(220, 10%, 55%)';
  const tooltipBg = isDark ? 'hsl(220, 16%, 12%)' : 'hsl(0, 0%, 100%)';
  const tooltipBorder = isDark ? 'hsl(220, 12%, 22%)' : 'hsl(220, 14%, 90%)';
  const barColor = accentColor || (isDark ? 'hsl(210, 60%, 55%)' : 'hsl(210, 65%, 50%)');

  return (
    <Card className="bg-card border-border/30 shadow-sm overflow-hidden rounded-2xl">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <Receipt className="h-4 w-4 text-blue-500" />
          </div>
          <h3 className="text-sm font-semibold">Orders Per Period</h3>
        </div>
        <div className="h-52 -mx-1">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={data} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
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
                formatter={(value: number) => [value, 'Orders']}
                labelStyle={{ color: textColor, fontSize: '10px', marginBottom: '4px' }}
              />
              <Bar dataKey="orders" fill={barColor} radius={[4, 4, 0, 0]} maxBarSize={32} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
