import { useState, useEffect, useRef } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { LayoutGrid, Boxes, ChartColumnBig, Settings, X, Menu, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppSafe } from '@/contexts/AppContext';
import { Button } from '@/components/ui/button';

const navItems = [
  { path: '/', label: 'Dashboard', icon: LayoutGrid, accent: 'bg-primary/10 text-primary' },
  { path: '/inventory', label: 'Inventory', icon: Boxes, accent: 'bg-blue-500/10 text-blue-500' },
  { path: '/bills', label: 'Bills', icon: FileText, accent: 'bg-emerald-500/10 text-emerald-500' },
  { path: '/reports', label: 'Reports', icon: ChartColumnBig, accent: 'bg-purple-500/10 text-purple-500' },
  { path: '/settings', label: 'Settings', icon: Settings, accent: 'bg-slate-500/10 text-slate-500' },
];

interface SidebarNavProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SidebarNav({ isOpen, onClose }: SidebarNavProps) {
  const location = useLocation();
  const app = useAppSafe();
  const customLogo = app?.customLogo ?? null;
  const navShowLabels = app?.navShowLabels ?? true;
  const appName = app?.appName ?? 'Ameer Autos';

  // Close sidebar on route change only
  const previousPathRef = useRef(location.pathname);
  useEffect(() => {
    if (previousPathRef.current !== location.pathname) {
      previousPathRef.current = location.pathname;
      onClose();
    }
  }, [location.pathname, onClose]);

  // Handle back button to close sidebar first
  useEffect(() => {
    const handlePopState = () => {
      if (isOpen) {
        onClose();
      }
    };

    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, [isOpen, onClose]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    document.addEventListener('keydown', handleEscape);
    return () => document.removeEventListener('keydown', handleEscape);
  }, [isOpen, onClose]);

  // Prevent body scroll when sidebar is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  const isActive = (path: string) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 z-50 bg-black/60 transition-opacity duration-300',
          isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'
        )}
        onClick={onClose}
      />

      {/* Sidebar */}
      <aside
        className={cn(
          'fixed top-0 left-0 z-50 h-full w-[75%] max-w-[300px] bg-card border-r border-border',
          'transform transition-transform duration-300 ease-out',
          'flex flex-col safe-area-top safe-area-bottom',
          isOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {/* Header with Logo */}
        <div className="flex items-center justify-between p-4 border-b border-border">
          <div className="flex items-center gap-3">
            {customLogo ? (
              <img 
                src={customLogo} 
                alt="App Logo" 
                className="h-10 w-10 rounded-lg object-cover"
              />
            ) : (
              <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center">
                <Package className="h-6 w-6 text-primary-foreground" />
              </div>
            )}
            <div>
              <p className="font-bold text-sm">{appName}</p>
              <p className="text-[10px] text-muted-foreground">Heavy Duty Parts</p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-9 w-9"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </Button>
        </div>

        {/* Navigation Items */}
        <nav className="flex-1 p-2 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);

            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-all duration-200 touch-target',
                  active
                    ? 'bg-primary text-primary-foreground'
                    : 'text-foreground hover:bg-muted/50'
                )}
              >
                <Icon className="h-5 w-5" />
                <span className="font-medium">{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-border">
          <p className="text-xs text-muted-foreground text-center">
            Inventory & Sales Manager v1.0.0
          </p>
        </div>
      </aside>
    </>
  );
}

// Hamburger menu button for header
export function SidebarTrigger({ onClick }: { onClick: () => void }) {
  return (
    <Button
      variant="ghost"
      size="icon"
      className="h-9 w-9 shrink-0"
      onClick={onClick}
    >
      <Menu className="h-5 w-5" />
      <span className="sr-only">Open menu</span>
    </Button>
  );
}
