import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLiveQuery } from 'dexie-react-hooks';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { db } from '@/db/database';
import { getRelativeDate, formatTime } from '@/utils/dateUtils';
import { getActivityIcon, getActivityColor } from '@/services/activityLogService';
import { 
  Plus, 
  Pencil, 
  Trash2, 
  ShoppingCart, 
  Download, 
  Upload, 
  RefreshCw,
  Activity,
  SlidersHorizontal
} from 'lucide-react';
import { cn } from '@/lib/utils';
import type { ActivityAction } from '@/types';

const iconMap: Record<string, React.ElementType> = {
  Plus,
  Pencil,
  Trash2,
  ShoppingCart,
  Download,
  Upload,
  RefreshCw,
  Activity,
};

const ACTION_FILTERS = [
  { value: 'all', label: 'All Activities' },
  { value: 'create', label: 'Created' },
  { value: 'update', label: 'Updated' },
  { value: 'delete', label: 'Deleted' },
  { value: 'sale', label: 'Sales' },
  { value: 'backup', label: 'Backups' },
  { value: 'restore', label: 'Restores' },
  { value: 'sync', label: 'Syncs' },
];

const DATE_FILTERS = [
  { value: 'all', label: 'All Time' },
  { value: 'today', label: 'Today' },
  { value: 'week', label: 'This Week' },
  { value: 'month', label: 'This Month' },
];

export default function ActivityLogSettings() {
  const navigate = useNavigate();
  const [actionFilter, setActionFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');

  const activityLogs = useLiveQuery(
    () => db.activityLogs.orderBy('createdAt').reverse().toArray(),
    []
  ) ?? [];

  const filteredLogs = activityLogs.filter(log => {
    // Action filter
    if (actionFilter !== 'all' && log.action !== actionFilter) {
      return false;
    }

    // Date filter
    if (dateFilter !== 'all') {
      const logDate = new Date(log.createdAt);
      const now = new Date();
      
      switch (dateFilter) {
        case 'today':
          const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
          if (logDate < today) return false;
          break;
        case 'week':
          const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
          if (logDate < weekAgo) return false;
          break;
        case 'month':
          const monthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
          if (logDate < monthAgo) return false;
          break;
      }
    }

    return true;
  });

  const getIcon = (action: ActivityAction) => {
    const iconName = getActivityIcon(action);
    return iconMap[iconName] || Activity;
  };

  return (
    <AppLayout>
      <Header title="Activity Log" showBack />

      <div className="p-4 space-y-4">
        {/* Action Buttons */}
        <div className="flex gap-2">
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate('/settings/backup')}
          >
            <Download className="h-4 w-4 mr-2" />
            Backup
          </Button>
          <Button 
            variant="outline" 
            className="flex-1"
            onClick={() => navigate('/settings/sync')}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Sync
          </Button>
        </div>

        {/* Filters */}
        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Filter className="h-5 w-5 text-primary" />
              Filters
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">Activity Type</label>
                <Select value={actionFilter} onValueChange={setActionFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {ACTION_FILTERS.map((filter) => (
                      <SelectItem key={filter.value} value={filter.value}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <label className="text-sm text-muted-foreground">Date Range</label>
                <Select value={dateFilter} onValueChange={setDateFilter}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {DATE_FILTERS.map((filter) => (
                      <SelectItem key={filter.value} value={filter.value}>
                        {filter.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Activity Count */}
        <p className="text-sm text-muted-foreground">
          Showing {filteredLogs.length} of {activityLogs.length} activities
        </p>

        {/* Activity List */}
        {filteredLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 text-center">
            <Activity className="h-12 w-12 text-muted-foreground/50 mb-4" />
            <p className="text-muted-foreground">No activities found</p>
            <p className="text-sm text-muted-foreground/70 mt-1">
              {actionFilter !== 'all' || dateFilter !== 'all' 
                ? 'Try adjusting your filters' 
                : 'Activities will appear here as you use the app'}
            </p>
          </div>
        ) : (
          <Card className="bg-card">
            <CardContent className="p-0 divide-y divide-border">
              {filteredLogs.map((log) => {
                const Icon = getIcon(log.action);
                const colorClass = getActivityColor(log.action);
                
                return (
                  <div key={log.id} className="flex items-start gap-3 p-4">
                    <div className={cn(
                      'h-8 w-8 rounded-full flex items-center justify-center shrink-0',
                      'bg-muted'
                    )}>
                      <Icon className={cn('h-4 w-4', colorClass)} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm leading-snug">{log.description}</p>
                      <div className="flex items-center gap-2 mt-1">
                        <span className="text-xs text-muted-foreground">
                          {getRelativeDate(log.createdAt)}
                        </span>
                        <span className="text-xs text-muted-foreground">•</span>
                        <span className="text-xs text-muted-foreground">
                          {formatTime(log.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        )}
      </div>
    </AppLayout>
  );
}
