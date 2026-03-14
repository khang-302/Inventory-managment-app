import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import { useNotificationScheduler } from '@/hooks/useNotificationScheduler';
import { db, initializeDatabase, getSetting, updateSetting } from '@/db/database';

import { useLiveQuery } from 'dexie-react-hooks';
import type { DashboardStats, Part, Sale, ActivityLog, Brand, Category, WeeklySaleDay, StockDistribution } from '@/types';
import { startOfDay, endOfDay, startOfMonth, subDays, format } from 'date-fns';
import { toSafeNumber, toSafeQuantity, safeAdd } from '@/utils/safeNumber';

type NavigationLayout = 'bottom' | 'sidebar';
type NavIconStyle = 'outline' | 'filled' | 'rounded';
type NavIconSize = 'small' | 'medium' | 'large';
type NavHighlightStyle = 'icon-only' | 'icon-label' | 'background';
type NavAnimation = 'none' | 'fade' | 'slide';

interface AppContextType {
  isInitialized: boolean;
  stats: DashboardStats;
  isLoadingStats: boolean;
  refreshStats: () => Promise<void>;
  lowStockParts: Part[];
  recentActivity: ActivityLog[];
  totalParts: number;
  totalBrands: number;
  totalCategories: number;
  theme: 'dark' | 'light' | 'system';
  setTheme: (theme: 'dark' | 'light' | 'system') => Promise<void>;
  notifications: boolean;
  setNotifications: (enabled: boolean) => Promise<void>;
  navShowLabels: boolean;
  setNavShowLabels: (show: boolean) => Promise<void>;
  navCompactMode: boolean;
  setNavCompactMode: (compact: boolean) => Promise<void>;
  navigationLayout: NavigationLayout;
  setNavigationLayout: (layout: NavigationLayout) => Promise<void>;
  navIconStyle: NavIconStyle;
  setNavIconStyle: (style: NavIconStyle) => Promise<void>;
  navIconSize: NavIconSize;
  setNavIconSize: (size: NavIconSize) => Promise<void>;
  navHighlightStyle: NavHighlightStyle;
  setNavHighlightStyle: (style: NavHighlightStyle) => Promise<void>;
  navAnimation: NavAnimation;
  setNavAnimation: (animation: NavAnimation) => Promise<void>;
  customLogo: string | null;
  setCustomLogo: (logo: string | null) => Promise<void>;
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
    weeklySales: [],
    stockDistribution: { inStock: 0, lowStock: 0, outOfStock: 0 },
  });
  const [theme, setThemeState] = useState<'dark' | 'light' | 'system'>('dark');
  const [notifications, setNotificationsState] = useState(true);
  const [navShowLabels, setNavShowLabelsState] = useState(true);
  const [navCompactMode, setNavCompactModeState] = useState(false);
  const [navigationLayout, setNavigationLayoutState] = useState<NavigationLayout>('bottom');
  const [navIconStyle, setNavIconStyleState] = useState<NavIconStyle>('outline');
  const [navIconSize, setNavIconSizeState] = useState<NavIconSize>('medium');
  const [navHighlightStyle, setNavHighlightStyleState] = useState<NavHighlightStyle>('background');
  const [navAnimation, setNavAnimationState] = useState<NavAnimation>('fade');
  const [customLogo, setCustomLogoState] = useState<string | null>(null);
  const [appName, setAppNameState] = useState('Ameer Autos');

  // Initialize database
  useEffect(() => {
    const init = async () => {
      try {
        await initializeDatabase();
        
        const savedTheme = await getSetting<'dark' | 'light' | 'system'>('theme');
        const savedNotifications = await getSetting<boolean>('notifications');
        const savedShowLabels = await getSetting<boolean>('navShowLabels');
        const savedCompactMode = await getSetting<boolean>('navCompactMode');
        const savedNavigationLayout = await getSetting<NavigationLayout>('navigationLayout');
        const savedNavIconStyle = await getSetting<NavIconStyle>('navIconStyle');
        const savedNavIconSize = await getSetting<NavIconSize>('navIconSize');
        const savedNavHighlightStyle = await getSetting<NavHighlightStyle>('navHighlightStyle');
        const savedNavAnimation = await getSetting<NavAnimation>('navAnimation');
        const savedCustomLogo = await getSetting<string | null>('customLogo');
        const savedAppName = await getSetting<string>('appName');
        
        if (savedTheme) setThemeState(savedTheme);
        if (savedAppName) setAppNameState(savedAppName);
        if (savedNotifications !== undefined) setNotificationsState(savedNotifications);
        if (savedShowLabels !== undefined) setNavShowLabelsState(savedShowLabels);
        if (savedCompactMode !== undefined) setNavCompactModeState(savedCompactMode);
        if (savedNavigationLayout) setNavigationLayoutState(savedNavigationLayout);
        if (savedNavIconStyle) setNavIconStyleState(savedNavIconStyle);
        if (savedNavIconSize) setNavIconSizeState(savedNavIconSize);
        if (savedNavHighlightStyle) setNavHighlightStyleState(savedNavHighlightStyle);
        if (savedNavAnimation) setNavAnimationState(savedNavAnimation);
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

  // Live queries — only counts for triggering stats refresh
  const partsCount = useLiveQuery(() => db.parts.count().catch(() => 0), []) ?? 0;
  const salesCount = useLiveQuery(() => db.sales.count().catch(() => 0), []) ?? 0;

  // Live query for parts (needed for lowStockParts)
  const parts = useLiveQuery(() => {
    try { return db.parts.toArray().catch(() => []); } catch { return Promise.resolve([]); }
  }, []) ?? [];

  const brands = useLiveQuery(() => {
    try { return db.brands.count().catch(() => 0); } catch { return Promise.resolve(0); }
  }, []) ?? 0;
  const categories = useLiveQuery(() => {
    try { return db.categories.count().catch(() => 0); } catch { return Promise.resolve(0); }
  }, []) ?? 0;
  const activityLogs = useLiveQuery(() => {
    try {
      return db.activityLogs.orderBy('createdAt').reverse().toArray()
        .then(logs => logs.filter(l => !l.isDeleted).slice(0, 10))
        .catch(() => []);
    } catch { return Promise.resolve([]); }
  }, []) ?? [];

  const lowStockParts = parts.filter(p => p.quantity <= p.minStockLevel);

  // Calculate dashboard stats using indexed queries
  const refreshStats = useCallback(async () => {
    setIsLoadingStats(true);
    try {
      const today = new Date();
      const todayStart = startOfDay(today);
      const todayEnd = endOfDay(today);
      const monthStart = startOfMonth(today);

      // Use indexed queries instead of loading all records
      const allParts = await db.parts.toArray();
      const totalParts = allParts.length;
      
      const inventoryValue = allParts.reduce((sum, p) => {
        const qty = toSafeQuantity(p.quantity, 0);
        const price = toSafeNumber(p.buyingPrice, 0);
        return safeAdd(sum, qty * price);
      }, 0);
      
      const lowStockCount = allParts.filter(p => {
        const qty = toSafeQuantity(p.quantity, 0);
        const minStock = toSafeQuantity(p.minStockLevel, 0);
        return qty <= minStock;
      }).length;

      // Indexed query for today's sales
      const todaySalesData = await db.sales
        .where('createdAt')
        .between(todayStart, todayEnd, true, true)
        .toArray();
      
      const todaySales = todaySalesData.reduce((sum, s) => safeAdd(sum, toSafeNumber(s.totalAmount, 0)), 0);
      const todayProfit = todaySalesData.reduce((sum, s) => safeAdd(sum, toSafeNumber(s.profit, 0)), 0);

      // Indexed query for monthly sales
      const monthlySalesData = await db.sales
        .where('createdAt')
        .between(monthStart, todayEnd, true, true)
        .toArray();
      const monthlyProfit = monthlySalesData.reduce((sum, s) => safeAdd(sum, toSafeNumber(s.profit, 0)), 0);

      // Weekly sales — single indexed query for the whole week
      const weekStart = startOfDay(subDays(today, 6));
      const weekSalesData = await db.sales
        .where('createdAt')
        .between(weekStart, todayEnd, true, true)
        .toArray();

      const weeklySales: WeeklySaleDay[] = [];
      for (let i = 6; i >= 0; i--) {
        const day = subDays(today, i);
        const dayStart = startOfDay(day);
        const dayEnd = endOfDay(day);
        const daySales = weekSalesData.filter(s => {
          const d = new Date(s.createdAt);
          return d >= dayStart && d <= dayEnd;
        });
        weeklySales.push({
          date: format(day, 'EEE'),
          sales: daySales.reduce((sum, s) => safeAdd(sum, toSafeNumber(s.totalAmount, 0)), 0),
          profit: daySales.reduce((sum, s) => safeAdd(sum, toSafeNumber(s.profit, 0)), 0),
        });
      }

      const outOfStock = allParts.filter(p => toSafeQuantity(p.quantity, 0) === 0).length;
      const stockDistribution: StockDistribution = {
        inStock: totalParts - lowStockCount - outOfStock,
        lowStock: lowStockCount - outOfStock,
        outOfStock,
      };

      setStats({ totalParts, inventoryValue, todaySales, todayProfit, monthlyProfit, lowStockCount, weeklySales, stockDistribution });
    } catch (error) {
      console.error('Failed to refresh stats:', error);
      setStats({
        totalParts: 0, inventoryValue: 0, todaySales: 0, todayProfit: 0,
        monthlyProfit: 0, lowStockCount: 0, weeklySales: [],
        stockDistribution: { inStock: 0, lowStock: 0, outOfStock: 0 },
      });
    } finally {
      setIsLoadingStats(false);
    }
  }, []);

  useEffect(() => {
    if (isInitialized) refreshStats();
  }, [isInitialized, partsCount, salesCount, refreshStats]);

  // Setters
  const setTheme = async (v: 'dark' | 'light' | 'system') => { setThemeState(v); await updateSetting('theme', v); };
  const setNotifications = async (v: boolean) => { setNotificationsState(v); await updateSetting('notifications', v); };
  const setNavShowLabels = async (v: boolean) => { setNavShowLabelsState(v); await updateSetting('navShowLabels', v); };
  const setNavCompactMode = async (v: boolean) => { setNavCompactModeState(v); await updateSetting('navCompactMode', v); };
  const setNavigationLayout = async (v: NavigationLayout) => { setNavigationLayoutState(v); await updateSetting('navigationLayout', v); };
  const setNavIconStyle = async (v: NavIconStyle) => { setNavIconStyleState(v); await updateSetting('navIconStyle', v); };
  const setNavIconSize = async (v: NavIconSize) => { setNavIconSizeState(v); await updateSetting('navIconSize', v); };
  const setNavHighlightStyle = async (v: NavHighlightStyle) => { setNavHighlightStyleState(v); await updateSetting('navHighlightStyle', v); };
  const setNavAnimation = async (v: NavAnimation) => { setNavAnimationState(v); await updateSetting('navAnimation', v); };
  const setCustomLogo = async (v: string | null) => { setCustomLogoState(v); await updateSetting('customLogo', v); };
  const setAppName = async (v: string) => { setAppNameState(v); await updateSetting('appName', v); };

  const value: AppContextType = {
    isInitialized, stats, isLoadingStats, refreshStats, lowStockParts,
    recentActivity: activityLogs, totalParts: partsCount, totalBrands: brands, totalCategories: categories,
    theme, setTheme, notifications, setNotifications,
    navShowLabels, setNavShowLabels, navCompactMode, setNavCompactMode,
    navigationLayout, setNavigationLayout,
    navIconStyle, setNavIconStyle, navIconSize, setNavIconSize,
    navHighlightStyle, setNavHighlightStyle, navAnimation, setNavAnimation,
    customLogo, setCustomLogo, appName, setAppName,
  };

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
