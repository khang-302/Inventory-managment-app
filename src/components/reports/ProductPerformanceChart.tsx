import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatCurrencyShort } from '@/utils/currency';
import { BarChart3 } from 'lucide-react';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Cell,
} from 'recharts';

interface ProductPerformanceData {
  name: string;
  unitsSold: number;
  revenue: number;
  profit: number;
  category: string;
}

interface ProductPerformanceChartProps {
  data: ProductPerformanceData[];
  title?: string;
}

const BAR_COLORS = [
  'hsl(37, 92%, 50%)',   // Primary amber
  'hsl(152, 50%, 45%)',  // Green
  'hsl(210, 60%, 50%)',  // Blue
  'hsl(175, 45%, 45%)',  // Teal
  'hsl(280, 45%, 55%)',  // Purple
  'hsl(350, 55%, 55%)',  // Rose
  'hsl(45, 65%, 52%)',   // Gold
  'hsl(195, 55%, 48%)',  // Cyan
];

export function ProductPerformanceChart({
  data,
  title = "Product Performance",
}: ProductPerformanceChartProps) {
  if (data.length === 0) return null;

  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
  const gridColor = isDark ? 'hsl(220, 12%, 18%)' : 'hsl(220, 14%, 90%)';
  const textColor = isDark ? 'hsl(220, 10%, 45%)' : 'hsl(220, 10%, 55%)';
  const tooltipBg = isDark ? 'hsl(220, 16%, 12%)' : 'hsl(0, 0%, 100%)';
  const tooltipBorder = isDark ? 'hsl(220, 12%, 22%)' : 'hsl(220, 14%, 90%)';

  // Sort by quantity sold and take top 8 for mobile readability
  const chartData = [...data]
    .sort((a, b) => b.unitsSold - a.unitsSold)
    .slice(0, 8)
    .map(d => ({
      ...d,
      shortName: d.name.length > 12 ? d.name.substring(0, 12) + '…' : d.name,
    }));

  return (
    <Card className="bg-card border-border/30 shadow-sm overflow-hidden rounded-2xl">
      <CardContent className="p-4">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-lg bg-blue-500/10 flex items-center justify-center">
            <BarChart3 className="h-4 w-4 text-blue-500" />
          </div>
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>

        <div className="h-56 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 5, left: -15, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke={gridColor} vertical={false} />
              <XAxis
                dataKey="shortName"
                tick={{ fontSize: 8, fill: textColor }}
                axisLine={false}
                tickLine={false}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={50}
              />
              <YAxis
                tick={{ fontSize: 9, fill: textColor }}
                axisLine={false}
                tickLine={false}
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
                formatter={(value: number, name: string) => {
                  if (name === 'Revenue') return [formatCurrency(value), name];
                  return [value, name];
                }}
                labelFormatter={(_, payload) => payload?.[0]?.payload?.name || ''}
              />
              <Bar
                dataKey="unitsSold"
                name="Units Sold"
                radius={[6, 6, 0, 0]}
                maxBarSize={32}
              >
                {chartData.map((_, index) => (
                  <Cell
                    key={index}
                    fill={BAR_COLORS[index % BAR_COLORS.length]}
                    fillOpacity={0.85}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
