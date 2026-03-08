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
  Globe, 
  Palette, 
  Layout, 
  Cloud, 
  Database, 
  Bell, 
  Activity,
  ChevronRight,
  Download,
  RefreshCw,
  ImageIcon,
  Type,
  Info,
  Shield,
  FileText,
  Sparkles
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';

interface SettingItemProps {
  icon: React.ElementType;
  title: string;
  description?: string;
  onClick?: () => void;
  rightElement?: React.ReactNode;
  showChevron?: boolean;
}

function SettingItem({ 
  icon: Icon, 
  title, 
  description, 
  onClick, 
  rightElement,
  showChevron = true 
}: SettingItemProps) {
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-4 transition-colors',
        onClick && 'cursor-pointer hover:bg-muted/50'
      )}
      onClick={onClick}
    >
      <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
        <Icon className="h-5 w-5 text-primary" />
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
  const { notifications, setNotifications, appName } = useApp();
  const [search, setSearch] = useState('');

  const brandingItems = [
    {
      icon: ImageIcon,
      title: 'Branding',
      description: 'App name, logo customization',
      path: '/settings/branding',
    },
  ];

  const settingsItems = [
    {
      icon: Globe,
      title: 'Language & Localization',
      description: 'Currency format, date format',
      path: '/settings/language',
    },
    {
      icon: Palette,
      title: 'Theme & Appearance',
      description: 'Dark mode, AMOLED black',
      path: '/settings/theme',
    },
    {
      icon: Type,
      title: 'Typography & Icon Size',
      description: 'Text scale, icon size controls',
      path: '/settings/typography',
    },
    {
      icon: Layout,
      title: 'Navigation Layout',
      description: 'Bottom nav or sidebar drawer',
      path: '/settings/navigation',
    },
    {
      icon: Sparkles,
      title: 'Smart Autocomplete',
      description: 'Manage saved form suggestions',
      path: '/settings/autocomplete',
    },
  ];

  const syncItems = [
    {
      icon: Cloud,
      title: 'Google Drive Auto-Sync',
      description: 'Real-time backup in Excel, Sheets & JSON',
      path: '/settings/sync',
    },
    {
      icon: Database,
      title: 'Backup & Restore',
      description: 'Advanced backup and export operations',
      path: '/settings/backup',
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
    { icon: Info, title: 'About', description: 'App info, features & tech stack', path: '/settings/about' },
    { icon: Shield, title: 'Privacy Policy', description: 'How your data is handled', path: '/settings/privacy' },
    { icon: FileText, title: 'Terms & Conditions', description: 'Usage terms and limitations', path: '/settings/terms' },
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

      <div className="p-4 space-y-4">
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

        {/* Branding */}
        {filteredBranding.length > 0 && (
          <Card className="bg-card overflow-hidden">
            <CardContent className="p-0 divide-y divide-border">
              {filteredBranding.map((item) => (
                <SettingItem
                  key={item.path}
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                  onClick={() => navigate(item.path)}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* General Settings */}
        {filteredSettings.length > 0 && (
          <Card className="bg-card overflow-hidden">
            <CardContent className="p-0 divide-y divide-border">
              {filteredSettings.map((item) => (
                <SettingItem
                  key={item.path}
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                  onClick={() => navigate(item.path)}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Sync & Backup */}
        {filteredSync.length > 0 && (
          <Card className="bg-card overflow-hidden">
            <CardContent className="p-0 divide-y divide-border">
              {filteredSync.map((item) => (
                <SettingItem
                  key={item.path}
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                  onClick={() => navigate(item.path)}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* Notifications */}
        <Card className="bg-card overflow-hidden">
          <CardContent className="p-0">
            <SettingItem
              icon={Bell}
              title="Notifications"
              description="Low stock and sync alerts"
              onClick={handleNotificationsClick}
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
          </CardContent>
        </Card>

        {/* Activity Log */}
        <Card className="bg-card overflow-hidden">
          <CardContent className="p-0">
            <div className="p-4">
              <div 
                className="flex items-center gap-3 mb-4 cursor-pointer"
                onClick={() => navigate('/settings/activity-log')}
              >
                <div className="h-10 w-10 rounded-lg bg-muted flex items-center justify-center">
                  <Activity className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium">Activity Log</p>
                  <p className="text-sm text-muted-foreground">View all app activities</p>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
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
            </div>
          </CardContent>
        </Card>

        {/* Legal & Info */}
        {filteredLegal.length > 0 && (
          <Card className="bg-card overflow-hidden">
            <CardContent className="p-0 divide-y divide-border">
              {filteredLegal.map((item) => (
                <SettingItem
                  key={item.path}
                  icon={item.icon}
                  title={item.title}
                  description={item.description}
                  onClick={() => navigate(item.path)}
                />
              ))}
            </CardContent>
          </Card>
        )}

        {/* App Info */}
        <div className="text-center pt-4 pb-8 text-muted-foreground">
          <p className="text-sm font-medium">{appName}</p>
          <p className="text-xs">Inventory & Sales Manager</p>
          <p className="text-xs mt-1 font-mono text-primary/70">v1.2.0</p>
        </div>
      </div>
    </AppLayout>
  );
}
