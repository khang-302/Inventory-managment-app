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
import { useNavigate } from 'react-router-dom';
import { 
  Package, 
  TrendingUp, 
  ShoppingCart, 
  AlertTriangle,
  Plus,
  Pencil,
  Trash2,
  BarChart3,
  Download,
  Upload,
  RefreshCw,
  Activity,
  ChevronRight
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { EmergencyIndicator, isLowStock } from '@/components/ui/emergency-indicator';
import type { ActivityAction } from '@/types';
import { QuickSellModal } from '@/components/dashboard/QuickSellModal';

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

  return (
    <AppLayout>
      <Header title={appName} subtitle="Inventory & Sales Manager" />
      
      <div className="p-4 space-y-6">
        {/* Summary Cards */}
        <div className="grid grid-cols-2 gap-3">
          <SummaryCard
            title="Total Parts"
            value={isLoadingStats ? null : stats.totalParts.toString()}
            icon={Package}
            iconColor="text-primary"
          />
          <SummaryCard
            title="Inventory Value"
            value={isLoadingStats ? null : formatCurrencyShort(stats.inventoryValue)}
            icon={TrendingUp}
            iconColor="text-primary"
          />
          <SummaryCard
            title="Today's Sales"
            value={isLoadingStats ? null : formatCurrency(stats.todaySales)}
            icon={ShoppingCart}
            iconColor="text-primary"
          />
          <SummaryCard
            title="Low Stock"
            value={isLoadingStats ? null : stats.lowStockCount.toString()}
            icon={AlertTriangle}
            iconColor={stats.lowStockCount > 0 ? 'text-warning' : 'text-muted-foreground'}
            highlight={stats.lowStockCount > 0}
          />
        </div>

        {/* Quick Actions */}
        <div>
          <h2 className="text-sm font-medium text-muted-foreground mb-3">Quick Actions</h2>
          <div className="grid grid-cols-4 gap-2">
            <QuickAction
              icon={Plus}
              label="Add Part"
              onClick={() => navigate('/inventory/add')}
            />
            <QuickAction
              icon={ShoppingCart}
              label="New Sale"
              onClick={() => navigate('/sale')}
            />
            <QuickAction
              icon={BarChart3}
              label="Reports"
              onClick={() => navigate('/reports')}
            />
            <QuickAction
              icon={Download}
              label="Backup"
              onClick={() => navigate('/settings/backup')}
            />
          </div>
        </div>

        {/* Low Stock Alerts */}
        {lowStockParts.length > 0 && (
          <div>
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-medium text-muted-foreground">Low Stock Alerts</h2>
              <Button 
                variant="ghost" 
                size="sm" 
                className="text-xs h-7"
                onClick={() => navigate('/inventory?status=low-stock')}
              >
                View All
              </Button>
            </div>
            <Card className="bg-card">
              <CardContent className="p-0 divide-y divide-border">
                {lowStockParts.slice(0, 5).map((part) => {
                  const qty = toSafeQuantity(part.quantity, 0);
                  const minStock = toSafeQuantity(part.minStockLevel, 0);
                  
                  return (
                    <div 
                      key={part.id}
                      className="flex items-center justify-between p-3 cursor-pointer hover:bg-muted/50"
                      onClick={() => navigate(`/inventory/${part.id}`)}
                    >
                      <div className="min-w-0 flex-1">
                        <div className="flex items-center gap-2">
                          <p className="font-medium text-sm truncate">{part.name}</p>
                          {isLowStock(qty, minStock) && (
                            <EmergencyIndicator size="sm" />
                          )}
                        </div>
                        <p className="text-xs text-muted-foreground">SKU: {part.sku}</p>
                      </div>
                      <div className="flex items-center gap-2 shrink-0">
                        <span className={cn(
                          'text-sm font-semibold',
                          qty === 0 ? 'text-destructive' : 'text-warning'
                        )}>
                          {qty} left
                        </span>
                      </div>
                    </div>
                  );
                })}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Recent Activity - Upgraded */}
        <div>
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-sm font-medium text-muted-foreground">Recent Activity</h2>
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
          <Card className="bg-card rounded-xl shadow-md">
            <CardContent className="p-0">
              {recentActivity.length === 0 ? (
                <div className="p-8 text-center text-muted-foreground text-sm">
                  <Activity className="h-10 w-10 mx-auto mb-3 opacity-40" />
                  <p className="font-medium">No activity yet</p>
                  <p className="text-xs mt-1 text-muted-foreground/70">Start by adding your first part</p>
                </div>
              ) : (
                <div className="divide-y divide-border">
                  {recentActivity.slice(0, 6).map((log) => {
                    const iconName = getActivityIcon(log.action);
                    const Icon = activityIconMap[iconName] || Activity;
                    const colorClass = getActivityColor(log.action);
                    const bgClass = ACTION_BG[log.action] || 'bg-muted';
                    const barColor = ACTION_BAR_COLOR[log.action] || 'bg-muted-foreground';
                    const label = ACTION_LABELS[log.action] || log.action;

                    return (
                      <div
                        key={log.id}
                        className="flex items-start gap-3 p-4 cursor-pointer hover:bg-muted/40 transition-colors relative"
                        onClick={() => navigate('/activity-log')}
                      >
                        {/* Color bar */}
                        <div className={cn('absolute right-0 top-3 bottom-3 w-[3px] rounded-full', barColor)} />

                        {/* Icon */}
                        <div className={cn(
                          'h-9 w-9 rounded-full flex items-center justify-center shrink-0',
                          bgClass
                        )}>
                          <Icon className={cn('h-4 w-4', colorClass)} />
                        </div>

                        {/* Content */}
                        <div className="flex-1 min-w-0 pr-3">
                          <p className="text-sm font-semibold leading-snug">{label} – {log.description?.split('–')[0]?.split(':')[0]?.trim() || ''}</p>
                          <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed line-clamp-1">
                            {log.description}
                          </p>
                          <p className="text-[10px] text-muted-foreground/60 mt-1">
                            {getRelativeDate(log.createdAt)} at {formatTime(log.createdAt)}
                          </p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Monthly Stats */}
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-muted-foreground">Monthly Profit</p>
                <p className="text-xl font-bold text-primary mt-1">
                  {formatCurrency(stats.monthlyProfit)}
                </p>
              </div>
              <TrendingUp className="h-8 w-8 text-primary/30" />
            </div>
          </CardContent>
        </Card>
      </div>
    </AppLayout>
  );
}

// Summary Card Component
interface SummaryCardProps {
  title: string;
  value: string | null;
  icon: React.ElementType;
  iconColor?: string;
  highlight?: boolean;
}

function SummaryCard({ title, value, icon: Icon, iconColor = 'text-primary', highlight }: SummaryCardProps) {
  return (
    <Card className={cn('bg-card', highlight && 'border-warning/50')}>
      <CardContent className="p-3">
        <div className="flex items-start justify-between">
          <div className="min-w-0 flex-1">
            <p className="text-xs text-muted-foreground truncate">{title}</p>
            {value === null ? (
              <Skeleton className="h-6 w-16 mt-1" />
            ) : (
              <p className="text-lg font-bold mt-1 truncate">{value}</p>
            )}
          </div>
          <Icon className={cn('h-5 w-5 shrink-0', iconColor)} />
        </div>
      </CardContent>
    </Card>
  );
}

// Quick Action Button Component
interface QuickActionProps {
  icon: React.ElementType;
  label: string;
  onClick: () => void;
}

function QuickAction({ icon: Icon, label, onClick }: QuickActionProps) {
  return (
    <button
      onClick={onClick}
      className="flex flex-col items-center justify-center gap-1 p-3 rounded-lg bg-card border border-border hover:bg-muted/50 transition-colors touch-target"
    >
      <Icon className="h-5 w-5 text-primary" />
      <span className="text-[10px] font-medium text-center leading-tight">{label}</span>
    </button>
  );
}
