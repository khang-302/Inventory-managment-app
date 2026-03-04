import { forwardRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutDashboard, Package, BarChart3, Settings, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppSafe } from '@/contexts/AppContext';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutDashboard },
  { path: '/inventory', label: 'Inventory', icon: Package },
  { path: '/bills', label: 'Bills', icon: FileText },
  { path: '/reports', label: 'Reports', icon: BarChart3 },
  { path: '/settings', label: 'Settings', icon: Settings },
];

export const BottomNav = forwardRef<HTMLElement, React.HTMLAttributes<HTMLElement>>(
  function BottomNav(props, ref) {
    const location = useLocation();
    const app = useAppSafe();
    const navShowLabels = app?.navShowLabels ?? true;
    const navCompactMode = app?.navCompactMode ?? false;

    const isActive = (path: string) => {
      if (path === '/') {
        return location.pathname === '/';
      }
      return location.pathname.startsWith(path);
    };

    return (
      <nav ref={ref} {...props} className={cn("fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border safe-area-bottom", props.className)}>
        <div className={cn(
          "flex items-center justify-around",
          navCompactMode ? "h-12" : "h-14"
        )}>
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex flex-col items-center justify-center flex-1 h-full px-2 py-1 transition-colors touch-target',
                  active 
                    ? 'text-primary' 
                    : 'text-muted-foreground hover:text-foreground',
                  navCompactMode && "px-1"
                )}
              >
                <Icon 
                  className={cn(
                    'h-5 w-5 transition-transform',
                    !navCompactMode && "mb-0.5",
                    active && 'scale-110'
                  )} 
                />
                {navShowLabels && (
                  <span
                    className={cn(
                      'text-[10px] font-medium leading-tight',
                      active && 'font-semibold'
                    )}
                  >
                    {item.label}
                  </span>
                )}
                {active && (
                  <div className="absolute bottom-1 w-1 h-1 rounded-full bg-primary" />
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>
    );
  }
);
