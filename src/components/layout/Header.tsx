import { ReactNode, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronLeft, Menu } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { useAppSafe } from '@/contexts/AppContext';
import { SidebarNav } from './SidebarNav';
import { NotificationCenter } from './NotificationCenter';

interface HeaderProps {
  title: string;
  subtitle?: string;
  showBack?: boolean;
  onBack?: () => void;
  rightAction?: ReactNode;
  className?: string;
}

export function Header({ 
  title, 
  subtitle, 
  showBack = false, 
  onBack,
  rightAction,
  className 
}: HeaderProps) {
  const navigate = useNavigate();
  const app = useAppSafe();
  const navigationLayout = app?.navigationLayout ?? 'bottom';
  const customLogo = app?.customLogo ?? null;
  const isInitialized = app?.isInitialized ?? false;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else {
      navigate(-1);
    }
  };

  const useSidebar = navigationLayout === 'sidebar';

  return (
    <>
      {/* Sidebar for when using sidebar navigation */}
      {useSidebar && isInitialized && (
        <SidebarNav 
          isOpen={sidebarOpen} 
          onClose={() => setSidebarOpen(false)} 
        />
      )}

      <header className={cn(
        'sticky top-0 z-40 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b border-border safe-area-top',
        className
      )}>
        <div className="flex items-center justify-between h-14 px-4">
          <div className="flex items-center gap-2 min-w-0 flex-1">
            {/* Show menu button for sidebar nav, back button if showBack */}
            {showBack ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 -ml-2"
                onClick={handleBack}
              >
                <ChevronLeft className="h-5 w-5" />
                <span className="sr-only">Back</span>
              </Button>
            ) : useSidebar && isInitialized ? (
              <Button
                variant="ghost"
                size="icon"
                className="h-9 w-9 shrink-0 -ml-2"
                onClick={() => setSidebarOpen(true)}
              >
                <Menu className="h-5 w-5" />
                <span className="sr-only">Open menu</span>
              </Button>
            ) : null}
            
            {/* Logo for main screens when not showing back button */}
            {!showBack && customLogo && (
              <img 
                src={customLogo} 
                alt="Logo" 
                className="h-8 w-8 rounded-lg object-cover shrink-0"
              />
            )}
            
            <div className="min-w-0 flex-1">
              <h1 className="text-lg font-semibold truncate">{title}</h1>
              {subtitle && (
                <p className="text-xs text-muted-foreground truncate">{subtitle}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-1 shrink-0 ml-2">
            <NotificationCenter />
            {rightAction}
          </div>
        </div>
      </header>
    </>
  );
}
