// Bill Color Theme Presets — Professional premium palettes

export type BillColorThemeId = 
  | 'modern-black-orange'
  | 'classic-teal-gold'
  | 'royal-blue-gold'
  | 'burgundy-cream'
  | 'forest-bronze';

export interface BillColorPalette {
  // Core
  headerBg: string;
  headerText: string;
  accent1: string;        // Primary accent (gradient start)
  accent2: string;        // Secondary accent (gradient end)
  // Text
  textPrimary: string;    // Main dark text
  textSecondary: string;  // Slightly lighter
  textBody: string;       // Body content
  textMuted: string;      // Labels, hints
  // Surfaces
  white: string;
  pale: string;           // Alternating rows
  warmBg: string;         // Payment section bg
  // Borders & Lines
  silver: string;
  lightSilver: string;
  // Total bar
  totalGradientStart: string;
  totalGradientEnd: string;
  totalAmountBg: string;
  totalAmountText: string;
  // Icon circle colors
  iconCircle1: string;
  iconCircle2: string;
}

export interface BillColorTheme {
  id: BillColorThemeId;
  name: string;
  description: string;
  preview: { bg: string; accent: string; text: string; stripe: string };
  palette: BillColorPalette;
}

export const BILL_COLOR_THEMES: BillColorTheme[] = [
  {
    id: 'modern-black-orange',
    name: 'Modern Black & Orange',
    description: 'Bold, energetic — premium commerce feel',
    preview: { bg: '#1A1A1A', accent: '#F5A623', text: '#FFFFFF', stripe: '#E8712B' },
    palette: {
      headerBg: '#1A1A1A',
      headerText: '#FFFFFF',
      accent1: '#F5A623',
      accent2: '#E8712B',
      textPrimary: '#1A1A1A',
      textSecondary: '#2D2D2D',
      textBody: '#4A4A4A',
      textMuted: '#8A8A8A',
      white: '#FFFFFF',
      pale: '#F7F7F7',
      warmBg: '#FFFBF5',
      silver: '#B0B0B0',
      lightSilver: '#E8E8E8',
      totalGradientStart: '#E8712B',
      totalGradientEnd: '#F5A623',
      totalAmountBg: '#1A1A1A',
      totalAmountText: '#F5A623',
      iconCircle1: '#E8712B',
      iconCircle2: '#F5A623',
    },
  },
  {
    id: 'classic-teal-gold',
    name: 'Classic Teal & Gold',
    description: 'Timeless corporate — trust & prestige',
    preview: { bg: '#1A3A3A', accent: '#D4A84B', text: '#FFFFFF', stripe: '#2A7A6A' },
    palette: {
      headerBg: '#1A3A3A',
      headerText: '#FFFFFF',
      accent1: '#D4A84B',
      accent2: '#2A7A6A',
      textPrimary: '#1A2E2E',
      textSecondary: '#2D4040',
      textBody: '#3D5555',
      textMuted: '#7A9090',
      white: '#FFFFFF',
      pale: '#F4F8F7',
      warmBg: '#FDFCF6',
      silver: '#9BB0AB',
      lightSilver: '#D8E4E1',
      totalGradientStart: '#2A7A6A',
      totalGradientEnd: '#D4A84B',
      totalAmountBg: '#1A3A3A',
      totalAmountText: '#D4A84B',
      iconCircle1: '#2A7A6A',
      iconCircle2: '#D4A84B',
    },
  },
  {
    id: 'royal-blue-gold',
    name: 'Royal Blue & Gold',
    description: 'Regal & authoritative — luxury premium',
    preview: { bg: '#1B2A4A', accent: '#D4A84B', text: '#FFFFFF', stripe: '#3A5BA0' },
    palette: {
      headerBg: '#1B2A4A',
      headerText: '#FFFFFF',
      accent1: '#D4A84B',
      accent2: '#3A5BA0',
      textPrimary: '#1B2A4A',
      textSecondary: '#2D3D5A',
      textBody: '#4A5570',
      textMuted: '#8A92A5',
      white: '#FFFFFF',
      pale: '#F5F6FA',
      warmBg: '#FDFCF6',
      silver: '#A0A8BC',
      lightSilver: '#DCE0EA',
      totalGradientStart: '#3A5BA0',
      totalGradientEnd: '#D4A84B',
      totalAmountBg: '#1B2A4A',
      totalAmountText: '#D4A84B',
      iconCircle1: '#3A5BA0',
      iconCircle2: '#D4A84B',
    },
  },
  {
    id: 'burgundy-cream',
    name: 'Burgundy & Cream',
    description: 'Warm & distinguished — classic elegance',
    preview: { bg: '#4A1A2A', accent: '#C9A96E', text: '#FFFFFF', stripe: '#8B3A50' },
    palette: {
      headerBg: '#4A1A2A',
      headerText: '#FFFFFF',
      accent1: '#C9A96E',
      accent2: '#8B3A50',
      textPrimary: '#3A1520',
      textSecondary: '#552030',
      textBody: '#5A4048',
      textMuted: '#9A8088',
      white: '#FFFFFF',
      pale: '#FAF6F7',
      warmBg: '#FDF9F3',
      silver: '#B8A0A8',
      lightSilver: '#E8DDE0',
      totalGradientStart: '#8B3A50',
      totalGradientEnd: '#C9A96E',
      totalAmountBg: '#4A1A2A',
      totalAmountText: '#C9A96E',
      iconCircle1: '#8B3A50',
      iconCircle2: '#C9A96E',
    },
  },
  {
    id: 'forest-bronze',
    name: 'Forest & Bronze',
    description: 'Earthy & industrial — rugged premium',
    preview: { bg: '#1E2E1E', accent: '#B8860B', text: '#FFFFFF', stripe: '#3A6B3A' },
    palette: {
      headerBg: '#1E2E1E',
      headerText: '#FFFFFF',
      accent1: '#B8860B',
      accent2: '#3A6B3A',
      textPrimary: '#1E2E1E',
      textSecondary: '#2D402D',
      textBody: '#4A5A4A',
      textMuted: '#7A8A7A',
      white: '#FFFFFF',
      pale: '#F4F7F4',
      warmBg: '#FBF8F0',
      silver: '#9AAA9A',
      lightSilver: '#D8E2D8',
      totalGradientStart: '#3A6B3A',
      totalGradientEnd: '#B8860B',
      totalAmountBg: '#1E2E1E',
      totalAmountText: '#B8860B',
      iconCircle1: '#3A6B3A',
      iconCircle2: '#B8860B',
    },
  },
];

export function getBillColorTheme(id: BillColorThemeId): BillColorTheme {
  return BILL_COLOR_THEMES.find(t => t.id === id) || BILL_COLOR_THEMES[0];
}

export function getBillPalette(id: BillColorThemeId): BillColorPalette {
  return getBillColorTheme(id).palette;
}
