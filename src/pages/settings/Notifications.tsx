import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription
} from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger
} from '@/components/ui/alert-dialog';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import {
  Bell, BellOff, Package, ShoppingCart, HardDrive, RefreshCw,
  Check, Plus, Trash2, Volume2, VolumeX, Clock, Send,
  FileText, MessageSquare, ExternalLink, Calendar
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import {
  getNotificationPrefs, saveNotificationPrefs,
  createNotification, createTemplate, getTemplates, deleteTemplate,
} from '@/services/notificationService';
import type { NotificationPreferences, NotificationTemplate, NotificationTrigger, RepeatInterval } from '@/types/notification';
import { useLiveQuery } from 'dexie-react-hooks';
import { db } from '@/db/database';

export default function Notifications() {
  const { notifications, setNotifications } = useApp();
  const navigate = useNavigate();
  const [prefs, setPrefs] = useState<NotificationPreferences>({
    lowStock: true, partAdded: true, partSold: true,
    backupComplete: true, sync: true, soundEnabled: false,
  });
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  // Custom notification dialog
  const [showCreate, setShowCreate] = useState(false);
  const [customTitle, setCustomTitle] = useState('');
  const [customMessage, setCustomMessage] = useState('');
  const [customPriority, setCustomPriority] = useState<'normal' | 'critical'>('normal');
  const [customTrigger, setCustomTrigger] = useState<NotificationTrigger>('immediate');
  const [customScheduledAt, setCustomScheduledAt] = useState('');
  const [customRepeat, setCustomRepeat] = useState<RepeatInterval>('daily');
  const [saveAsTemplate, setSaveAsTemplate] = useState(false);

  // Template dialog
  const [showTemplates, setShowTemplates] = useState(false);

  // Live query for templates
  const templates = useLiveQuery(() => db.notificationTemplates.orderBy('createdAt').reverse().toArray(), []) ?? [];

  // Live query for notification count
  const totalCount = useLiveQuery(() => db.notifications.count(), []) ?? 0;
  const unreadCount = useLiveQuery(
    () => db.notifications.where('isRead').equals(0).count(),
    []
  ) ?? 0;

  useEffect(() => {
    const load = async () => {
      try {
        const p = await getNotificationPrefs();
        setPrefs(p);
      } catch (e) { console.error(e); }
      finally { setIsLoading(false); }
    };
    load();
  }, []);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await saveNotificationPrefs(prefs);
      toast.success('Notification settings saved');
    } catch { toast.error('Failed to save'); }
    finally { setIsSaving(false); }
  };

  const handleCreateCustom = async () => {
    if (!customTitle.trim() || !customMessage.trim()) {
      toast.error('Title and message are required');
      return;
    }
    try {
      await createNotification({
        type: 'custom',
        title: customTitle.trim(),
        message: customMessage.trim(),
        priority: customPriority,
        triggerType: customTrigger,
        scheduledAt: customTrigger !== 'immediate' && customScheduledAt ? new Date(customScheduledAt) : undefined,
        repeatInterval: customTrigger === 'recurring' ? customRepeat : undefined,
        isSystem: false,
      });
      if (saveAsTemplate) {
        await createTemplate(customTitle.trim(), customMessage.trim());
      }
      toast.success(
        customTrigger === 'immediate' ? 'Notification created' :
        customTrigger === 'scheduled' ? 'Notification scheduled' : 'Recurring notification set'
      );
      setShowCreate(false);
      resetForm();
    } catch { toast.error('Failed to create notification'); }
  };

  const resetForm = () => {
    setCustomTitle('');
    setCustomMessage('');
    setCustomPriority('normal');
    setCustomTrigger('immediate');
    setCustomScheduledAt('');
    setCustomRepeat('daily');
    setSaveAsTemplate(false);
  };

  const applyTemplate = (t: NotificationTemplate) => {
    setCustomTitle(t.title);
    setCustomMessage(t.message);
    setShowTemplates(false);
    setShowCreate(true);
  };

  if (isLoading) {
    return (
      <AppLayout>
        <Header title="Notifications" showBack />
        <div className="p-4">
          <div className="animate-pulse space-y-4">
            <div className="h-24 bg-muted rounded-lg" />
            <div className="h-48 bg-muted rounded-lg" />
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <Header title="Notifications" showBack />
      <div className="p-4 space-y-4">

        {/* Master Toggle */}
        <Card className="bg-card">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                  notifications ? 'bg-primary/20' : 'bg-muted'
                }`}>
                  {notifications ? <Bell className="h-5 w-5 text-primary" /> : <BellOff className="h-5 w-5 text-muted-foreground" />}
                </div>
                <div>
                  <Label className="font-medium">All Notifications</Label>
                  <p className="text-sm text-muted-foreground">
                    {notifications ? 'Notifications are enabled' : 'All notifications disabled'}
                  </p>
                </div>
              </div>
              <Switch checked={notifications} onCheckedChange={setNotifications} />
            </div>
          </CardContent>
        </Card>

        {/* Per-Type Toggles */}
        <Card className={`bg-card ${!notifications ? 'opacity-50 pointer-events-none' : ''}`}>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Notification Types</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <ToggleRow icon={<Package className="h-4 w-4 text-destructive" />} bgClass="bg-destructive/20"
              label="Low Stock Alerts" desc="When items are running low"
              checked={prefs.lowStock} onChange={v => setPrefs(p => ({ ...p, lowStock: v }))} />
            <ToggleRow icon={<Package className="h-4 w-4 text-primary" />} bgClass="bg-primary/20"
              label="Part Added" desc="When new parts are added"
              checked={prefs.partAdded} onChange={v => setPrefs(p => ({ ...p, partAdded: v }))} />
            <ToggleRow icon={<ShoppingCart className="h-4 w-4 text-green-500" />} bgClass="bg-green-500/20"
              label="Part Sold" desc="When a sale is recorded"
              checked={prefs.partSold} onChange={v => setPrefs(p => ({ ...p, partSold: v }))} />
            <ToggleRow icon={<HardDrive className="h-4 w-4 text-blue-500" />} bgClass="bg-blue-500/20"
              label="Backup Completed" desc="When a backup finishes"
              checked={prefs.backupComplete} onChange={v => setPrefs(p => ({ ...p, backupComplete: v }))} />
            <ToggleRow icon={<RefreshCw className="h-4 w-4 text-primary" />} bgClass="bg-primary/20"
              label="Sync Alerts" desc="Sync status updates"
              checked={prefs.sync} onChange={v => setPrefs(p => ({ ...p, sync: v }))} />
          </CardContent>
        </Card>

        {/* Sound Toggle */}
        <Card className={`bg-card ${!notifications ? 'opacity-50 pointer-events-none' : ''}`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${prefs.soundEnabled ? 'bg-primary/20' : 'bg-muted'}`}>
                  {prefs.soundEnabled ? <Volume2 className="h-4 w-4 text-primary" /> : <VolumeX className="h-4 w-4 text-muted-foreground" />}
                </div>
                <div>
                  <Label className="font-medium">Sound for Critical Alerts</Label>
                  <p className="text-sm text-muted-foreground">Play a beep for critical notifications</p>
                </div>
              </div>
              <Switch checked={prefs.soundEnabled} onCheckedChange={v => setPrefs(p => ({ ...p, soundEnabled: v }))} />
            </div>
          </CardContent>
        </Card>

        {/* Custom Notifications */}
        <Card className="bg-card">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base">Custom Notifications</CardTitle>
              <div className="flex gap-1">
                {templates.length > 0 && (
                  <Button variant="ghost" size="sm" className="h-7 text-xs" onClick={() => setShowTemplates(true)}>
                    <FileText className="h-3.5 w-3.5 mr-1" />
                    Templates
                  </Button>
                )}
                <Button variant="outline" size="sm" className="h-7 text-xs" onClick={() => setShowCreate(true)}>
                  <Plus className="h-3.5 w-3.5 mr-1" />
                  Create
                </Button>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              Create custom reminders that fire immediately, at a scheduled time, or on a recurring basis.
              Save messages as templates for reuse.
            </p>
          </CardContent>
        </Card>

        {/* History Link */}
        <Card className="bg-card">
          <CardContent className="p-4">
            <Button variant="outline" className="w-full" onClick={() => navigate('/notifications')}>
              <ExternalLink className="h-4 w-4 mr-2" />
              View Notification History
              {unreadCount > 0 && (
                <Badge variant="destructive" className="ml-2 h-5 px-1.5 text-[10px]">{unreadCount} unread</Badge>
              )}
            </Button>
          </CardContent>
        </Card>

        {/* Info */}
        <Card className="bg-card">
          <CardContent className="p-4">
            <p className="text-sm text-muted-foreground">
              <strong>Note:</strong> Notifications are in-app only and work completely offline. Your privacy is protected.
            </p>
          </CardContent>
        </Card>

        {/* Save */}
        <Button className="w-full" size="lg" onClick={handleSave} disabled={isSaving}>
          <Check className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>

      {/* Create Custom Notification Dialog */}
      <Dialog open={showCreate} onOpenChange={setShowCreate}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Create Custom Notification</DialogTitle>
            <DialogDescription>Set up a custom notification or reminder.</DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label>Title</Label>
              <Input value={customTitle} onChange={e => setCustomTitle(e.target.value)} placeholder="Notification title" />
            </div>
            <div>
              <Label>Message</Label>
              <Textarea value={customMessage} onChange={e => setCustomMessage(e.target.value)} placeholder="Notification message" rows={3} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label>Priority</Label>
                <Select value={customPriority} onValueChange={v => setCustomPriority(v as any)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="normal">Normal</SelectItem>
                    <SelectItem value="critical">Critical</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Trigger</Label>
                <Select value={customTrigger} onValueChange={v => setCustomTrigger(v as any)}>
                  <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="immediate">Immediate</SelectItem>
                    <SelectItem value="scheduled">Scheduled</SelectItem>
                    <SelectItem value="recurring">Recurring</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            {customTrigger === 'scheduled' && (
              <div>
                <Label>Schedule Date & Time</Label>
                <Input type="datetime-local" value={customScheduledAt} onChange={e => setCustomScheduledAt(e.target.value)} />
              </div>
            )}
            {customTrigger === 'recurring' && (
              <div className="space-y-3">
                <div>
                  <Label>Start Date & Time</Label>
                  <Input type="datetime-local" value={customScheduledAt} onChange={e => setCustomScheduledAt(e.target.value)} />
                </div>
                <div>
                  <Label>Repeat Every</Label>
                  <Select value={customRepeat} onValueChange={v => setCustomRepeat(v as any)}>
                    <SelectTrigger className="h-9"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}
            <div className="flex items-center gap-2">
              <Switch checked={saveAsTemplate} onCheckedChange={setSaveAsTemplate} />
              <Label className="text-sm">Save as reusable template</Label>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setShowCreate(false)}>Cancel</Button>
            <Button onClick={handleCreateCustom}>
              {customTrigger === 'immediate' ? <Send className="h-4 w-4 mr-1" /> : <Clock className="h-4 w-4 mr-1" />}
              {customTrigger === 'immediate' ? 'Send Now' : customTrigger === 'scheduled' ? 'Schedule' : 'Set Recurring'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Templates Dialog */}
      <Dialog open={showTemplates} onOpenChange={setShowTemplates}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Notification Templates</DialogTitle>
            <DialogDescription>Reuse saved message templates.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 max-h-64 overflow-y-auto">
            {templates.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">No templates saved yet</p>
            ) : templates.map(t => (
              <Card key={t.id} className="bg-card">
                <CardContent className="p-3 flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0 cursor-pointer" onClick={() => applyTemplate(t)}>
                    <p className="text-sm font-medium truncate">{t.title}</p>
                    <p className="text-xs text-muted-foreground line-clamp-2">{t.message}</p>
                  </div>
                  <Button variant="ghost" size="icon" className="h-7 w-7 shrink-0" onClick={() => deleteTemplate(t.id)}>
                    <Trash2 className="h-3.5 w-3.5 text-muted-foreground" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </AppLayout>
  );
}

function ToggleRow({ icon, bgClass, label, desc, checked, onChange }: {
  icon: React.ReactNode; bgClass: string; label: string; desc: string;
  checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className={`h-9 w-9 rounded-lg flex items-center justify-center ${bgClass}`}>{icon}</div>
        <div>
          <Label className="font-medium">{label}</Label>
          <p className="text-sm text-muted-foreground">{desc}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}
