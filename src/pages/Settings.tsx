import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { useApp } from '@/contexts/AppContext';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { 
  Search, 
  Languages, 
  Paintbrush, 
  PanelLeftClose, 
  CloudUpload, 
  HardDrive, 
  BellRing, 
  Activity,
  ChevronRight,
  Download,
  RefreshCw,
  Type,
  BadgeInfo,
  ShieldCheck,
  ScrollText,
  Wand2,
  Package,
  Tags,
  AlertTriangle,
  Store,
  Bug,
  MessageSquareWarning,
} from 'lucide-react';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SettingItemProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  onClick?: () => void;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
  iconBg?: string;
  iconColor?: string;
}

function SettingItem({ 
  icon: Icon, 
  title, 
  description, 
  onClick, 
  rightElement,
  showChevron = true,
  iconBg,
  iconColor,
}: SettingItemProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 transition-all duration-150',
        onClick && 'cursor-pointer hover:bg-muted/50 active:scale-[0.98]'
      )}
      onClick={onClick}
    >
      <div className={cn("h-10 w-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm", iconBg || "bg-primary/10")}>
        <Icon className={cn("h-5 w-5", iconColor || "text-primary")} />
      </div>
      <div className="flex-1 min-w-0">
        <p className="font-medium">{title}</p>
        {description && (
          <p className="text-sm text-muted-foreground mt-0.5">{description}</p>
        )}
      </div>
      {rightElement}
      {showChevron && onClick && (
        <ChevronRight className="h-5 w-5 text-muted-foreground shrink-0" />
      )}
    </div>
  );
}

export default function Settings() {
  const navigate = useNavigate();
  const { notifications, setNotifications, appName, totalParts, totalBrands, stats, customLogo, refreshStats } = useApp();
  const [search, setSearch] = useState('');

  const brandingItems = [
    {
      icon: Store,
      title: 'Branding',
      description: 'App name, logo customization',
      path: '/settings/branding',
      iconBg: 'bg-primary/10',
      iconColor: 'text-primary',
    },
  ];

  const settingsItems = [
    {
      icon: Languages,
      title: 'Language & Localization',
      description: 'Currency format, date format',
      path: '/settings/language',
      iconBg: 'bg-blue-500/10',
      iconColor: 'text-blue-500',
    },
    {
      icon: Paintbrush,
      title: 'Theme & Appearance',
      description: 'Dark mode, AMOLED black',
      path: '/settings/theme',
      iconBg: 'bg-purple-500/10',
      iconColor: 'text-purple-500',
    },
    {
      icon: Type,
      title: 'Typography & Icon Size',
      description: 'Text scale, icon size controls',
      path: '/settings/typography',
      iconBg: 'bg-indigo-500/10',
      iconColor: 'text-indigo-500',
    },
    {
      icon: PanelLeftClose,
      title: 'Navigation Layout',
      description: 'Bottom nav or sidebar drawer',
      path: '/settings/navigation',
      iconBg: 'bg-teal-500/10',
      iconColor: 'text-teal-500',
    },
    {
      icon: Wand2,
      title: 'Smart Autocomplete',
      description: 'Manage saved form suggestions',
      path: '/settings/autocomplete',
      iconBg: 'bg-amber-500/10',
      iconColor: 'text-amber-500',
    },
  ];

  const syncItems = [
    {
      icon: CloudUpload,
      title: 'Google Drive Auto-Sync',
      description: 'Real-time backup in Excel, Sheets & JSON',
      path: '/settings/sync',
      iconBg: 'bg-sky-500/10',
      iconColor: 'text-sky-500',
    },
    {
      icon: HardDrive,
      title: 'Backup & Restore',
      description: 'Advanced backup and export operations',
      path: '/settings/backup',
      iconBg: 'bg-emerald-500/10',
      iconColor: 'text-emerald-500',
    },
  ];

  const handleNotificationsClick = () => {
    navigate('/settings/notifications');
  };

  const filteredBranding = search
    ? brandingItems.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
      )
    : brandingItems;

  const filteredSettings = search
    ? settingsItems.filter(item => 
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
      )
    : settingsItems;

  const filteredSync = search
    ? syncItems.filter(item => 
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
      )
    : syncItems;

  const legalItems = [
    { icon: BadgeInfo, title: 'About', description: 'App info, features & tech stack', path: '/settings/about', iconBg: 'bg-slate-500/10', iconColor: 'text-slate-500' },
    { icon: ShieldCheck, title: 'Privacy Policy', description: 'How your data is handled', path: '/settings/privacy', iconBg: 'bg-green-500/10', iconColor: 'text-green-500' },
    { icon: ScrollText, title: 'Terms & Conditions', description: 'Usage terms and limitations', path: '/settings/terms', iconBg: 'bg-rose-500/10', iconColor: 'text-rose-500' },
  ];

  const filteredLegal = search
    ? legalItems.filter(item =>
        item.title.toLowerCase().includes(search.toLowerCase()) ||
        item.description?.toLowerCase().includes(search.toLowerCase())
      )
    : legalItems;

  return (
    <AppLayout>
      <Header title="Settings" />

      <div className="p-4 space-y-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search settings..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10 bg-card"
          />
        </div>

        {/* Profile Card */}
        {!search && (
          <div className="animate-fade-in opacity-0" style={{ animationDelay: '0ms', animationFillMode: 'forwards' }}>
            <Card className="bg-card overflow-hidden cursor-pointer hover:bg-muted/30 transition-colors" onClick={() => navigate('/settings/branding')}>
              <CardContent className="p-6 flex flex-col items-center text-center space-y-4">
                <Avatar className="h-20 w-20">
                  {customLogo ? (
                    <AvatarImage src={customLogo} alt={appName} />
                  ) : null}
                  <AvatarFallback className="bg-primary/10 text-primary text-2xl font-bold">
                    <Store className="h-8 w-8" />
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h2 className="text-xl font-bold">{appName}</h2>
                  <p className="text-sm text-muted-foreground">Inventory & Sales Manager</p>
                  <p className="text-xs text-primary mt-1">Tap to edit branding →</p>
                </div>
                <div className="flex gap-3 w-full justify-center">
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
                    <Package className="h-4 w-4 text-primary" />
                    <div className="text-left">
                      <p className="text-sm font-semibold">{totalParts}</p>
                      <p className="text-[10px] text-muted-foreground">Parts</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
                    <Tags className="h-4 w-4 text-primary" />
                    <div className="text-left">
                      <p className="text-sm font-semibold">{totalBrands}</p>
                      <p className="text-[10px] text-muted-foreground">Brands</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 rounded-lg border border-border bg-muted/50 px-3 py-2">
                    <AlertTriangle className="h-4 w-4 text-destructive" />
                    <div className="text-left">
                      <p className="text-sm font-semibold">{stats.lowStockCount}</p>
                      <p className="text-[10px] text-muted-foreground">Low Stock</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Branding */}
        {filteredBranding.length > 0 && (
          <div className="space-y-1.5 animate-fade-in opacity-0" style={{ animationDelay: '60ms', animationFillMode: 'forwards' }}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Branding</p>
            <Card className="bg-card overflow-hidden">
              <CardContent className="p-0 divide-y divide-border">
                {filteredBranding.map((item) => (
                  <SettingItem
                    key={item.path}
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                    onClick={() => navigate(item.path)}
                    iconBg={item.iconBg}
                    iconColor={item.iconColor}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* General Settings */}
        {filteredSettings.length > 0 && (
          <div className="space-y-1.5 animate-fade-in opacity-0" style={{ animationDelay: '120ms', animationFillMode: 'forwards' }}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">General</p>
            <Card className="bg-card overflow-hidden">
              <CardContent className="p-0 divide-y divide-border">
                {filteredSettings.map((item) => (
                  <SettingItem
                    key={item.path}
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                    onClick={() => navigate(item.path)}
                    iconBg={item.iconBg}
                    iconColor={item.iconColor}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Data & Sync */}
        {(filteredSync.length > 0 || !search || 'notifications'.includes(search.toLowerCase())) && (
          <div className="space-y-1.5 animate-fade-in opacity-0" style={{ animationDelay: '180ms', animationFillMode: 'forwards' }}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Data & Sync</p>
            <Card className="bg-card overflow-hidden">
              <CardContent className="p-0 divide-y divide-border">
                {filteredSync.map((item) => (
                  <SettingItem
                    key={item.path}
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                    onClick={() => navigate(item.path)}
                    iconBg={item.iconBg}
                    iconColor={item.iconColor}
                  />
                ))}
                {(!search || 'notifications'.includes(search.toLowerCase()) || 'low stock'.includes(search.toLowerCase()) || 'alerts'.includes(search.toLowerCase())) && (
                  <SettingItem
                    icon={BellRing}
                    title="Notifications"
                    description="Low stock and sync alerts"
                    onClick={handleNotificationsClick}
                    iconBg="bg-orange-500/10"
                    iconColor="text-orange-500"
                    rightElement={
                      <Switch
                        checked={notifications}
                        onCheckedChange={(checked) => {
                          setNotifications(checked);
                        }}
                        onClick={(e) => e.stopPropagation()}
                      />
                    }
                  />
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {(!search || 'activity log backup sync error crash'.includes(search.toLowerCase())) && (
          <div className="space-y-1.5 animate-fade-in opacity-0" style={{ animationDelay: '240ms', animationFillMode: 'forwards' }}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Activity & Logs</p>
            <Card className="bg-card overflow-hidden">
              <CardContent className="p-0 divide-y divide-border">
                <SettingItem
                  icon={Activity}
                  title="Activity Log"
                  description="View all app activities"
                  onClick={() => navigate('/settings/activity-log')}
                />
                <SettingItem
                  icon={Bug}
                  title="Error Logs"
                  description="View crash reports and send diagnostics"
                  onClick={() => navigate('/settings/crash-logs')}
                  iconBg="bg-destructive/10"
                  iconColor="text-destructive"
                />
              </CardContent>
            </Card>
            <div className="flex gap-2 px-1 pt-1">
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
          </div>
        )}

        {/* Help & Support */}
        {(!search || 'help support report problem bug'.includes(search.toLowerCase())) && (
          <div className="space-y-1.5 animate-fade-in opacity-0" style={{ animationDelay: '270ms', animationFillMode: 'forwards' }}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Help & Support</p>
            <Card className="bg-card overflow-hidden">
              <CardContent className="p-0">
                <SettingItem
                  icon={MessageSquareWarning}
                  title="Report a Problem"
                  description="Send bug report to developer"
                  onClick={() => navigate('/settings/report-problem')}
                  iconBg="bg-orange-500/10"
                  iconColor="text-orange-500"
                />
              </CardContent>
            </Card>
          </div>
        )}

        {/* Legal & Info */}
        {filteredLegal.length > 0 && (
          <div className="space-y-1.5 animate-fade-in opacity-0" style={{ animationDelay: '300ms', animationFillMode: 'forwards' }}>
            <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground px-1">Legal & Info</p>
            <Card className="bg-card overflow-hidden">
              <CardContent className="p-0 divide-y divide-border">
                {filteredLegal.map((item) => (
                  <SettingItem
                    key={item.path}
                    icon={item.icon}
                    title={item.title}
                    description={item.description}
                    onClick={() => navigate(item.path)}
                    iconBg={item.iconBg}
                    iconColor={item.iconColor}
                  />
                ))}
              </CardContent>
            </Card>
          </div>
        )}

        {/* App Info */}
        <div className="text-center pt-4 pb-8 text-muted-foreground animate-fade-in opacity-0" style={{ animationDelay: '360ms', animationFillMode: 'forwards' }}>
          <p className="text-sm font-medium">{appName}</p>
          <p className="text-xs">Inventory & Sales Manager</p>
          <p className="text-xs mt-1 font-mono text-primary/70">v1.2.0</p>
        </div>
      </div>
    </AppLayout>
  );
}
