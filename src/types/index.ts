// Ameer Autos - TypeScript Type Definitions

// Unit types for parts
export type UnitType = 'piece' | 'set' | 'pair' | 'box' | 'custom';

// Activity log action types
export type ActivityAction = 'create' | 'update' | 'delete' | 'sale' | 'backup' | 'restore' | 'sync';

// Entity types for activity logging
export type EntityType = 'part' | 'sale' | 'brand' | 'category' | 'settings' | 'backup';

// Backup format types
export type BackupFormat = 'json' | 'csv' | 'xlsx';

// Backup location types
export type BackupType = 'local' | 'gdrive';

// Stock status for filtering
export type StockStatus = 'all' | 'in-stock' | 'low-stock' | 'out-of-stock';

// View mode for inventory
export type ViewMode = 'list' | 'grid' | 'table';

// Theme modes
export type ThemeMode = 'light' | 'dark' | 'system';

// Parts Table
export interface Part {
  id: string;
  name: string;
  sku: string;
  brandId: string;
  categoryId: string;
  unitType: UnitType;
  customUnit?: string;
  quantity: number;
  minStockLevel: number;
  buyingPrice: number;
  sellingPrice: number;
  location: string;
  notes: string;
  images: string[];
  createdAt: Date;
  updatedAt: Date;
}

// Brand Table
export interface Brand {
  id: string;
  name: string;
  createdAt: Date;
}

// Category Table
export interface Category {
  id: string;
  name: string;
  createdAt: Date;
}

// Sales Table
export interface Sale {
  id: string;
  partId: string;
  partName: string;
  partSku: string;
  quantity: number;
  unitPrice: number;
  totalAmount: number;
  buyingPrice: number;
  profit: number;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  createdAt: Date;
}

// Activity Log Table
export interface ActivityLog {
  id: string;
  action: ActivityAction;
  entityType: EntityType;
  entityId?: string;
  description: string;
  metadata?: Record<string, unknown>;
  isDeleted?: boolean;
  createdAt: Date;
}

// App Settings Table
export interface AppSettings {
  id: string;
  key: string;
  value: unknown;
  updatedAt: Date;
}

// Autocomplete Entry
export interface AutocompleteEntry {
  id: string;
  field: string;
  value: string;
  /** For customerName entries, stores the linked phone number */
  linkedPhone?: string;
  createdAt: Date;
}

// Backup Records Table
export interface BackupRecord {
  id: string;
  type: BackupType;
  filename: string;
  size: number;
  format: BackupFormat;
  createdAt: Date;
}

// Weekly sale day for mini chart
export interface WeeklySaleDay {
  date: string;
  sales: number;
  profit: number;
}

// Stock distribution for inventory status bar
export interface StockDistribution {
  inStock: number;
  lowStock: number;
  outOfStock: number;
}

// Dashboard Summary Stats
export interface DashboardStats {
  totalParts: number;
  inventoryValue: number;
  todaySales: number;
  todayProfit: number;
  monthlyProfit: number;
  lowStockCount: number;
  weeklySales: WeeklySaleDay[];
  stockDistribution: StockDistribution;
}

// Report Date Range
export interface DateRange {
  startDate: Date;
  endDate: Date;
  label: string;
}

// Report Summary
export interface ReportSummary {
  totalSales: number;
  totalProfit: number;
  profitMargin: number;
  itemsSold: number;
  averageSaleValue: number;
  salesCount: number;
}

// Chart Data Point
export interface ChartDataPoint {
  date: string;
  value: number;
  label?: string;
}

// Category Sales Data
export interface CategorySalesData {
  category: string;
  sales: number;
  profit: number;
  count: number;
}

// Top Selling Part
export interface TopSellingPart {
  partId: string;
  partName: string;
  sku: string;
  quantitySold: number;
  totalRevenue: number;
  totalProfit: number;
}

// Form input types for Add/Edit Part
export interface PartFormData {
  name: string;
  sku: string;
  brandId: string;
  categoryId: string;
  unitType: UnitType;
  customUnit?: string;
  quantity: number;
  minStockLevel: number;
  buyingPrice: number;
  sellingPrice: number;
  location: string;
  notes: string;
  images: string[];
}

// Sale Form Data
export interface SaleFormData {
  partId: string;
  quantity: number;
  unitPrice: number;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}

// Settings Keys
export type SettingsKey =
  | 'theme'
  | 'language'
  | 'currencyFormat'
  | 'dateFormat'
  | 'notifications'
  | 'syncEnabled'
  | 'syncApiKey'
  | 'syncFolderId'
  | 'lastSyncTime';

// Navigation Routes
export type AppRoute =
  | '/'
  | '/inventory'
  | '/inventory/add'
  | '/inventory/edit/:id'
  | '/inventory/:id'
  | '/sale'
  | '/reports'
  | '/settings'
  | '/settings/theme'
  | '/settings/language'
  | '/settings/sync'
  | '/settings/backup'
  | '/activity-log';
