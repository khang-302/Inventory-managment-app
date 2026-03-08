import { forwardRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutGrid, Warehouse, Receipt, TrendingUp, SlidersHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppSafe } from '@/contexts/AppContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutGrid },
  { path: '/inventory', label: 'Inventory', icon: Warehouse },
  { path: '/bills', label: 'Bill', icon: Receipt },
  { path: '/reports', label: 'Report', icon: TrendingUp },
  { path: '/settings', label: 'Setting', icon: SlidersHorizontal },
];

const ICON_SIZE_MAP = { small: 'h-4 w-4', medium: 'h-5 w-5', large: 'h-6 w-6' } as const;

export const BottomNav = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  function BottomNav(props, ref) {
    const location = useLocation();
    const app = useAppSafe();
    const navShowLabels = app?.navShowLabels ?? true;
    const navCompactMode = app?.navCompactMode ?? false;
    const iconStyle = app?.navIconStyle ?? 'outline';
    const iconSize = app?.navIconSize ?? 'medium';
    const highlightStyle = app?.navHighlightStyle ?? 'background';
    const animation = app?.navAnimation ?? 'fade';

    const isActive = (path: string) => path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

    const iconSizeClass = ICON_SIZE_MAP[iconSize];
    const getStrokeWidth = (active: boolean) => {
      if (active) return iconStyle === 'outline' ? 2 : 2.5;
      return iconStyle === 'outline' ? 1.5 : 2;
    };
    const getStrokeLinecap = () => iconStyle === 'rounded' ? 'round' as const : undefined;

    const animationClass = animation === 'fade'
      ? 'transition-all duration-200 ease-out'
      : animation === 'slide'
        ? 'transition-all duration-250 ease-out'
        : 'transition-colors duration-100';

    return (
      <nav ref={ref} {...props} className={cn("fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-md border-t border-border/50 safe-area-bottom", props.className)}>
        <div className={cn(
          "flex items-center justify-around",
          navCompactMode ? "h-12" : "h-[60px]"
        )}>
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
                  'relative flex flex-col items-center justify-center flex-1 h-full px-1 active:scale-90',
                  animationClass
                )}
              >
                {/* Background pill highlight */}
                {showBgHighlight && (
                  <div className={cn(
                    "absolute inset-x-2 top-1.5 bottom-1.5 rounded-2xl bg-amber-500/10",
                    animationClass
                  )} />
                )}

                {/* Slide indicator bar */}
                {active && animation === 'slide' && (
                  <div className="absolute top-0 left-1/2 -translate-x-1/2 w-8 h-[3px] rounded-full bg-amber-500" />
                )}

                <Icon
                  className={cn(
                    iconSizeClass,
                    'relative z-10',
                    animationClass,
                    !navCompactMode && navShowLabels && "mb-0.5",
                    showBgHighlight || showIconColor
                      ? 'text-amber-500'
                      : 'text-slate-400',
                    active && 'scale-110'
                  )}
                  strokeWidth={getStrokeWidth(active)}
                  strokeLinecap={getStrokeLinecap()}
                />
                {navShowLabels && (
                  <span
                    className={cn(
                      'text-[10px] leading-tight relative z-10',
                      animationClass,
                      showBgHighlight || showLabelColor
                        ? 'text-amber-500 font-semibold'
                        : active
                          ? 'text-foreground font-semibold'
                          : 'text-slate-400 font-medium'
                    )}
                  >
                    {item.label}
                  </span>
                )}

                {/* Active dot */}
                {active && highlightStyle !== 'background' && animation !== 'slide' && (
                  <div className="absolute bottom-1.5 w-1 h-1 rounded-full bg-amber-500" />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    );
  }
);
