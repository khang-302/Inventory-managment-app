import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  Bell, BellOff, CheckCheck, Trash2, Search, Package, 
  ShoppingCart, HardDrive, RefreshCw, MessageSquare, Clock,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications 
} from '@/services/notificationService';
import type { AppNotification, NotificationType } from '@/types/notification';
import { formatDistanceToNow, format } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel,
  AlertDialogContent, AlertDialogDescription, AlertDialogFooter,
  AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';

const typeIcons: Record<NotificationType, React.ReactNode> = {
  low_stock: <Package className="h-4 w-4" />,
  part_added: <Package className="h-4 w-4" />,
  part_sold: <ShoppingCart className="h-4 w-4" />,
  backup_complete: <HardDrive className="h-4 w-4" />,
  sync: <RefreshCw className="h-4 w-4" />,
  custom: <MessageSquare className="h-4 w-4" />,
};

const typeColors: Record<NotificationType, string> = {
  low_stock: 'bg-destructive/10 text-destructive',
  part_added: 'bg-primary/10 text-primary',
  part_sold: 'bg-green-500/10 text-green-600 dark:text-green-400',
  backup_complete: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
  sync: 'bg-primary/10 text-primary',
  custom: 'bg-accent text-accent-foreground',
};

const typeLabels: Record<NotificationType, string> = {
  low_stock: 'Low Stock',
  part_added: 'Part Added',
  part_sold: 'Part Sold',
  backup_complete: 'Backup',
  sync: 'Sync',
  custom: 'Custom',
};

export default function NotificationHistory() {
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [readFilter, setReadFilter] = useState<string>('all');

  const allNotifications = useLiveQuery(
    () => db.notifications.orderBy('createdAt').reverse().toArray().then(n => n.filter(x => x.isFired)),
    []
  ) ?? [];

  const filtered = allNotifications.filter(n => {
    if (typeFilter !== 'all' && n.type !== typeFilter) return false;
    if (readFilter === 'unread' && n.isRead) return false;
    if (readFilter === 'read' && !n.isRead) return false;
    if (search) {
      const s = search.toLowerCase();
      if (!n.title.toLowerCase().includes(s) && !n.message.toLowerCase().includes(s)) return false;
    }
    return true;
  });

  const unreadCount = allNotifications.filter(n => !n.isRead).length;

  return (
    <AppLayout>
      <Header 
        title="Notification History" 
        showBack 
        rightAction={
          <div className="flex items-center gap-1">
            {unreadCount > 0 && (
              <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => markAllAsRead()}>
                <CheckCheck className="h-3.5 w-3.5 mr-1" />
                Read all
              </Button>
            )}
            {allNotifications.length > 0 && (
              <AlertDialog>
                <AlertDialogTrigger asChild>
                  <Button variant="ghost" size="sm" className="h-8 text-xs text-destructive">
                    <Trash2 className="h-3.5 w-3.5" />
                  </Button>
                </AlertDialogTrigger>
                <AlertDialogContent>
                  <AlertDialogHeader>
                    <AlertDialogTitle>Clear All Notifications</AlertDialogTitle>
                    <AlertDialogDescription>
                      This will permanently delete all notification history. This cannot be undone.
                    </AlertDialogDescription>
                  </AlertDialogHeader>
                  <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction onClick={() => deleteAllNotifications()}>
                      Clear All
                    </AlertDialogAction>
                  </AlertDialogFooter>
                </AlertDialogContent>
              </AlertDialog>
            )}
          </div>
        }
      />

      <div className="p-4 space-y-3">
        {/* Search & Filters */}
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search notifications..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9"
            />
          </div>
        </div>

        <div className="flex gap-2">
          <Select value={typeFilter} onValueChange={setTypeFilter}>
            <SelectTrigger className="h-8 text-xs flex-1">
              <SelectValue placeholder="Type" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Types</SelectItem>
              <SelectItem value="low_stock">Low Stock</SelectItem>
              <SelectItem value="part_added">Part Added</SelectItem>
              <SelectItem value="part_sold">Part Sold</SelectItem>
              <SelectItem value="backup_complete">Backup</SelectItem>
              <SelectItem value="sync">Sync</SelectItem>
              <SelectItem value="custom">Custom</SelectItem>
            </SelectContent>
          </Select>
          <Select value={readFilter} onValueChange={setReadFilter}>
            <SelectTrigger className="h-8 text-xs flex-1">
              <SelectValue placeholder="Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All</SelectItem>
              <SelectItem value="unread">Unread</SelectItem>
              <SelectItem value="read">Read</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Stats bar */}
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span>{filtered.length} notification{filtered.length !== 1 ? 's' : ''}</span>
          {unreadCount > 0 && (
            <Badge variant="destructive" className="h-5 px-1.5 text-[10px]">
              {unreadCount} unread
            </Badge>
          )}
        </div>

        {/* Notification List */}
        {filtered.length === 0 ? (
          <Card className="bg-card">
            <CardContent className="flex flex-col items-center justify-center py-12 text-muted-foreground">
              <BellOff className="h-12 w-12 mb-3 opacity-30" />
              <p className="text-sm font-medium">No notifications found</p>
              <p className="text-xs mt-1">
                {search || typeFilter !== 'all' || readFilter !== 'all'
                  ? 'Try adjusting your filters'
                  : 'Notifications will appear here as you use the app'}
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-2">
            {filtered.map(n => (
              <Card
                key={n.id}
                className={cn(
                  'bg-card transition-colors',
                  !n.isRead && 'border-primary/20',
                  n.priority === 'critical' && !n.isRead && 'border-destructive/40 bg-destructive/5'
                )}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    <div className={cn('flex h-9 w-9 shrink-0 items-center justify-center rounded-full', typeColors[n.type])}>
                      {typeIcons[n.type]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <p className={cn('text-sm font-medium truncate', n.isRead && 'opacity-70')}>
                          {n.title}
                        </p>
                        {!n.isRead && <span className="h-2 w-2 rounded-full bg-primary shrink-0" />}
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{n.message}</p>
                      <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                        <span className="text-[10px] text-muted-foreground flex items-center gap-1">
                          <Clock className="h-2.5 w-2.5" />
                          {formatDistanceToNow(new Date(n.createdAt), { addSuffix: true })}
                        </span>
                        <Badge variant="outline" className="h-4 px-1 text-[10px]">
                          {typeLabels[n.type]}
                        </Badge>
                        {n.priority === 'critical' && (
                          <Badge variant="destructive" className="h-4 px-1 text-[10px]">Critical</Badge>
                        )}
                      </div>
                    </div>
                    <div className="flex flex-col gap-1 shrink-0">
                      {!n.isRead && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-7 w-7"
                          onClick={() => markAsRead(n.id)}
                        >
                          <CheckCheck className="h-3.5 w-3.5 text-primary" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        onClick={() => deleteNotification(n.id)}
                      >
                        <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </AppLayout>
  );
}
