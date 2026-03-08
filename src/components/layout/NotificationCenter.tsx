import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  Bell, BellOff, Check, CheckCheck, Trash2, Package, 
  ShoppingCart, HardDrive, RefreshCw, MessageSquare, 
  Clock, ExternalLink, Filter
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { cn } from '@/lib/utils';
import { 
  getNotifications, 
  getUnreadCount, 
  markAsRead, 
  markAllAsRead, 
  deleteNotification, 
  deleteAllNotifications 
} from '@/services/notificationService';
import type { AppNotification, NotificationType } from '@/types/notification';
import { formatDistanceToNow } from 'date-fns';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';

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

export function NotificationCenter() {
  const [open, setOpen] = useState(false);
  const [tab, setTab] = useState('all');
  const navigate = useNavigate();

  // Live query for real-time updates
  const allNotifications = useLiveQuery(
    () => db.notifications.orderBy('createdAt').reverse().toArray().then(n => n.filter(x => x.isFired)),
    []
  ) ?? [];

  const unreadCount = allNotifications.filter(n => !n.isRead).length;

  const filtered = allNotifications.filter(n => {
    if (tab === 'unread') return !n.isRead;
    if (tab === 'system') return n.isSystem;
    if (tab === 'custom') return !n.isSystem;
    return true;
  });

  const handleMarkRead = async (id: string) => {
    await markAsRead(id);
  };

  const handleMarkAllRead = async () => {
    await markAllAsRead();
  };

  const handleDelete = async (id: string) => {
    await deleteNotification(id);
  };

  const handleClearAll = async () => {
    await deleteAllNotifications();
  };

  const showBadge = unreadCount > 0;

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className={cn('relative h-9 w-9', showBadge && 'text-destructive')}
        >
          <Bell className={cn('h-5 w-5', showBadge && 'animate-pulse')} />
          {showBadge && (
            <span className="absolute -top-0.5 -right-0.5 flex h-4 w-4 items-center justify-center">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-destructive opacity-75" />
              <span className="relative inline-flex h-3.5 w-3.5 items-center justify-center rounded-full bg-destructive text-[9px] font-bold text-destructive-foreground">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            </span>
          )}
          <span className="sr-only">Notifications</span>
        </Button>
      </SheetTrigger>
      <SheetContent side="right" className="w-full sm:w-96 p-0 flex flex-col">
        <SheetHeader className="p-4 pb-2 border-b border-border">
          <div className="flex items-center justify-between">
            <SheetTitle className="text-base">Notifications</SheetTitle>
            <div className="flex items-center gap-1">
              {unreadCount > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={handleMarkAllRead}>
                  <CheckCheck className="h-3 w-3 mr-1" />
                  Read all
                </Button>
              )}
              {allNotifications.length > 0 && (
                <Button variant="ghost" size="sm" className="h-7 text-xs text-destructive" onClick={handleClearAll}>
                  <Trash2 className="h-3 w-3 mr-1" />
                  Clear
                </Button>
              )}
            </div>
          </div>
        </SheetHeader>

        <Tabs value={tab} onValueChange={setTab} className="flex-1 flex flex-col min-h-0">
          <TabsList className="mx-4 mt-2 grid grid-cols-4 h-8">
            <TabsTrigger value="all" className="text-xs h-7">All</TabsTrigger>
            <TabsTrigger value="unread" className="text-xs h-7">
              Unread
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-1 h-4 px-1 text-[10px]">{unreadCount}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="system" className="text-xs h-7">System</TabsTrigger>
            <TabsTrigger value="custom" className="text-xs h-7">Custom</TabsTrigger>
          </TabsList>

          <ScrollArea className="flex-1 mt-2">
            <div className="px-4 pb-4 space-y-2">
              {filtered.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-12 text-muted-foreground">
                  <BellOff className="h-10 w-10 mb-3 opacity-40" />
                  <p className="text-sm font-medium">No notifications</p>
                  <p className="text-xs mt-1">You're all caught up!</p>
                </div>
              ) : (
                filtered.map(n => (
                  <NotificationItem
                    key={n.id}
                    notification={n}
                    onMarkRead={handleMarkRead}
                    onDelete={handleDelete}
                  />
                ))
              )}
            </div>
          </ScrollArea>
        </Tabs>

        {/* Footer link to full history */}
        <div className="border-t border-border p-3">
          <Button
            variant="outline"
            size="sm"
            className="w-full text-xs"
            onClick={() => { setOpen(false); navigate('/notifications'); }}
          >
            <ExternalLink className="h-3 w-3 mr-1" />
            View Full History
          </Button>
        </div>
      </SheetContent>
    </Sheet>
  );
}

function NotificationItem({
  notification: n,
  onMarkRead,
  onDelete,
}: {
  notification: AppNotification;
  onMarkRead: (id: string) => void;
  onDelete: (id: string) => void;
}) {
  const timeAgo = formatDistanceToNow(new Date(n.createdAt), { addSuffix: true });

  return (
    <div
      className={cn(
        'rounded-lg border p-3 transition-colors cursor-pointer',
        n.isRead
          ? 'bg-card border-border opacity-70'
          : 'bg-card border-primary/20',
        n.priority === 'critical' && !n.isRead && 'border-destructive/40 bg-destructive/5'
      )}
      onClick={() => !n.isRead && onMarkRead(n.id)}
    >
      <div className="flex items-start gap-3">
        <div className={cn('flex h-8 w-8 shrink-0 items-center justify-center rounded-full', typeColors[n.type])}>
          {typeIcons[n.type]}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <p className="text-sm font-medium truncate">{n.title}</p>
            {!n.isRead && (
              <span className="h-2 w-2 rounded-full bg-primary shrink-0" />
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.message}</p>
          <div className="flex items-center gap-2 mt-1.5">
            <span className="text-[10px] text-muted-foreground flex items-center gap-1">
              <Clock className="h-2.5 w-2.5" />
              {timeAgo}
            </span>
            {n.priority === 'critical' && (
              <Badge variant="destructive" className="h-4 px-1 text-[10px]">Critical</Badge>
            )}
            {!n.isSystem && (
              <Badge variant="secondary" className="h-4 px-1 text-[10px]">Custom</Badge>
            )}
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          className="h-6 w-6 shrink-0 opacity-0 group-hover:opacity-100"
          onClick={(e) => { e.stopPropagation(); onDelete(n.id); }}
        >
          <Trash2 className="h-3 w-3 text-muted-foreground" />
        </Button>
      </div>
    </div>
  );
}
