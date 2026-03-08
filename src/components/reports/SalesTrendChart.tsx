import { Card, CardContent } from '@/components/ui/card';
import { formatCurrency, formatCurrencyShort } from '@/utils/currency';
import { TrendingUp, Eye, EyeOff } from 'lucide-react';
import { useState } from 'react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface SalesTrendData {
  date: string;
  sales: number;
  profit: number;
}

interface SalesTrendChartProps {
  data: SalesTrendData[];
  title?: string;
}

export function SalesTrendChart({ data, title = "Revenue & Profit" }: SalesTrendChartProps) {
  const [showSales, setShowSales] = useState(true);
  const [showProfit, setShowProfit] = useState(true);

  if (data.length === 0) return null;

  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
  const gridColor = isDark ? 'hsl(220, 12%, 18%)' : 'hsl(220, 14%, 90%)';
  const textColor = isDark ? 'hsl(220, 10%, 45%)' : 'hsl(220, 10%, 55%)';
  const tooltipBg = isDark ? 'hsl(220, 16%, 12%)' : 'hsl(0, 0%, 100%)';
  const tooltipBorder = isDark ? 'hsl(220, 12%, 22%)' : 'hsl(220, 14%, 90%)';

  const salesColor = isDark ? 'hsl(152, 50%, 48%)' : 'hsl(152, 55%, 42%)';
  const profitColor = isDark ? 'hsl(210, 60%, 55%)' : 'hsl(210, 65%, 50%)';

  return (
    <Card className="bg-card border-border/30 shadow-sm overflow-hidden rounded-2xl">
      <CardContent className="p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 flex items-center justify-center">
              <TrendingUp className="h-4 w-4 text-emerald-500" />
            </div>
            <h3 className="text-sm font-semibold">{title}</h3>
          </div>
          <div className="flex gap-1">
            <button
              onClick={() => setShowSales(!showSales)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors"
              style={{
                backgroundColor: showSales ? `${salesColor}20` : 'transparent',
                color: showSales ? salesColor : textColor,
              }}
            >
              {showSales ? <Eye className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
              Rev
            </button>
            <button
              onClick={() => setShowProfit(!showProfit)}
              className="flex items-center gap-1 px-2 py-1 rounded-md text-[10px] font-medium transition-colors"
              style={{
                backgroundColor: showProfit ? `${profitColor}20` : 'transparent',
                color: showProfit ? profitColor : textColor,
              }}
            >
              {showProfit ? <Eye className="h-2.5 w-2.5" /> : <EyeOff className="h-2.5 w-2.5" />}
              Profit
            </button>
          </div>
        </div>

        {/* Chart */}
        <div className="h-56 -mx-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data} margin={{ top: 5, right: 5, left: -10, bottom: 0 }}>
              <defs>
                <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={salesColor} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={salesColor} stopOpacity={0} />
                </linearGradient>
                <linearGradient id="profitGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor={profitColor} stopOpacity={0.25} />
                  <stop offset="100%" stopColor={profitColor} stopOpacity={0} />
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
                tickFormatter={(v) => formatCurrencyShort(v).replace('Rs ', '')}
                width={45}
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
                formatter={(value: number, name: string) => [formatCurrency(value), name]}
                labelStyle={{ color: textColor, fontSize: '10px', marginBottom: '4px' }}
              />
              {showSales && (
                <Area
                  name="Revenue"
                  type="monotone"
                  dataKey="sales"
                  stroke={salesColor}
                  strokeWidth={2.5}
                  fill="url(#salesGrad)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: salesColor, fill: tooltipBg }}
                />
              )}
              {showProfit && (
                <Area
                  name="Profit"
                  type="monotone"
                  dataKey="profit"
                  stroke={profitColor}
                  strokeWidth={2.5}
                  fill="url(#profitGrad)"
                  dot={false}
                  activeDot={{ r: 4, strokeWidth: 2, stroke: profitColor, fill: tooltipBg }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
