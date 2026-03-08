import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { useApp } from '@/contexts/AppContext';
import { formatCurrency, formatCurrencyShort } from '@/utils/currency';
import { getRelativeDate, formatTime } from '@/utils/dateUtils';
import { getActivityIcon, getActivityColor } from '@/services/activityLogService';
import { toSafeQuantity } from '@/utils/safeNumber';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { useNavigate } from 'react-router-dom';
import {
  Package,
  TrendingUp,
  ShoppingCart,
  AlertTriangle,
  Zap,
  Plus,
  Pencil,
  Trash2,
  BarChart3,
  Download,
  Upload,
  RefreshCw,
  Activity,
  ChevronRight,
  Wallet,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmergencyIndicator, isLowStock } from '@/components/ui/emergency-indicator';
import type { ActivityAction } from '@/types';
import { QuickSellModal } from '@/components/dashboard/QuickSellModal';
import { useCountUp } from '@/hooks/useCountUp';
import { AreaChart, Area, ResponsiveContainer, Tooltip, XAxis } from 'recharts';

const activityIconMap: Record<string, React.ElementType> = {
  Plus, Pencil, Trash2, ShoppingCart, Download, Upload, RefreshCw, Activity,
};

const ACTION_LABELS: Record<ActivityAction, string> = {
  create: 'Added', update: 'Updated', delete: 'Deleted',
  sale: 'Sale', backup: 'Backup', restore: 'Restore', sync: 'Sync',
};

const ACTION_BG: Record<ActivityAction, string> = {
  create: 'bg-green-500/12',
  update: 'bg-primary/12',
  delete: 'bg-destructive/12',
  sale: 'bg-primary/12',
  backup: 'bg-muted',
  restore: 'bg-orange-500/12',
  sync: 'bg-primary/12',
};

const ACTION_BAR_COLOR: Record<ActivityAction, string> = {
  create: 'bg-green-500',
  update: 'bg-primary',
  delete: 'bg-destructive',
  sale: 'bg-primary',
  backup: 'bg-muted-foreground',
  restore: 'bg-orange-500',
  sync: 'bg-primary',
};

// KPI accent colors using CSS variables
const KPI_CONFIG = [
  { key: 'totalParts', title: 'Total Parts', icon: Package, accent: 'hsl(var(--primary))', isCurrency: false, isWarning: false },
  { key: 'inventoryValue', title: 'Inventory Value', icon: Wallet, accent: 'hsl(210 80% 55%)', isCurrency: true, isWarning: false },
  { key: 'todaySales', title: "Today's Sales", icon: ShoppingCart, accent: 'hsl(142 70% 45%)', isCurrency: true, isWarning: false },
  { key: 'lowStockCount', title: 'Low Stock', icon: AlertTriangle, accent: 'hsl(var(--destructive))', isCurrency: false, isWarning: true },
] as const;

export default function Dashboard() {
  const navigate = useNavigate();
  const [quickSellOpen, setQuickSellOpen] = useState(false);
  const {
    stats,
    isLoadingStats,
    lowStockParts,
    recentActivity,
    isInitialized,
    appName,
  } = useApp();

  if (!isInitialized) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-pulse text-muted-foreground">Loading...</div>
        </div>
      </AppLayout>
    );
  }

  const weeklyTotal = stats.weeklySales.reduce((s, d) => s + d.sales, 0);

  return (
    <AppLayout>
      <Header title={appName} subtitle="Inventory & Sales Manager" />

      <div className="p-4 space-y-5">
        {/* KPI Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          {KPI_CONFIG.map((kpi, i) => {
            const raw = stats[kpi.key as keyof typeof stats] as number;
            const isWarning = kpi.isWarning && raw > 0;
            return (
              <KPICard
                key={kpi.key}
                title={kpi.title}
                value={raw}
                icon={kpi.icon}
                accentColor={isWarning ? 'hsl(var(--destructive))' : kpi.accent}
                isCurrency={kpi.isCurrency}
                loading={isLoadingStats}
                highlight={isWarning}
                style={{ animationDelay: `${i * 60}ms` }}
              />
            );
          })}
        </div>

        {/* Quick Actions */}
        <section className="animate-fade-in" style={{ animationDelay: '250ms', animationFillMode: 'both' }}>
          <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-2.5">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-2">
            <QuickAction icon={Plus} label="Add Part" onClick={() => navigate('/inventory/add')} />
            <QuickAction icon={ShoppingCart} label="New Sale" onClick={() => navigate('/sale')} />
            <QuickAction icon={BarChart3} label="Reports" onClick={() => navigate('/reports')} />
            <QuickAction icon={Zap} label="QuickSell" onClick={() => setQuickSellOpen(true)} />
          </div>
        </section>

        {/* Weekly Sales Mini Chart */}
        <section className="animate-fade-in" style={{ animationDelay: '350ms', animationFillMode: 'both' }}>
          <Card className="overflow-hidden rounded-2xl border-border/40 shadow-sm">
            <CardContent className="p-4 pb-2">
              <div className="flex items-center justify-between mb-1">
                <div>
                  <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Sales This Week</p>
                  <p className="text-lg font-bold mt-0.5">{formatCurrencyShort(weeklyTotal)}</p>
                </div>
                <div className="h-9 w-9 rounded-xl bg-green-500/10 flex items-center justify-center">
                  <TrendingUp className="h-4 w-4 text-green-500" />
                </div>
              </div>
              <div className="h-[80px] -mx-1">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={stats.weeklySales}>
                    <defs>
                      <linearGradient id="salesGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity={0.3} />
                        <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'hsl(var(--muted-foreground))' }} axisLine={false} tickLine={false} />
                    <Tooltip
                      contentStyle={{
                        background: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px',
                        fontSize: '12px',
                      }}
                      formatter={(value: number) => [`Rs ${value.toLocaleString()}`, 'Sales']}
                    />
                    <Area
                      type="monotone"
                      dataKey="sales"
                      stroke="hsl(var(--primary))"
                      strokeWidth={2}
                      fill="url(#salesGrad)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Inventory Status Bar */}
        {stats.totalParts > 0 && (
          <section className="animate-fade-in" style={{ animationDelay: '450ms', animationFillMode: 'both' }}>
            <Card className="rounded-2xl border-border/40 shadow-sm">
              <CardContent className="p-4">
                <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">Inventory Health</p>
                <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                  {stats.stockDistribution.inStock > 0 && (
                    <div
                      className="bg-green-500 transition-all duration-500"
                      style={{ width: `${(stats.stockDistribution.inStock / stats.totalParts) * 100}%` }}
                    />
                  )}
                  {stats.stockDistribution.lowStock > 0 && (
                    <div
                      className="bg-amber-500 transition-all duration-500"
                      style={{ width: `${(stats.stockDistribution.lowStock / stats.totalParts) * 100}%` }}
                    />
                  )}
                  {stats.stockDistribution.outOfStock > 0 && (
                    <div
                      className="bg-destructive transition-all duration-500"
                      style={{ width: `${(stats.stockDistribution.outOfStock / stats.totalParts) * 100}%` }}
                    />
                  )}
                </div>
                <div className="flex justify-between mt-2.5 text-[10px] font-medium">
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-green-500" />
                    In Stock ({stats.stockDistribution.inStock})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-amber-500" />
                    Low ({stats.stockDistribution.lowStock})
                  </span>
                  <span className="flex items-center gap-1.5">
                    <span className="h-2 w-2 rounded-full bg-destructive" />
                    Out ({stats.stockDistribution.outOfStock})
                  </span>
                </div>
              </CardContent>
            </Card>
          </section>
        )}

        {/* Low Stock Alerts */}
        {lowStockParts.length > 0 && (
          <section className="animate-fade-in" style={{ animationDelay: '550ms', animationFillMode: 'both' }}>
            <div className="flex items-center justify-between mb-2.5">
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Low Stock Alerts</h2>
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-7"
                onClick={() => navigate('/inventory?status=low-stock')}
              >
                View All
              </Button>
            </div>
            <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
              <CardContent className="p-0 divide-y divide-border/50">
                {lowStockParts.slice(0, 5).map((part) => {
                  const qty = toSafeQuantity(part.quantity, 0);
                  const minStock = toSafeQuantity(part.minStockLevel, 0);
                  const pct = minStock > 0 ? Math.min((qty / minStock) * 100, 100) : 0;
                  const isOut = qty === 0;

                  return (
                    <div
                      key={part.id}
                      className={cn(
                        'flex items-center gap-3 p-3 cursor-pointer hover:bg-muted/40 transition-all hover:-translate-y-px',
                        'border-l-[3px]',
                        isOut ? 'border-l-destructive' : 'border-l-amber-500',
                      )}
                      onClick={() => navigate(`/inventory/${part.id}`)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{part.name}</p>
                          {isLowStock(qty, minStock) && <EmergencyIndicator size="sm" />}
                        </div>
                        <p className="text-[10px] text-muted-foreground mt-0.5">SKU: {part.sku}</p>
                        <div className="mt-1.5">
                          <Progress value={pct} className="h-1.5" />
                        </div>
                      </div>
                      <span className={cn(
                        'text-sm font-bold shrink-0',
                        isOut ? 'text-destructive' : 'text-amber-500'
                      )}>
                        {qty}/{minStock}
                      </span>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </section>
        )}

        {/* Monthly Overview */}
        <section className="animate-fade-in" style={{ animationDelay: '650ms', animationFillMode: 'both' }}>
          <Card className="rounded-2xl border-border/40 shadow-sm overflow-hidden">
            <CardContent className="p-4">
              <p className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70 mb-3">Monthly Overview</p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-[10px] text-muted-foreground">Profit</p>
                  <p className="text-lg font-bold text-primary mt-0.5">{formatCurrencyShort(stats.monthlyProfit)}</p>
                </div>
                <div>
                  <p className="text-[10px] text-muted-foreground">Today's Profit</p>
                  <p className="text-lg font-bold text-green-500 mt-0.5">{formatCurrency(stats.todayProfit)}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Recent Activity */}
        <section className="animate-fade-in" style={{ animationDelay: '750ms', animationFillMode: 'both' }}>
          <div className="flex items-center justify-between mb-2.5">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-muted-foreground/70">Recent Activity</h2>
            <Button
              variant="ghost"
              size="sm"
              className="text-xs h-7 gap-1 group"
              onClick={() => navigate('/activity-log')}
            >
              View All
              <ChevronRight className="h-3 w-3 transition-transform group-hover:translate-x-0.5" />
            </Button>
          </div>
          <Card className="rounded-2xl border-border/40 shadow-sm">
            <CardContent className="p-0">
              {recentActivity.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  <Activity className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No activity yet</p>
                  <p className="text-xs mt-1 text-muted-foreground/70">Start by adding your first part</p>
                </div>
              ) : (
                <div className="divide-y divide-border/50">
                  {recentActivity.slice(0, 6).map((log, i) => {
                    const iconName = getActivityIcon(log.action);
                    const Icon = activityIconMap[iconName] || Activity;
                    const colorClass = getActivityColor(log.action);
                    const bgClass = ACTION_BG[log.action] || 'bg-muted';
                    const barColor = ACTION_BAR_COLOR[log.action] || 'bg-muted-foreground';
                    const label = ACTION_LABELS[log.action] || log.action;

                    return (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/40 transition-colors relative animate-fade-in"
                        style={{ animationDelay: `${i * 40}ms`, animationFillMode: 'both' }}
                        onClick={() => navigate('/activity-log')}
                      >
                        <div className={cn('absolute right-0 top-3 bottom-3 w-[3px] rounded-full', barColor)} />
                        <div className={cn('h-9 w-9 rounded-full flex items-center justify-center shrink-0', bgClass)}>
                          <Icon className={cn('h-4 w-4', colorClass)} />
                        </div>
                        <div className="flex-1 min-w-0 pr-3">
                          <p className="text-sm font-semibold leading-snug">{label} – {log.description?.split('–')[0]?.split(':')[0]?.trim() || ''}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-1">{log.description}</p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">{getRelativeDate(log.createdAt)} at {formatTime(log.createdAt)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </section>

        <QuickSellModal open={quickSellOpen} onOpenChange={setQuickSellOpen} />
      </div>
    </AppLayout>
  );
}

// ─── KPI Card ────────────────────────────────────────────
interface KPICardProps {
  title: string;
  value: number;
  icon: React.ElementType;
  accentColor: string;
  isCurrency?: boolean;
  loading?: boolean;
  highlight?: boolean;
  style?: React.CSSProperties;
}

function KPICard({ title, value, icon: Icon, accentColor, isCurrency, loading, highlight, style }: KPICardProps) {
  const animatedValue = useCountUp(loading ? 0 : value, 800);

  const formatValue = () => {
    if (isCurrency) {
      const v = animatedValue;
      const abs = Math.abs(v);
      const sign = v < 0 ? '-' : '';
      if (abs >= 10000000) return `${sign}${(abs / 10000000).toFixed(2)} Cr`;
      if (abs >= 100000) return `${sign}${(abs / 100000).toFixed(2)} Lac`;
      if (abs >= 1000) return `${sign}${(abs / 1000).toFixed(1)}K`;
      return formatCurrencyShort(v).replace('Rs ', '');
    }
    return `${Math.round(animatedValue)}`;
  };

  return (
    <div
      className={cn(
        'relative overflow-hidden rounded-2xl p-4',
        'bg-card border border-border/40',
        'shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300',
        'animate-fade-in',
        highlight && 'border-destructive/30',
      )}
      style={{ animationFillMode: 'both', ...style }}
    >
      <div
        className="absolute top-0 left-0 right-0 h-[3px] rounded-t-2xl"
        style={{ background: accentColor, opacity: 0.85 }}
      />
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0 flex-1 space-y-1">
          <p className="text-[11px] font-medium uppercase tracking-wider text-muted-foreground/70">{title}</p>
          {loading ? (
            <Skeleton className="h-7 w-20" />
          ) : (
            <div className="flex items-baseline gap-1">
              {isCurrency && <span className="text-xs font-medium text-muted-foreground">Rs</span>}
              <p className="text-xl font-bold tracking-tight">{formatValue()}</p>
            </div>
          )}
        </div>
        <div
          className={cn(
            'shrink-0 w-10 h-10 rounded-xl flex items-center justify-center',
            highlight ? 'bg-destructive/10' : 'bg-primary/10',
          )}
        >
          <Icon className={cn('h-[18px] w-[18px]', highlight ? 'text-destructive' : 'text-primary')} />
        </div>
      </div>
    </div>
  );
}

// ─── Quick Action ────────────────────────────────────────
interface QuickActionProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}

function QuickAction({ icon: Icon, label, onClick }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className={cn(
        'flex flex-col items-center justify-center gap-1.5 p-3 rounded-2xl',
        'bg-card border border-border/40',
        'shadow-sm hover:shadow-md',
        'hover:scale-105 active:scale-[0.97]',
        'transition-all duration-200 touch-target',
      )}
    >
      <div className="h-9 w-9 rounded-xl bg-primary/10 flex items-center justify-center">
        <Icon className="h-4 w-4 text-primary" />
      </div>
      <span className="text-[10px] font-medium text-center leading-tight text-muted-foreground">{label}</span>
    </button>
  );
}
