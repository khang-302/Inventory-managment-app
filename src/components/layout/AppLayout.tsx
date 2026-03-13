import { ReactNode, useState, useCallback } from 'react';
import { BottomNav } from './BottomNav';
import { SidebarNav, SidebarTrigger } from './SidebarNav';
import { useBackNavigation } from '@/hooks/useBackNavigation';
import { cn } from '@/lib/utils';
import { useAppSafe } from '@/contexts/AppContext';

interface AppLayoutProps {
  children: ReactNode;
  hideNav?: boolean;
  className?: string;
  showMenuButton?: boolean;
}

export function AppLayout({ children, hideNav = false, className, showMenuButton = true }: AppLayoutProps) {
  const app = useAppSafe();
  const navigationLayout = app?.navigationLayout ?? 'bottom';
  const isInitialized = app?.isInitialized ?? false;
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // Handle Android hardware back button & gesture back navigation
  useBackNavigation();

  const openSidebar = useCallback(() => setSidebarOpen(true), []);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  const useSidebar = navigationLayout === 'sidebar';

  return (
    <div className={cn('min-h-screen bg-background flex flex-col', className)}>
      {/* Sidebar Navigation */}
      {useSidebar && !hideNav && isInitialized && (
        <SidebarNav isOpen={sidebarOpen} onClose={closeSidebar} />
      )}

      <main className={cn(
        'flex-1 overflow-auto animate-fade-in',
        !hideNav && !useSidebar && 'pb-16' // Add padding for bottom nav only
      )}>
        {children}
      </main>

      {/* Bottom Navigation */}
      {!hideNav && !useSidebar && <BottomNav />}
    </div>
  );
}

// Export sidebar trigger for use in headers
export { SidebarTrigger };
