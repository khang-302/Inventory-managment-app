import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { 
  BellOff, CheckCheck, Trash2, Search, Package, 
  ShoppingCart, HardDrive, RefreshCw, MessageSquare, Clock,
  ListChecks, X
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  markAsRead, markAllAsRead, deleteNotification, deleteAllNotifications 
} from '@/services/notificationService';
import { db } from '@/db/database';
import type { AppNotification, NotificationType } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';
import { toast } from 'sonner';
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
  const [selectMode, setSelectMode] = useState(false);
  const [selected, setSelected] = useState<Set<string>>(new Set());

  const allNotifications = useLiveQuery(
    () => db.notifications.orderBy('createdAt').reverse().toArray()
      .then(n => n.filter(x => x.isFired))
      .catch(() => [] as AppNotification[]),
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

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const selectAll = () => {
    setSelected(new Set(filtered.map(n => n.id)));
  };

  const deselectAll = () => {
    setSelected(new Set());
  };

  const exitSelectMode = () => {
    setSelectMode(false);
    setSelected(new Set());
  };

  const handleBulkDelete = async () => {
    if (selected.size === 0) return;
    try {
      await Promise.all(Array.from(selected).map(id => deleteNotification(id)));
      toast.success(`Deleted ${selected.size} notification${selected.size !== 1 ? 's' : ''}`);
      exitSelectMode();
    } catch {
      toast.error('Failed to delete notifications');
    }
  };

  const handleBulkMarkRead = async () => {
    if (selected.size === 0) return;
    try {
      await Promise.all(Array.from(selected).map(id => markAsRead(id)));
      toast.success(`Marked ${selected.size} as read`);
      exitSelectMode();
    } catch {
      toast.error('Failed to mark as read');
    }
  };

  const allFilteredSelected = filtered.length > 0 && filtered.every(n => selected.has(n.id));

  return (
    <AppLayout>
      <Header 
        title="Notification History" 
        showBack 
        rightAction={
          selectMode ? (
            <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={exitSelectMode}>
              <X className="h-3.5 w-3.5 mr-1" />
              Cancel
            </Button>
          ) : (
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => markAllAsRead()}>
                  <CheckCheck className="h-3.5 w-3.5 mr-1" />
                  Read all
                </Button>
              )}
              {allNotifications.length > 0 && (
                <>
                  <Button variant="ghost" size="sm" className="h-8 text-xs" onClick={() => setSelectMode(true)}>
                    <ListChecks className="h-3.5 w-3.5" />
                  </Button>
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
                </>
              )}
            </div>
          )
        }
      />

      <div className="p-4 space-y-3">
        {/* Bulk action bar */}
        {selectMode && (
          <Card className="bg-primary/5 border-primary/20">
            <CardContent className="p-3">
              <div className="flex items-center justify-between gap-2">
                <div className="flex items-center gap-2">
                  <Checkbox
                    checked={allFilteredSelected}
                    onCheckedChange={(checked) => checked ? selectAll() : deselectAll()}
                  />
                  <span className="text-xs font-medium">
                    {selected.size} selected
                  </span>
                </div>
                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    className="h-7 text-xs"
                    disabled={selected.size === 0}
                    onClick={handleBulkMarkRead}
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Read
                  </Button>
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button
                        variant="destructive"
                        size="sm"
                        className="h-7 text-xs"
                        disabled={selected.size === 0}
                      >
                        <Trash2 className="h-3 w-3 mr-1" />
                        Delete
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Delete {selected.size} Notification{selected.size !== 1 ? 's' : ''}?</AlertDialogTitle>
                        <AlertDialogDescription>
                          This will permanently delete the selected notifications. This cannot be undone.
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction onClick={handleBulkDelete}>Delete</AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

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
                  n.priority === 'critical' && !n.isRead && 'border-destructive/40 bg-destructive/5',
                  selectMode && selected.has(n.id) && 'border-primary ring-1 ring-primary/30'
                )}
                onClick={selectMode ? () => toggleSelect(n.id) : undefined}
              >
                <CardContent className="p-3">
                  <div className="flex items-start gap-3">
                    {selectMode && (
                      <div className="pt-0.5 shrink-0">
                        <Checkbox
                          checked={selected.has(n.id)}
                          onCheckedChange={() => toggleSelect(n.id)}
                          onClick={(e) => e.stopPropagation()}
                        />
                      </div>
                    )}
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
                    {!selectMode && (
                      <div className="flex flex-col gap-1 shrink-0">
                        {!n.isRead && (
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => markAsRead(n.id)}>
                            <CheckCheck className="h-3.5 w-3.5 text-primary" />
                          </Button>
                        )}
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => deleteNotification(n.id)}>
                          <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                        </Button>
                      </div>
                    )}
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
