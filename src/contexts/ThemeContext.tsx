// Industrial Theme Context
// Manages Industrial Dark & Factory Light themes with offline-first persistence

import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from 'react';
import { getSetting, updateSetting } from '@/db/database';
import type { ThemeState, CustomThemeConfig, ThemeColors, SectionOverrides, ThemeId } from '@/types/theme';
import { themePresets, getPresetColors, getThemeCategory } from '@/utils/themePresets';

interface ThemeContextType {
  // Theme state
  themeState: ThemeState;
  
  // Theme controls
  setTheme: (themeId: ThemeId) => Promise<void>;
  
  // Custom theme controls
  enableCustomTheme: (enabled: boolean) => Promise<void>;
  setCustomColor: (key: keyof ThemeColors, value: string) => Promise<void>;
  resetCustomColors: () => Promise<void>;
  
  // Section override controls
  setSectionOverride: (section: keyof SectionOverrides, colors: SectionOverrides[keyof SectionOverrides]) => Promise<void>;
  clearSectionOverride: (section: keyof SectionOverrides) => Promise<void>;
  
  // Utilities
  getCurrentColors: () => ThemeColors;
  getSectionColors: (section: keyof SectionOverrides) => Partial<ThemeColors>;
  isDarkTheme: boolean;
  
  // Available presets
  presets: typeof themePresets;
  
  // Loading state
  isLoading: boolean;
}

const defaultCustomConfig: CustomThemeConfig = {
  enabled: false,
  baseTheme: 'industrial-dark',
  colors: {},
  sectionOverrides: {},
};

const defaultThemeState: ThemeState = {
  selectedTheme: 'industrial-dark',
  customConfig: defaultCustomConfig,
};

const ThemeContext = createContext<ThemeContextType | null>(null);

export function AdvancedThemeProvider({ children }: { children: React.ReactNode }) {
  const [themeState, setThemeState] = useState<ThemeState>(defaultThemeState);
  const [isLoading, setIsLoading] = useState(true);

  // Load theme settings from database
  useEffect(() => {
    const loadThemeSettings = async () => {
      try {
        const savedTheme = await getSetting<ThemeId>('selectedTheme');
        const savedCustomConfig = await getSetting<CustomThemeConfig>('themeCustomConfig');

        setThemeState({
          selectedTheme: savedTheme || 'industrial-dark',
          customConfig: savedCustomConfig || defaultCustomConfig,
        });
      } catch (error) {
        console.error('Failed to load theme settings:', error);
      } finally {
        setIsLoading(false);
      }
    };

    loadThemeSettings();
  }, []);

  // Get current theme colors
  const getCurrentColors = useCallback((): ThemeColors => {
    const baseColors = getPresetColors(themeState.selectedTheme);
    
    if (themeState.customConfig.enabled && Object.keys(themeState.customConfig.colors).length > 0) {
      return { ...baseColors, ...themeState.customConfig.colors };
    }
    
    return baseColors;
  }, [themeState]);

  // Check if current theme is dark
  const isDarkTheme = useMemo(() => {
    return getThemeCategory(themeState.selectedTheme) === 'dark';
  }, [themeState.selectedTheme]);

  // Apply theme to document with smooth transition
  useEffect(() => {
    if (isLoading) return;

    const root = document.documentElement;
    
    // Remove all theme classes
    root.classList.remove('light', 'dark', 'theme-colorful-light', 'theme-colorful-dark');
    
    // Apply appropriate class based on selected theme
    const selectedTheme = themeState.selectedTheme;
    if (selectedTheme === 'colorful-light') {
      root.classList.add('theme-colorful-light');
    } else if (selectedTheme === 'colorful-dark') {
      root.classList.add('theme-colorful-dark');
    } else {
      root.classList.add(isDarkTheme ? 'dark' : 'light');
    }

    // Get and apply colors
    const colors = getCurrentColors();
    
    // Convert ThemeColors to CSS variable format
    const cssVars: Record<string, string> = {
      'primary': colors.primary,
      'primary-foreground': colors.primaryForeground,
      'secondary': colors.secondary,
      'secondary-foreground': colors.secondaryForeground,
      'accent': colors.accent,
      'accent-foreground': colors.accentForeground,
      'background': colors.background,
      'foreground': colors.foreground,
      'card': colors.card,
      'card-foreground': colors.cardForeground,
      'popover': colors.popover,
      'popover-foreground': colors.popoverForeground,
      'destructive': colors.destructive,
      'destructive-foreground': colors.destructiveForeground,
      'warning': colors.warning,
      'warning-foreground': colors.warningForeground,
      'success': colors.success,
      'success-foreground': colors.successForeground,
      'info': colors.info,
      'info-foreground': colors.infoForeground,
      'muted': colors.muted,
      'muted-foreground': colors.mutedForeground,
      'border': colors.border,
      'input': colors.input,
      'ring': colors.ring,
      'chart-primary': colors.chartPrimary,
      'chart-secondary': colors.chartSecondary,
      'chart-accent': colors.chartAccent,
      'chart-success': colors.chartSuccess,
      'chart-warning': colors.chartWarning,
      'chart-neutral': colors.chartNeutral,
      'sidebar-background': colors.sidebarBackground,
      'sidebar-foreground': colors.sidebarForeground,
      'sidebar-primary': colors.sidebarPrimary,
      'sidebar-primary-foreground': colors.sidebarPrimaryForeground,
      'sidebar-accent': colors.sidebarAccent,
      'sidebar-accent-foreground': colors.sidebarAccentForeground,
      'sidebar-border': colors.sidebarBorder,
    };

    Object.entries(cssVars).forEach(([key, value]) => {
      root.style.setProperty(`--${key}`, value);
    });
  }, [themeState, isLoading, getCurrentColors, isDarkTheme]);

  // Set theme
  const setTheme = useCallback(async (themeId: ThemeId) => {
    setThemeState(prev => ({ ...prev, selectedTheme: themeId }));
    await updateSetting('selectedTheme', themeId);
  }, []);

  // Enable/disable custom theme
  const enableCustomTheme = useCallback(async (enabled: boolean) => {
    setThemeState(prev => ({
      ...prev,
      customConfig: { ...prev.customConfig, enabled },
    }));
    await updateSetting('themeCustomConfig', {
      ...themeState.customConfig,
      enabled,
    });
  }, [themeState.customConfig]);

  // Set custom color
  const setCustomColor = useCallback(async (key: keyof ThemeColors, value: string) => {
    const newColors = { ...themeState.customConfig.colors, [key]: value };
    const newConfig = { ...themeState.customConfig, colors: newColors };
    
    setThemeState(prev => ({
      ...prev,
      customConfig: newConfig,
    }));
    await updateSetting('themeCustomConfig', newConfig);
  }, [themeState.customConfig]);

  // Reset custom colors
  const resetCustomColors = useCallback(async () => {
    const newConfig = { ...themeState.customConfig, colors: {}, sectionOverrides: {} };
    setThemeState(prev => ({
      ...prev,
      customConfig: newConfig,
    }));
    await updateSetting('themeCustomConfig', newConfig);
  }, [themeState.customConfig]);

  // Set section override
  const setSectionOverride = useCallback(async (
    section: keyof SectionOverrides,
    override: SectionOverrides[keyof SectionOverrides]
  ) => {
    const newOverrides = { ...themeState.customConfig.sectionOverrides, [section]: override };
    const newConfig = { ...themeState.customConfig, sectionOverrides: newOverrides };
    
    setThemeState(prev => ({
      ...prev,
      customConfig: newConfig,
    }));
    await updateSetting('themeCustomConfig', newConfig);
  }, [themeState.customConfig]);

  // Clear section override
  const clearSectionOverride = useCallback(async (section: keyof SectionOverrides) => {
    const newOverrides = { ...themeState.customConfig.sectionOverrides };
    delete newOverrides[section];
    const newConfig = { ...themeState.customConfig, sectionOverrides: newOverrides };
    
    setThemeState(prev => ({
      ...prev,
      customConfig: newConfig,
    }));
    await updateSetting('themeCustomConfig', newConfig);
  }, [themeState.customConfig]);

  // Get section colors (with overrides)
  const getSectionColors = useCallback((section: keyof SectionOverrides): Partial<ThemeColors> => {
    const baseColors = getCurrentColors();
    const sectionOverride = themeState.customConfig.sectionOverrides[section];
    
    if (sectionOverride?.enabled && sectionOverride.colors) {
      return { ...baseColors, ...sectionOverride.colors };
    }
    
    return baseColors;
  }, [getCurrentColors, themeState.customConfig.sectionOverrides]);

  const value = useMemo<ThemeContextType>(() => ({
    themeState,
    setTheme,
    enableCustomTheme,
    setCustomColor,
    resetCustomColors,
    setSectionOverride,
    clearSectionOverride,
    getCurrentColors,
    getSectionColors,
    isDarkTheme,
    presets: themePresets,
    isLoading,
  }), [
    themeState,
    setTheme,
    enableCustomTheme,
    setCustomColor,
    resetCustomColors,
    setSectionOverride,
    clearSectionOverride,
    getCurrentColors,
    getSectionColors,
    isDarkTheme,
    isLoading,
  ]);

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useAdvancedTheme() {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useAdvancedTheme must be used within an AdvancedThemeProvider');
  }
  return context;
}
