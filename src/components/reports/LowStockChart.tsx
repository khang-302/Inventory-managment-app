import { Card, CardContent } from '@/components/ui/card';
import { EmergencyIndicator } from '@/components/ui/emergency-indicator';
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

interface LowStockItem {
  name: string;
  quantity: number;
  minStock: number;
  urgency: 'critical' | 'warning' | 'near';
}

interface LowStockChartProps {
  data: LowStockItem[];
  title?: string;
}

const URGENCY_COLORS = {
  light: {
    critical: 'hsl(0, 65%, 50%)',
    warning: 'hsl(35, 75%, 50%)',
    near: 'hsl(45, 70%, 48%)',
  },
  dark: {
    critical: 'hsl(0, 55%, 55%)',
    warning: 'hsl(35, 60%, 52%)',
    near: 'hsl(45, 55%, 50%)',
  },
};

export function LowStockChart({ data, title = "Low Stock Risk Analysis" }: LowStockChartProps) {
  if (data.length === 0) return null;

  const isDark = typeof window !== 'undefined' && document.documentElement.classList.contains('dark');
  const colors = isDark ? URGENCY_COLORS.dark : URGENCY_COLORS.light;
  const gridColor = isDark ? 'hsl(220, 12%, 22%)' : 'hsl(220, 14%, 88%)';
  const textColor = isDark ? 'hsl(220, 10%, 55%)' : 'hsl(220, 10%, 46%)';
  const tooltipBg = isDark ? 'hsl(220, 16%, 12%)' : 'hsl(0, 0%, 100%)';
  const tooltipBorder = isDark ? 'hsl(220, 12%, 22%)' : 'hsl(220, 14%, 88%)';

  const getUrgencyColor = (urgency: string) => {
    switch (urgency) {
      case 'critical': return colors.critical;
      case 'warning': return colors.warning;
      case 'near': return colors.near;
      default: return isDark ? 'hsl(220, 8%, 50%)' : 'hsl(220, 10%, 60%)';
    }
  };

  const getUrgencyLabel = (urgency: string) => {
    switch (urgency) {
      case 'critical': return 'Critical';
      case 'warning': return 'Warning';
      case 'near': return 'Near Threshold';
      default: return 'Unknown';
    }
  };

  const sortedData = [...data].sort((a, b) => {
    const order = { critical: 0, warning: 1, near: 2 };
    return order[a.urgency] - order[b.urgency];
  }).map(d => ({
    ...d,
    name: d.name.length > 15 ? d.name.substring(0, 15) + '…' : d.name,
  }));

  return (
    <Card className="bg-card border-border/30 shadow-sm overflow-hidden rounded-2xl">
      <CardContent className="p-4">
        {/* Header — consistent icon+title pattern */}
        <div className="flex items-center gap-2 mb-3">
          <EmergencyIndicator size="md" />
          <h3 className="text-sm font-semibold">{title}</h3>
        </div>

        {/* Legend */}
        <div className="flex flex-wrap gap-3 mb-4">
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.critical }} />
            <span className="text-muted-foreground">Critical</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.warning }} />
            <span className="text-muted-foreground">Warning</span>
          </div>
          <div className="flex items-center gap-1.5 text-xs">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: colors.near }} />
            <span className="text-muted-foreground">Near</span>
          </div>
        </div>

        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={sortedData} layout="vertical">
              <CartesianGrid strokeDasharray="3 3" horizontal={false} stroke={gridColor} />
              <XAxis
                type="number"
                tick={{ fontSize: 10, fill: textColor }}
                axisLine={{ stroke: gridColor }}
                domain={[0, 'dataMax']}
              />
              <YAxis
                dataKey="name"
                type="category"
                tick={{ fontSize: 10, fill: textColor }}
                axisLine={{ stroke: gridColor }}
                width={90}
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
                formatter={(value: number, _, props) => {
                  const item = props.payload as LowStockItem;
                  return [
                    `${value} / ${item.minStock} (${getUrgencyLabel(item.urgency)})`,
                    'Stock'
                  ];
                }}
              />
              <Bar
                dataKey="quantity"
                radius={[0, 4, 4, 0]}
                isAnimationActive={true}
                animationDuration={600}
              >
                {sortedData.map((entry, index) => (
                  <Cell key={index} fill={getUrgencyColor(entry.urgency)} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
}
