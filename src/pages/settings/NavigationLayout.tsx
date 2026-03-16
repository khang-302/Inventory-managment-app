import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { Header } from '@/components/layout/Header';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useApp } from '@/contexts/AppContext';
import { toast } from 'sonner';
import {
  Layout, Tag, Eye, Check, PanelLeft, Grid2X2,
  LayoutGrid, Warehouse, Receipt, TrendingUp, SlidersHorizontal,
  Paintbrush, Maximize2, Sparkles, Zap,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';

type NavigationLayoutType = 'bottom' | 'sidebar';
type NavIconStyle = 'outline' | 'filled' | 'rounded';
type NavIconSize = 'small' | 'medium' | 'large';
type NavHighlightStyle = 'icon-only' | 'icon-label' | 'background';
type NavAnimation = 'none' | 'fade' | 'slide';

const LAYOUT_OPTIONS = [
  { value: 'bottom' as const, label: 'Bottom Navigation', description: 'Classic tab bar at the bottom', icon: Grid2X2 },
  { value: 'sidebar' as const, label: 'Side Navigation Drawer', description: 'Slide-out menu from the left', icon: PanelLeft },
];

const ICON_STYLE_OPTIONS: { value: NavIconStyle; label: string; strokeWidth: number; linecap?: string }[] = [
  { value: 'outline', label: 'Outline', strokeWidth: 1.5 },
  { value: 'filled', label: 'Filled', strokeWidth: 2 },
  { value: 'rounded', label: 'Rounded', strokeWidth: 2, linecap: 'round' },
];

const ICON_SIZE_OPTIONS: { value: NavIconSize; label: string }[] = [
  { value: 'small', label: 'Small' },
  { value: 'medium', label: 'Medium' },
  { value: 'large', label: 'Large' },
];

const HIGHLIGHT_OPTIONS: { value: NavHighlightStyle; label: string; description: string }[] = [
  { value: 'icon-only', label: 'Icon color only', description: 'Only the icon changes color' },
  { value: 'icon-label', label: 'Icon + label color', description: 'Both icon and label change color' },
  { value: 'background', label: 'Background highlight', description: 'Soft background behind active item' },
];

const ANIMATION_OPTIONS: { value: NavAnimation; label: string; description: string }[] = [
  { value: 'none', label: 'None', description: 'No animation' },
  { value: 'fade', label: 'Smooth fade', description: 'Gentle opacity transition' },
  { value: 'slide', label: 'Slide highlight', description: 'Sliding indicator bar' },
];

const NAV_ITEMS = [
  { label: 'Dashboard', icon: LayoutGrid },
  { label: 'Inventory', icon: Warehouse },
  { label: 'Bill', icon: Receipt },
  { label: 'Report', icon: TrendingUp },
  { label: 'Setting', icon: SlidersHorizontal },
];

const ICON_SIZE_MAP = { small: 'h-3.5 w-3.5', medium: 'h-4 w-4', large: 'h-5 w-5' } as const;
const PREVIEW_ICON_SIZE_MAP = { small: 14, medium: 16, large: 20 } as const;

export default function NavigationLayout() {
  const {
    navShowLabels, setNavShowLabels,
    navCompactMode, setNavCompactMode,
    navigationLayout, setNavigationLayout,
    navIconStyle, setNavIconStyle,
    navIconSize, setNavIconSize,
    navHighlightStyle, setNavHighlightStyle,
    navAnimation, setNavAnimation,
    isInitialized
  } = useApp();

  const [localShowLabels, setLocalShowLabels] = useState(navShowLabels);
  const [localCompactMode, setLocalCompactMode] = useState(navCompactMode);
  const [localLayout, setLocalLayout] = useState<NavigationLayoutType>(navigationLayout);
  const [localIconStyle, setLocalIconStyle] = useState<NavIconStyle>(navIconStyle);
  const [localIconSize, setLocalIconSize] = useState<NavIconSize>(navIconSize);
  const [localHighlight, setLocalHighlight] = useState<NavHighlightStyle>(navHighlightStyle);
  const [localAnimation, setLocalAnimation] = useState<NavAnimation>(navAnimation);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    setLocalShowLabels(navShowLabels);
    setLocalCompactMode(navCompactMode);
    setLocalLayout(navigationLayout);
    setLocalIconStyle(navIconStyle);
    setLocalIconSize(navIconSize);
    setLocalHighlight(navHighlightStyle);
    setLocalAnimation(navAnimation);
  }, [navShowLabels, navCompactMode, navigationLayout, navIconStyle, navIconSize, navHighlightStyle, navAnimation]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      await Promise.all([
        setNavShowLabels(localShowLabels),
        setNavCompactMode(localCompactMode),
        setNavigationLayout(localLayout),
        setNavIconStyle(localIconStyle),
        setNavIconSize(localIconSize),
        setNavHighlightStyle(localHighlight),
        setNavAnimation(localAnimation),
      ]);
      toast.success('Navigation settings saved');
    } catch (error) {
      toast.error('Failed to save settings');
      console.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!isInitialized) {
    return (
      <AppLayout>
        <Header title="Navigation Layout" showBack />
        <LoadingScreen />
      </AppLayout>
    );
  }

  const previewIconSize = PREVIEW_ICON_SIZE_MAP[localIconSize];
  const previewStrokeWidth = localIconStyle === 'outline' ? 1.5 : 2;
  const previewLinecap = localIconStyle === 'rounded' ? 'round' as const : undefined;

  return (
    <AppLayout>
      <Header title="Navigation Layout" showBack />

      <div className="p-4 space-y-4 pb-24">
        {/* Navigation Style */}
        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Layout className="h-5 w-5 text-primary" />
              Navigation Style
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {LAYOUT_OPTIONS.map((option) => {
              const Icon = option.icon;
              const isSelected = localLayout === option.value;
              return (
                <div
                  key={option.value}
                  className={cn(
                    'flex items-center gap-3 p-3 rounded-lg cursor-pointer transition-colors border',
                    isSelected ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/50'
                  )}
                  onClick={() => setLocalLayout(option.value)}
                >
                  <div className={cn('h-10 w-10 rounded-lg flex items-center justify-center', isSelected ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <p className="font-medium">{option.label}</p>
                    <p className="text-sm text-muted-foreground">{option.description}</p>
                  </div>
                  <div className={cn('h-5 w-5 rounded-full border-2 flex items-center justify-center', isSelected ? 'border-primary bg-primary' : 'border-muted-foreground')}>
                    {isSelected && <div className="h-2 w-2 rounded-full bg-primary-foreground" />}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </Card>

        {/* Bottom Navigation Options */}
        {localLayout === 'bottom' && (
          <Card className="bg-card">
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                <Grid2X2 className="h-5 w-5 text-primary" />
                Bottom Navigation Options
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <ToggleSetting icon={Tag} label="Show Labels" description="Display text labels under icons" checked={localShowLabels} onChange={setLocalShowLabels} />
              <ToggleSetting icon={Eye} label="Compact Mode" description="Reduce navigation bar height" checked={localCompactMode} onChange={setLocalCompactMode} />
            </CardContent>
          </Card>
        )}

        <Separator />

        {/* Icon Style */}
        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Paintbrush className="h-5 w-5 text-primary" />
              Icon Style
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {ICON_STYLE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLocalIconStyle(opt.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all',
                    localIconStyle === opt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-muted/50 text-muted-foreground'
                  )}
                >
                  <LayoutGrid
                    className="h-6 w-6"
                    strokeWidth={opt.strokeWidth}
                    strokeLinecap={opt.linecap as any}
                  />
                  <span className="text-xs font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Icon Size */}
        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Maximize2 className="h-5 w-5 text-primary" />
              Icon Size
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-2">
              {ICON_SIZE_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  onClick={() => setLocalIconSize(opt.value)}
                  className={cn(
                    'flex flex-col items-center gap-2 p-3 rounded-xl border transition-all',
                    localIconSize === opt.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border hover:bg-muted/50 text-muted-foreground'
                  )}
                >
                  <LayoutGrid className={cn(ICON_SIZE_MAP[opt.value])} />
                  <span className="text-xs font-medium">{opt.label}</span>
                </button>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Highlight Style */}
        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Highlight Style
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {HIGHLIGHT_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLocalHighlight(opt.value)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                  localHighlight === opt.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-muted/50'
                )}
              >
                <div className={cn(
                  'h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0',
                  localHighlight === opt.value ? 'border-primary bg-primary' : 'border-muted-foreground'
                )}>
                  {localHighlight === opt.value && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.description}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Animation */}
        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <Zap className="h-5 w-5 text-primary" />
              Navigation Animation
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {ANIMATION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setLocalAnimation(opt.value)}
                className={cn(
                  'w-full flex items-center gap-3 p-3 rounded-xl border text-left transition-all',
                  localAnimation === opt.value
                    ? 'border-primary bg-primary/10'
                    : 'border-border hover:bg-muted/50'
                )}
              >
                <div className={cn(
                  'h-4 w-4 rounded-full border-2 flex items-center justify-center shrink-0',
                  localAnimation === opt.value ? 'border-primary bg-primary' : 'border-muted-foreground'
                )}>
                  {localAnimation === opt.value && <div className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />}
                </div>
                <div>
                  <p className="text-sm font-medium">{opt.label}</p>
                  <p className="text-xs text-muted-foreground">{opt.description}</p>
                </div>
              </button>
            ))}
          </CardContent>
        </Card>

        {/* Live Preview */}
        <Card className="bg-card">
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Live Preview</CardTitle>
          </CardHeader>
          <CardContent>
            {localLayout === 'bottom' ? (
              <BottomNavPreview
                showLabels={localShowLabels}
                compact={localCompactMode}
                iconSize={previewIconSize}
                strokeWidth={previewStrokeWidth}
                strokeLinecap={previewLinecap}
                highlight={localHighlight}
                animation={localAnimation}
              />
            ) : (
              <SidebarPreview
                iconSize={previewIconSize}
                strokeWidth={previewStrokeWidth}
                strokeLinecap={previewLinecap}
                highlight={localHighlight}
                animation={localAnimation}
              />
            )}
            <p className="text-xs text-muted-foreground mt-3 text-center">
              Preview updates instantly as you change settings
            </p>
          </CardContent>
        </Card>

        {/* Save Button */}
        <Button className="w-full" size="lg" onClick={handleSave} disabled={isSaving}>
          <Check className="h-4 w-4 mr-2" />
          {isSaving ? 'Saving...' : 'Save Changes'}
        </Button>
      </div>
    </AppLayout>
  );
}

/* ─── Sub-components ──────────────────────────────────────────── */

function ToggleSetting({ icon: Icon, label, description, checked, onChange }: {
  icon: React.ElementType; label: string; description: string; checked: boolean; onChange: (v: boolean) => void;
}) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="h-9 w-9 rounded-lg bg-muted flex items-center justify-center">
          <Icon className="h-4 w-4 text-muted-foreground" />
        </div>
        <div>
          <Label className="font-medium">{label}</Label>
          <p className="text-sm text-muted-foreground">{description}</p>
        </div>
      </div>
      <Switch checked={checked} onCheckedChange={onChange} />
    </div>
  );
}

function BottomNavPreview({ showLabels, compact, iconSize, strokeWidth, strokeLinecap, highlight, animation }: {
  showLabels: boolean; compact: boolean; iconSize: number; strokeWidth: number; strokeLinecap?: 'round'; highlight: NavHighlightStyle; animation: NavAnimation;
}) {
  const activeIdx = 0;
  return (
    <div className={cn("bg-background border border-border rounded-xl flex justify-around items-center", compact ? "py-1.5" : "py-2.5")}>
      {NAV_ITEMS.map((item, i) => {
        const Icon = item.icon;
        const active = i === activeIdx;
        const showBg = active && highlight === 'background';
        const iconColor = active && (highlight === 'icon-only' || highlight === 'icon-label');
        const labelColor = active && highlight === 'icon-label';

        return (
          <div key={item.label} className="relative flex flex-col items-center gap-0.5 px-1">
            {showBg && <div className="absolute inset-x-0 top-0 bottom-0 rounded-xl bg-amber-500/10" />}
            {active && animation === 'slide' && <div className="absolute -top-0.5 w-5 h-[2px] rounded-full bg-amber-500" />}
            <Icon
              size={iconSize}
              strokeWidth={strokeWidth}
              strokeLinecap={strokeLinecap}
              className={cn(
                'relative z-10',
                showBg || iconColor ? 'text-amber-500' : 'text-slate-400'
              )}
            />
            {showLabels && (
              <span className={cn(
                'text-[9px] relative z-10',
                showBg || labelColor ? 'text-amber-500 font-semibold' : active ? 'text-foreground font-semibold' : 'text-slate-400'
              )}>
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
}

function SidebarPreview({ iconSize, strokeWidth, strokeLinecap, highlight, animation }: {
  iconSize: number; strokeWidth: number; strokeLinecap?: 'round'; highlight: NavHighlightStyle; animation: NavAnimation;
}) {
  const activeIdx = 0;
  return (
    <div className="bg-background border border-border rounded-xl overflow-hidden flex">
      <div className="w-[140px] bg-card border-r border-border/50 p-2 space-y-1">
        {NAV_ITEMS.map((item, i) => {
          const Icon = item.icon;
          const active = i === activeIdx;
          const showBg = active && highlight === 'background';
          const iconColor = active && (highlight === 'icon-only' || highlight === 'icon-label');
          const labelColor = active && highlight === 'icon-label';

          return (
            <div
              key={item.label}
              className={cn(
                'flex items-center gap-2 px-2 py-2 rounded-lg text-xs',
                showBg && 'bg-amber-500/10',
                active && animation === 'slide' && 'border-l-2 border-amber-500'
              )}
            >
              <Icon
                size={iconSize}
                strokeWidth={strokeWidth}
                strokeLinecap={strokeLinecap}
                className={cn(
                  showBg || iconColor ? 'text-amber-500' : 'text-slate-400'
                )}
              />
              <span className={cn(
                'font-medium',
                showBg || labelColor ? 'text-amber-500' : active ? 'text-foreground' : 'text-muted-foreground'
              )}>
                {item.label}
              </span>
            </div>
          );
        })}
      </div>
      <div className="flex-1 p-3">
        <div className="h-3 w-16 bg-muted rounded mb-2" />
        <div className="h-12 w-full bg-muted/50 rounded" />
      </div>
    </div>
  );
}
