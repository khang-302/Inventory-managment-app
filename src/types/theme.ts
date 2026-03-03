// Theme System Types
// Streamlined type definitions for Industrial Dark & Factory Light themes

export interface ThemeColors {
  // Core colors
  primary: string;
  primaryForeground: string;
  secondary: string;
  secondaryForeground: string;
  accent: string;
  accentForeground: string;
  
  // Background colors
  background: string;
  foreground: string;
  card: string;
  cardForeground: string;
  popover: string;
  popoverForeground: string;
  
  // Semantic colors
  destructive: string;
  destructiveForeground: string;
  warning: string;
  warningForeground: string;
  success: string;
  successForeground: string;
  info: string;
  infoForeground: string;
  
  // UI colors
  muted: string;
  mutedForeground: string;
  border: string;
  input: string;
  ring: string;
  
  // Chart colors
  chartPrimary: string;
  chartSecondary: string;
  chartAccent: string;
  chartSuccess: string;
  chartWarning: string;
  chartNeutral: string;

  // Sidebar colors
  sidebarBackground: string;
  sidebarForeground: string;
  sidebarPrimary: string;
  sidebarPrimaryForeground: string;
  sidebarAccent: string;
  sidebarAccentForeground: string;
  sidebarBorder: string;
}

export type ThemeId = 'industrial-dark' | 'factory-light' | 'colorful-light' | 'colorful-dark';

export interface ThemePreset {
  id: ThemeId;
  name: string;
  description: string;
  icon: string;
  category: 'dark' | 'light';
  colors: ThemeColors;
}

export interface SectionOverride {
  enabled: boolean;
  colors: Partial<{
    background: string;
    foreground: string;
    card: string;
    cardForeground: string;
    primary: string;
    accent: string;
    border: string;
  }>;
}

export interface SectionOverrides {
  dashboard?: SectionOverride;
  inventory?: SectionOverride;
  reports?: SectionOverride;
  settings?: SectionOverride;
}

export interface CustomThemeConfig {
  enabled: boolean;
  baseTheme: ThemeId;
  colors: Partial<ThemeColors>;
  sectionOverrides: SectionOverrides;
}

export interface ThemeState {
  // Selected theme
  selectedTheme: ThemeId;
  
  // Custom theme configuration
  customConfig: CustomThemeConfig;
}

// Color validation types
export interface ContrastResult {
  ratio: number;
  aa: boolean;
  aaa: boolean;
}

export interface ColorValidation {
  isValid: boolean;
  contrastRatio: number;
  meetsAA: boolean;
  meetsAAA: boolean;
  suggestions?: string[];
}
