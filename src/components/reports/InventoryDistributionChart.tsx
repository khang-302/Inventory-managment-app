import { Card, CardContent } from '@/components/ui/card';
import { useCurrencyFormat } from '@/hooks/useCurrencyFormat';
import { PieChart as PieIcon, BarChart3 } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from 'recharts';

interface DistributionData {
  name: string;
  value: number;
}

interface InventoryDistributionChartProps {
  categoryData: DistributionData[];
  brandData: DistributionData[];
  title?: string;
}

const COLORS = [
  'hsl(152, 45%, 42%)',
  'hsl(210, 60%, 50%)',
  'hsl(175, 45%, 45%)',
  'hsl(35, 70%, 52%)',
  'hsl(280, 45%, 55%)',
  'hsl(350, 55%, 55%)',
  'hsl(45, 65%, 52%)',
  'hsl(195, 55%, 48%)',
];

const COLORS_DARK = [
  'hsl(152, 40%, 48%)',
  'hsl(210, 55%, 55%)',
  'hsl(175, 40%, 50%)',
  'hsl(35, 60%, 55%)',
  'hsl(280, 40%, 58%)',
  'hsl(350, 48%, 58%)',
  'hsl(45, 55%, 55%)',
  'hsl(195, 48%, 52%)',
];

export function InventoryDistributionChart({
  categoryData,
  brandData,
  title = "Inventory Value Distribution"
}: InventoryDistributionChartProps) {
  const { formatFull, formatValue } = useCurrencyFormat();

  if (categoryData.length === 0 && brandData.length === 0) return null;

  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
  const colors = isDark ? COLORS_DARK : COLORS;
  const gridColor = isDark ? 'hsl(220, 12%, 22%)' : 'hsl(220, 14%, 88%)';
  const textColor = isDark ? 'hsl(220, 10%, 55%)' : 'hsl(220, 10%, 46%)';
  const tooltipBg = isDark ? 'hsl(220, 16%, 12%)' : 'hsl(0, 0%, 100%)';
  const tooltipBorder = isDark ? 'hsl(220, 12%, 22%)' : 'hsl(220, 14%, 88%)';
  const strokeColor = isDark ? 'hsl(220, 18%, 8%)' : 'hsl(0, 0%, 100%)';

  const CustomLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent }: any) => {
    if (percent < 0.05) return null;
    const RADIAN = Math.PI / 180;
    const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
    const x = cx + radius * Math.cos(-midAngle * RADIAN);
    const y = cy + radius * Math.sin(-midAngle * RADIAN);

    return (
      <text
        x={x}
        y={y}
        fill={isDark ? 'hsl(220, 15%, 90%)' : 'hsl(0, 0%, 100%)'}
        textAnchor="middle"
        dominantBaseline="central"
        fontSize={9}
        fontWeight={500}
      >
        {`${(percent * 100).toFixed(0)}%`}
      </text>
    );
  };

  return (
    <Card className="bg-card border-border/30 shadow-sm overflow-hidden rounded-2xl">
      <CardContent className="p-4">
        {/* Header — consistent icon+title pattern */}
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
            <PieIcon className="h-4 w-4 text-primary" />
          </div>
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>

        <Tabs defaultValue="category" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="category" className="text-xs">
              <PieIcon className="h-3 w-3 mr-1" />
              By Category
            </TabsTrigger>
            <TabsTrigger value="brand" className="text-xs">
              <BarChart3 className="h-3 w-3 mr-1" />
              By Brand
            </TabsTrigger>
          </TabsList>

          <TabsContent value="category">
            {categoryData.length > 0 ? (
              <div>
                <div style={{ width: '100%', height: 220 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={categoryData}
                        dataKey="value"
                        nameKey="name"
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={85}
                        labelLine={false}
                        label={CustomLabel}
                        isAnimationActive={true}
                        animationDuration={600}
                        animationEasing="ease-out"
                      >
                        {categoryData.map((_, index) => (
                          <Cell
                            key={index}
                            fill={colors[index % colors.length]}
                            stroke={strokeColor}
                            strokeWidth={2}
                          />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: tooltipBg,
                          border: `1px solid ${tooltipBorder}`,
                          borderRadius: '12px',
                          fontSize: '11px',
                          boxShadow: '0 8px 24px rgba(0,0,0,0.12)',
                          padding: '8px 12px',
                        }}
                        formatter={(value: number) => [formatFull(value), 'Value']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex flex-wrap gap-x-3 gap-y-2 justify-center mt-3 px-2"
                  style={{ fontSize: `calc(0.75rem * var(--chart-legend-scale, 1) * var(--text-scale, 1))` }}
                >
                  {categoryData.map((item, index) => (
                    <div key={item.name} className="flex items-start gap-1.5 max-w-[48%]">
                      <div
                        className="w-2.5 h-2.5 rounded-full shrink-0 mt-0.5"
                        style={{ backgroundColor: colors[index % colors.length] }}
                      />
                      <span className="text-muted-foreground break-words leading-tight line-clamp-2">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                No category data available
              </div>
            )}
          </TabsContent>

          <TabsContent value="brand">
            {brandData.length > 0 ? (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={brandData} layout="vertical">
                    <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
                    <XAxis
                      type="number"
                      tick={{ fontSize: 10, fill: textColor }}
                      axisLine={{ stroke: gridColor }}
                      tickFormatter={(v) => formatValue(v)}
                    />
                    <YAxis
                      dataKey="name"
                      type="category"
                      tick={{ fontSize: 10, fill: textColor }}
                      axisLine={{ stroke: gridColor }}
                      width={80}
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
                      formatter={(value: number) => [formatFull(value), 'Value']}
                    />
                    <Bar
                      dataKey="value"
                      fill={isDark ? 'hsl(175, 40%, 50%)' : 'hsl(175, 45%, 45%)'}
                      radius={[0, 4, 4, 0]}
                      isAnimationActive={true}
                      animationDuration={600}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            ) : (
              <div className="h-64 flex items-center justify-center text-muted-foreground text-sm">
                No brand data available
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  );
}
