import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNotificationScheduler } from '@/hooks/useNotificationScheduler';
import { db, initializeDatabase, getSetting, updateSetting } from '@/db/database';
import { clearAllDemoData } from '@/services/demoSeedService';
import { useLiveQuery } from 'dexie-react-hooks';
import type { DashboardStats, Part, Sale, ActivityLog, Brand, Category } from '@/types';
import { startOfDay, endOfDay, startOfMonth, subDays } from 'date-fns';
import { toSafeNumber, toSafeQuantity, safeAdd } from '@/utils/safeNumber';

type NavigationLayout = 'bottom' | 'sidebar';

interface AppContextType {
  // Database initialization
  isInitialized: boolean;
  
  // Dashboard stats
  stats: DashboardStats;
  isLoadingStats: boolean;
  refreshStats: () => Promise<void>;
  
  // Low stock parts
  lowStockParts: Part[];
  
  // Recent activity
  recentActivity: ActivityLog[];
  
  // Quick counts
  totalParts: number;
  totalBrands: number;
  totalCategories: number;
  
  // Settings
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => Promise<void>;
  notifications: boolean;
  setNotifications: (enabled: boolean) => Promise<void>;

  // Navigation settings
  navShowLabels: boolean;
  setNavShowLabels: (show: boolean) => Promise<void>;
  navCompactMode: boolean;
  setNavCompactMode: (compact: boolean) => Promise<void>;
  
  // Navigation layout
  navigationLayout: NavigationLayout;
  setNavigationLayout: (layout: NavigationLayout) => Promise<void>;
  
  // Custom logo
  customLogo: string | null;
  setCustomLogo: (logo: string | null) => Promise<void>;
  
  // App name
  appName: string;
  setAppName: (name: string) => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

export function AppProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [isLoadingStats, setIsLoadingStats] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    totalParts: 0,
    inventoryValue: 0,
    todaySales: 0,
    todayProfit: 0,
    monthlyProfit: 0,
    lowStockCount: 0,
  });
  const [theme, setThemeState] = useState<'dark' | 'light' | 'system'>('dark');
  const [notifications, setNotificationsState] = useState(true);
  const [navShowLabels, setNavShowLabelsState] = useState(true);
  const [navCompactMode, setNavCompactModeState] = useState(false);
  const [navigationLayout, setNavigationLayoutState] = useState<NavigationLayout>('bottom');
  const [customLogo, setCustomLogoState] = useState<string | null>(null);
  const [appName, setAppNameState] = useState('Ameer Autos');

  // Initialize database
  useEffect(() => {
    const init = async () => {
      try {
        await initializeDatabase();
        
        // Clear any existing demo data
        await clearAllDemoData();
        // Load settings
        const savedTheme = await getSetting<'dark' | 'light' | 'system'>('theme');
        const savedNotifications = await getSetting<boolean>('notifications');
        const savedShowLabels = await getSetting<boolean>('navShowLabels');
        const savedCompactMode = await getSetting<boolean>('navCompactMode');
        const savedNavigationLayout = await getSetting<NavigationLayout>('navigationLayout');
        const savedCustomLogo = await getSetting<string | null>('customLogo');
        const savedAppName = await getSetting<string>('appName');
        
        if (savedTheme) setThemeState(savedTheme);
        if (savedAppName) setAppNameState(savedAppName);
        if (savedNotifications !== undefined) setNotificationsState(savedNotifications);
        if (savedShowLabels !== undefined) setNavShowLabelsState(savedShowLabels);
        if (savedCompactMode !== undefined) setNavCompactModeState(savedCompactMode);
        if (savedNavigationLayout) setNavigationLayoutState(savedNavigationLayout);
        if (savedCustomLogo !== undefined) setCustomLogoState(savedCustomLogo);
        
        setIsInitialized(true);

        // Run auto-cleanup for activity logs
        const autoDeleteEnabled = await getSetting<boolean>('autoDeleteLogs');
        const autoDeleteDays = await getSetting<string>('autoDeleteDays');
        const autoDeleteCustom = await getSetting<string>('autoDeleteCustomDays');
        if (autoDeleteEnabled) {
          const daysStr = autoDeleteDays === 'custom' ? autoDeleteCustom : autoDeleteDays;
          const days = parseInt(daysStr || '30');
          if (!isNaN(days) && days > 0) {
            const cutoff = subDays(new Date(), days);
            const oldLogs = await db.activityLogs.where('createdAt').below(cutoff).toArray();
            const ids = oldLogs.filter(l => !l.isDeleted).map(l => l.id);
            if (ids.length > 0) {
              await db.activityLogs.where('id').anyOf(ids).modify({ isDeleted: true });
            }
          }
        }
      } catch (error) {
        console.error('Failed to initialize database:', error);
        setIsInitialized(true);
      }
    };
    
    init();
  }, []);

  // Apply theme to document
  useEffect(() => {
    const root = window.document.documentElement;
    root.classList.remove('light', 'dark');
    
    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
      root.classList.add(systemTheme);
    } else {
      root.classList.add(theme);
    }
  }, [theme]);

  // Live query for parts — wrapped safely so AppProvider never crashes
  const parts = useLiveQuery(() => {
    try { return db.parts.toArray().catch(() => []); } catch { return Promise.resolve([]); }
  }, []) ?? [];
  const sales = useLiveQuery(() => {
    try { return db.sales.toArray().catch(() => []); } catch { return Promise.resolve([]); }
  }, []) ?? [];
  const brands = useLiveQuery(() => {
    try { return db.brands.toArray().catch(() => []); } catch { return Promise.resolve([]); }
  }, []) ?? [];
  const categories = useLiveQuery(() => {
    try { return db.categories.toArray().catch(() => []); } catch { return Promise.resolve([]); }
  }, []) ?? [];
  const activityLogs = useLiveQuery(() => {
    try {
      return db.activityLogs.orderBy('createdAt').reverse().toArray()
        .then(logs => logs.filter(l => !l.isDeleted).slice(0, 10))
        .catch(() => []);
    } catch { return Promise.resolve([]); }
  }, []) ?? [];

  // Calculate low stock parts
  const lowStockParts = parts.filter(p => p.quantity <= p.minStockLevel);

  // Calculate dashboard stats with defensive NaN checks
  const refreshStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const today = new Date();
      const todayStart = startOfDay(today);
      const todayEnd = endOfDay(today);
      const monthStart = startOfMonth(today);

      // Get all parts for inventory value
      const allParts = await db.parts.toArray();
      const totalParts = allParts.length;
      
      // Calculate inventory value with safe number handling
      const inventoryValue = allParts.reduce((sum, p) => {
        const qty = toSafeQuantity(p.quantity, 0);
        const price = toSafeNumber(p.buyingPrice, 0);
        return safeAdd(sum, qty * price);
      }, 0);
      
      // Calculate low stock count with safe comparison
      const lowStockCount = allParts.filter(p => {
        const qty = toSafeQuantity(p.quantity, 0);
        const minStock = toSafeQuantity(p.minStockLevel, 0);
        return qty <= minStock;
      }).length;

      // Get today's sales
      const allSales = await db.sales.toArray();
      const todaySalesData = allSales.filter(s => {
        const saleDate = new Date(s.createdAt);
        return saleDate >= todayStart && saleDate <= todayEnd;
      });
      
      // Calculate today's totals with safe number handling
      const todaySales = todaySalesData.reduce((sum, s) => {
        return safeAdd(sum, toSafeNumber(s.totalAmount, 0));
      }, 0);
      
      const todayProfit = todaySalesData.reduce((sum, s) => {
        return safeAdd(sum, toSafeNumber(s.profit, 0));
      }, 0);

      // Get monthly profit
      const monthlySalesData = allSales.filter(s => {
        const saleDate = new Date(s.createdAt);
        return saleDate >= monthStart && saleDate <= todayEnd;
      });
      
      const monthlyProfit = monthlySalesData.reduce((sum, s) => {
        return safeAdd(sum, toSafeNumber(s.profit, 0));
      }, 0);

      setStats({
        totalParts,
        inventoryValue,
        todaySales,
        todayProfit,
        monthlyProfit,
        lowStockCount,
      });
    } catch (error) {
      console.error('Failed to refresh stats:', error);
      // Set safe defaults on error
      setStats({
        totalParts: 0,
        inventoryValue: 0,
        todaySales: 0,
        todayProfit: 0,
        monthlyProfit: 0,
        lowStockCount: 0,
      });
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  // Refresh stats when parts or sales change
  useEffect(() => {
    if (isInitialized) {
      refreshStats();
    }
  }, [isInitialized, parts.length, sales.length, refreshStats]);

  // Theme setter
  const setTheme = async (newTheme: 'dark' | 'light' | 'system') => {
    setThemeState(newTheme);
    await updateSetting('theme', newTheme);
  };

  // Notifications setter
  const setNotifications = async (enabled: boolean) => {
    setNotificationsState(enabled);
    await updateSetting('notifications', enabled);
  };

  // Nav settings setters
  const setNavShowLabels = async (show: boolean) => {
    setNavShowLabelsState(show);
    await updateSetting('navShowLabels', show);
  };

  const setNavCompactMode = async (compact: boolean) => {
    setNavCompactModeState(compact);
    await updateSetting('navCompactMode', compact);
  };

  // Navigation layout setter
  const setNavigationLayout = async (layout: NavigationLayout) => {
    setNavigationLayoutState(layout);
    await updateSetting('navigationLayout', layout);
  };

  // Custom logo setter
  const setCustomLogo = async (logo: string | null) => {
    setCustomLogoState(logo);
    await updateSetting('customLogo', logo);
  };

  // App name setter
  const setAppName = async (name: string) => {
    setAppNameState(name);
    await updateSetting('appName', name);
  };

  const value: AppContextType = {
    isInitialized,
    stats,
    isLoadingStats,
    refreshStats,
    lowStockParts,
    recentActivity: activityLogs,
    totalParts: parts.length,
    totalBrands: brands.length,
    totalCategories: categories.length,
    theme,
    setTheme,
    notifications,
    setNotifications,
    navShowLabels,
    setNavShowLabels,
    navCompactMode,
    setNavCompactMode,
    navigationLayout,
    setNavigationLayout,
    customLogo,
    setCustomLogo,
    appName,
    setAppName,
  };

  // Mount notification scheduler
  useNotificationScheduler();

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
}

/** Safe version that returns undefined instead of throwing if outside provider */
export function useAppSafe() {
  return useContext(AppContext);
}
