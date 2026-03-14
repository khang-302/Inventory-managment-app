import { useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutGrid, Warehouse, Receipt, TrendingUp, SlidersHorizontal, X, Menu, Package } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppSafe } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutGrid },
  { path: '/inventory', label: 'Inventory', icon: Warehouse },
  { path: '/bills', label: 'Bill', icon: Receipt },
  { path: '/reports', label: 'Report', icon: TrendingUp },
  { path: '/settings', label: 'Setting', icon: SlidersHorizontal },
];

const ICON_SIZE_MAP = { small: 'h-4 w-4', medium: 'h-5 w-5', large: 'h-6 w-6' } as const;
const CONTAINER_SIZE_MAP = { small: 'h-8 w-8', medium: 'h-10 w-10', large: 'h-11 w-11' } as const;

interface SidebarNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidebarNav({ isOpen, onClose }: SidebarNavProps) {
  const location = useLocation();
  const app = useAppSafe();
  const customLogo = app?.customLogo ?? null;
  const appName = app?.appName ?? 'Ameer Autos';
  const iconStyle = app?.navIconStyle ?? 'outline';
  const iconSize = app?.navIconSize ?? 'medium';
  const highlightStyle = app?.navHighlightStyle ?? 'background';
  const animation = app?.navAnimation ?? 'fade';

  const previousPathRef = useRef(location.pathname);
  useEffect(() => {
    if (previousPathRef.current !== location.pathname) {
      previousPathRef.current = location.pathname;
      onClose();
    }
  }, [location.pathname, onClose]);

  useEffect(() => {
    const handlePopState = () => { if (isOpen) onClose(); };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isOpen, onClose]);

  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => { if (e.key === 'Escape' && isOpen) onClose(); };
    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const isActive = (path: string) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const getStrokeWidth = () => iconStyle === 'outline' ? 1.5 : 2;
  const getStrokeLinecap = () => iconStyle === 'rounded' ? 'round' as const : undefined;

  const iconSizeClass = ICON_SIZE_MAP[iconSize];
  const containerSizeClass = CONTAINER_SIZE_MAP[iconSize];

  const animationClass = animation === 'fade'
    ? 'transition-all duration-200 ease-out'
    : animation === 'slide'
      ? 'transition-all duration-250 ease-out'
      : 'transition-colors duration-100';

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/50 backdrop-blur-sm transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-[280px] max-w-[85vw] bg-card',
          'border-r border-border/50',
          'transform transition-transform duration-300 ease-out',
          'flex flex-col safe-area-top safe-area-bottom shadow-2xl',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header */}
        <div className="px-5 pt-6 pb-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3.5">
              {customLogo ? (
                <img src={customLogo} alt="Logo" className="h-11 w-11 rounded-xl object-cover ring-1 ring-border/30" />
              ) : (
                <div className="h-11 w-11 rounded-xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-md">
                  <Package className="h-6 w-6 text-white" />
                </div>
              )}
              <div>
                <p className="font-bold text-base tracking-tight">{appName}</p>
                <p className="text-[11px] text-muted-foreground font-medium">Inventory & Sales</p>
              </div>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8 rounded-lg" onClick={onClose}>
              <X className="h-4 w-4" />
            </Button>
          </div>
        </div>

        <Separator className="opacity-50" />

        {/* Navigation Items */}
        <nav className="flex-1 px-3 py-4 space-y-1.5 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            const showBgHighlight = active && highlightStyle === 'background';
            const showIconColor = active && (highlightStyle === 'icon-only' || highlightStyle === 'icon-label');
            const showLabelColor = active && highlightStyle === 'icon-label';

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-4 px-3.5 py-3.5 rounded-xl active:scale-[0.97]',
                  animationClass,
                  showBgHighlight
                    ? 'bg-amber-500/10'
                    : 'hover:bg-muted/60',
                  active && animation === 'slide' && 'border-l-[3px] border-amber-500 ml-0 pl-3'
                )}
              >
                {/* Indicator bar for slide animation */}
                <div className={cn(
                  containerSizeClass,
                  'rounded-xl flex items-center justify-center shrink-0',
                  animationClass,
                  showBgHighlight || showIconColor
                    ? 'bg-amber-500/15'
                    : 'bg-muted/80'
                )}>
                  <Icon
                    className={cn(
                      iconSizeClass,
                      animationClass,
                      showBgHighlight || showIconColor
                        ? 'text-amber-500'
                        : 'text-muted-foreground'
                    )}
                    strokeWidth={getStrokeWidth()}
                    strokeLinecap={getStrokeLinecap()}
                  />
                </div>
                <span className={cn(
                  'font-medium text-[15px] tracking-tight',
                  animationClass,
                  showBgHighlight || showLabelColor
                    ? 'text-amber-500 font-semibold'
                    : active
                      ? 'text-foreground font-semibold'
                      : 'text-muted-foreground'
                )}>
                  {item.label}
                </span>
              </NavLink>
            );
          })}
        </nav>

        <Separator className="opacity-50" />

        {/* Footer */}
        <div className="px-5 py-4">
          <p className="text-[11px] text-muted-foreground/60 text-center font-medium tracking-wide">
            v1.0.0 • {appName}
          </p>
        </div>
      </aside>
    </>
  );
}

// Hamburger menu button for header
export function SidebarTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button variant="ghost" size="icon" className="h-9 w-9 shrink-0" onClick={onClick}>
      <Menu className="h-5 w-5" />
      <span className="sr-only">Open menu</span>
    </Button>
  );
}
