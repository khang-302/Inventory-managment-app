
# Ameer Autos - Inventory & Sales Manager
## Complete Implementation Plan

---

## Project Overview

A production-ready, offline-first inventory management application for an auto parts business in Pakistan. The app will be mobile-first, optimized for Samsung Galaxy A16, with a dark AMOLED theme, and support complete offline functionality with optional cloud sync.

---

## Architecture Overview

```text
+------------------------------------------+
|            Ameer Autos App               |
+------------------------------------------+
|                                          |
|  +----------------+  +----------------+  |
|  |   UI Layer     |  |  State Mgmt   |  |
|  |  (React +      |  |  (React       |  |
|  |   Tailwind)    |  |   Context)    |  |
|  +-------+--------+  +-------+-------+  |
|          |                   |          |
|          v                   v          |
|  +--------------------------------------+|
|  |        Service Layer                 ||
|  |  - InventoryService                  ||
|  |  - SalesService                      ||
|  |  - ReportService                     ||
|  |  - ExportService                     ||
|  |  - BackupService                     ||
|  +------------------+-------------------+|
|                     |                    |
|                     v                    |
|  +--------------------------------------+|
|  |      Dexie.js (IndexedDB)            ||
|  |  Local-First Database                ||
|  +--------------------------------------+|
|                     |                    |
|                     v (optional)         |
|  +--------------------------------------+|
|  |     Google Drive Sync (Optional)     ||
|  +--------------------------------------+|
+------------------------------------------+
```

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| UI Framework | React 18 + TypeScript |
| Styling | Tailwind CSS (Dark AMOLED Theme) |
| Components | shadcn/ui (existing) |
| Charts | Recharts (already installed) |
| Local Database | Dexie.js (IndexedDB wrapper) |
| PDF Export | jsPDF + jspdf-autotable |
| Excel Export | xlsx (SheetJS) |
| Form Validation | React Hook Form + Zod (installed) |
| Routing | React Router DOM (installed) |
| Date Handling | date-fns (installed) |

---

## New Dependencies Required

```json
{
  "dexie": "^4.0.0",
  "dexie-react-hooks": "^1.1.0",
  "jspdf": "^2.5.0",
  "jspdf-autotable": "^3.8.0",
  "xlsx": "^0.18.0",
  "uuid": "^9.0.0",
  "@types/uuid": "^9.0.0",
  "file-saver": "^2.0.5",
  "@types/file-saver": "^2.0.0"
}
```

---

## Project Structure

```text
src/
├── components/
│   ├── ui/                    # Existing shadcn components
│   ├── layout/
│   │   ├── AppLayout.tsx      # Main app wrapper
│   │   ├── BottomNav.tsx      # Bottom navigation bar
│   │   └── Header.tsx         # Page headers
│   ├── dashboard/
│   │   ├── SummaryCard.tsx
│   │   ├── QuickActions.tsx
│   │   ├── RecentActivity.tsx
│   │   └── LowStockAlert.tsx
│   ├── inventory/
│   │   ├── PartsList.tsx
│   │   ├── PartCard.tsx
│   │   ├── PartForm.tsx
│   │   ├── SearchBar.tsx
│   │   ├── FilterPanel.tsx
│   │   └── ImageUploader.tsx
│   ├── reports/
│   │   ├── ReportCharts.tsx
│   │   ├── DateRangePicker.tsx
│   │   ├── ExportButtons.tsx
│   │   └── SalesChart.tsx
│   └── settings/
│       ├── SettingsList.tsx
│       ├── ThemeSettings.tsx
│       ├── SyncSettings.tsx
│       └── BackupSettings.tsx
├── db/
│   ├── database.ts            # Dexie database setup
│   ├── models.ts              # TypeScript interfaces
│   └── migrations.ts          # Schema migrations
├── services/
│   ├── inventoryService.ts
│   ├── salesService.ts
│   ├── categoryService.ts
│   ├── brandService.ts
│   ├── reportService.ts
│   ├── exportService.ts
│   ├── backupService.ts
│   └── activityLogService.ts
├── hooks/
│   ├── useInventory.ts
│   ├── useSales.ts
│   ├── useReports.ts
│   ├── useSettings.ts
│   └── useActivityLog.ts
├── contexts/
│   ├── AppContext.tsx         # Global app state
│   └── SettingsContext.tsx    # Settings state
├── pages/
│   ├── Dashboard.tsx
│   ├── Inventory.tsx
│   ├── AddEditPart.tsx
│   ├── PartDetails.tsx
│   ├── Reports.tsx
│   ├── Settings.tsx
│   ├── ActivityLog.tsx
│   └── RecordSale.tsx
├── utils/
│   ├── currency.ts            # Rs formatting
│   ├── dateUtils.ts
│   ├── validators.ts
│   └── constants.ts
└── types/
    └── index.ts               # All TypeScript types
```

---

## Database Schema (Dexie.js / IndexedDB)

### Data Models

```typescript
// Parts Table
interface Part {
  id: string;                 // UUID
  name: string;
  sku: string;
  brandId: string;
  categoryId: string;
  unitType: 'piece' | 'set' | 'pair' | 'box' | 'custom';
  customUnit?: string;
  quantity: number;
  minStockLevel: number;
  buyingPrice: number;        // In Rs (Pakistani Rupees)
  sellingPrice: number;       // In Rs
  location: string;
  notes: string;
  images: string[];           // Base64 or blob URLs
  createdAt: Date;
  updatedAt: Date;
}

// Brands Table
interface Brand {
  id: string;
  name: string;
  createdAt: Date;
}

// Categories Table
interface Category {
  id: string;
  name: string;
  createdAt: Date;
}

// Sales Table
interface Sale {
  id: string;
  partId: string;
  partName: string;           // Denormalized for reports
  quantity: number;
  unitPrice: number;          // Rs
  totalAmount: number;        // Rs
  buyingPrice: number;        // For profit calculation
  profit: number;             // Rs
  customerName?: string;
  customerPhone?: string;
  notes?: string;
  createdAt: Date;
}

// Activity Log Table
interface ActivityLog {
  id: string;
  action: 'create' | 'update' | 'delete' | 'sale' | 'backup' | 'restore' | 'sync';
  entityType: 'part' | 'sale' | 'brand' | 'category' | 'settings' | 'backup';
  entityId?: string;
  description: string;
  metadata?: object;
  createdAt: Date;
}

// App Settings Table
interface AppSettings {
  id: string;
  key: string;
  value: any;
  updatedAt: Date;
}

// Backup Records Table
interface BackupRecord {
  id: string;
  type: 'local' | 'gdrive';
  filename: string;
  size: number;
  format: 'json' | 'csv' | 'xlsx';
  createdAt: Date;
}
```

### Database Indexes

```typescript
class AmeerAutosDB extends Dexie {
  parts!: Table<Part>;
  brands!: Table<Brand>;
  categories!: Table<Category>;
  sales!: Table<Sale>;
  activityLogs!: Table<ActivityLog>;
  settings!: Table<AppSettings>;
  backupRecords!: Table<BackupRecord>;

  constructor() {
    super('AmeerAutosDB');
    this.version(1).stores({
      parts: 'id, name, sku, brandId, categoryId, quantity, createdAt',
      brands: 'id, name',
      categories: 'id, name',
      sales: 'id, partId, createdAt',
      activityLogs: 'id, action, entityType, createdAt',
      settings: 'id, key',
      backupRecords: 'id, type, createdAt'
    });
  }
}
```

---

## Screen Implementations

### 1. Dashboard Page

**Features:**
- Business summary cards (Total inventory value, Today's sales, Monthly profit, Low stock count)
- Quick action buttons (Add Part, Record Sale, Export, Backup)
- Recent activity list (last 10 activities)
- Low stock alerts panel

**Summary Cards Data:**
- Total Parts: Count of all parts
- Inventory Value: Sum of (quantity * buyingPrice) in Rs
- Today's Sales: Sum of sales amounts today in Rs
- Today's Profit: Sum of profits today in Rs
- Low Stock Items: Count where quantity <= minStockLevel

### 2. Inventory Page

**Features:**
- Search bar (search by name, SKU)
- Filter panel (brand, category, stock status)
- Toggle between list/grid view
- Part cards with:
  - Image thumbnail
  - Name, SKU
  - Stock quantity (highlighted if low)
  - Selling price in Rs
- Floating action button to add new part
- Swipe actions for edit/delete
- Pull-to-refresh for data reload

**Stock Status Filters:**
- All
- In Stock (quantity > minStockLevel)
- Low Stock (quantity <= minStockLevel and > 0)
- Out of Stock (quantity = 0)

### 3. Add/Edit Part Page

**Form Fields:**
- Part Name (required, validated)
- SKU (required, unique validation)
- Brand (dropdown with "Add New" option)
- Category (dropdown with "Add New" option)
- Unit Type (piece, set, pair, box, custom)
- Quantity (number, min 0)
- Minimum Stock Level (for alerts)
- Buying Price (Rs, required)
- Selling Price (Rs, required)
- Location (text)
- Notes (textarea)
- Images (up to 5, camera capture + gallery)

**Validation Rules:**
- Name: 3-100 characters
- SKU: 2-50 characters, unique
- Prices: Positive numbers only
- Quantity: Non-negative integers

### 4. Reports & Analytics Page

**Time Range Options:**
- Today
- This Week (1 week)
- Last 2 Weeks
- Last 3 Weeks
- This Month
- Previous Month
- Last 3 Months
- Last 6 Months
- This Year
- Custom Date Range

**Charts & Metrics (using Recharts):**
- Sales Over Time (Line Chart)
- Profit Over Time (Area Chart)
- Top Selling Parts (Bar Chart)
- Sales by Category (Pie Chart)
- Stock Value by Category (Bar Chart)
- Low Stock Summary (Table)

**Summary Metrics:**
- Total Sales (Rs)
- Total Profit (Rs)
- Profit Margin (%)
- Items Sold (count)
- Average Sale Value (Rs)

**Export Options:**
- PDF Report (jsPDF)
- Excel Spreadsheet (xlsx)
- CSV File

### 5. Settings Page

**Layout (exactly as specified):**

```text
+----------------------------------+
|  < Settings                      |
+----------------------------------+
|  [Search settings...]            |
+----------------------------------+
|                                  |
|  > Language & Localization       |
|                                  |
|  > Theme & Appearance            |
|                                  |
|  > Navigation Layout             |
|                                  |
+----------------------------------+
|                                  |
|  > Google Drive Auto-Sync        |
|    Real-time backup in Excel,    |
|    Sheets & JSON                 |
|                                  |
|  > Backup & Restore              |
|    Advanced backup and export    |
|    operations                    |
|                                  |
+----------------------------------+
|                                  |
|  Notifications          [Toggle] |
|                                  |
+----------------------------------+
|                                  |
|  > Activity Log                  |
|    [Backup]  [Sync]              |
|                                  |
+----------------------------------+
```

**Sub-pages:**
- Language & Localization: Currency format, date format
- Theme & Appearance: Dark/Light/AMOLED mode
- Navigation Layout: Bottom nav preferences
- Google Drive Auto-Sync: API key setup, sync toggle
- Backup & Restore: Manual backup, restore, export all data

---

## Dark AMOLED Theme

**Color Palette (CSS Variables):**

```css
:root {
  /* AMOLED Dark Theme - True blacks for power saving */
  --background: 0 0% 0%;           /* Pure black #000000 */
  --foreground: 0 0% 98%;          /* Near white */
  
  --card: 0 0% 4%;                 /* Very dark gray */
  --card-foreground: 0 0% 98%;
  
  --primary: 142 76% 36%;          /* Green accent (professional) */
  --primary-foreground: 0 0% 100%;
  
  --secondary: 0 0% 10%;           /* Dark gray */
  --secondary-foreground: 0 0% 98%;
  
  --muted: 0 0% 15%;
  --muted-foreground: 0 0% 65%;
  
  --accent: 142 76% 36%;           /* Green accent */
  --accent-foreground: 0 0% 100%;
  
  --destructive: 0 84% 60%;        /* Red for warnings/delete */
  --destructive-foreground: 0 0% 100%;
  
  --warning: 38 92% 50%;           /* Orange for low stock */
  --success: 142 76% 36%;          /* Green for success states */
  
  --border: 0 0% 15%;
  --input: 0 0% 10%;
  --ring: 142 76% 36%;
}
```

---

## Currency Formatting

**Currency Utility (Rs/₨):**

```typescript
// src/utils/currency.ts
export const formatCurrency = (amount: number): string => {
  return `Rs ${amount.toLocaleString('en-PK')}`;
};

export const formatCurrencyShort = (amount: number): string => {
  if (amount >= 10000000) {
    return `Rs ${(amount / 10000000).toFixed(2)} Cr`;
  }
  if (amount >= 100000) {
    return `Rs ${(amount / 100000).toFixed(2)} Lac`;
  }
  return formatCurrency(amount);
};

export const parseCurrency = (value: string): number => {
  return parseFloat(value.replace(/[^0-9.-]+/g, '')) || 0;
};
```

---

## Export Services

### PDF Export (jsPDF)

```typescript
// Features:
- Professional header with business name
- Report title and date range
- Summary statistics table
- Detailed transaction tables
- Charts rendered as images (html2canvas)
- Footer with page numbers
- All amounts in Rs format
```

### Excel Export (xlsx)

```typescript
// Features:
- Multiple sheets (Summary, Sales, Inventory)
- Formatted headers
- Currency columns formatted with Rs
- Date columns properly formatted
- Auto-fit column widths
```

### CSV Export

```typescript
// Features:
- Standard CSV format
- Header row with column names
- Currency values with Rs prefix
- UTF-8 encoding for special characters
```

---

## Offline-First Implementation

**Strategy:**

1. **All data stored in IndexedDB first**
   - Every CRUD operation writes to local database
   - UI reads from local database only
   - No network requests required for basic operations

2. **Image Storage**
   - Images stored as base64 in IndexedDB
   - Compressed before storage (max 500KB per image)
   - Thumbnail generated for list views

3. **Backup/Restore**
   - Full database export to JSON file
   - Download to device storage
   - Restore from JSON file upload

4. **Optional Google Drive Sync (User Controlled)**
   - Disabled by default
   - User must provide API credentials
   - Background sync when enabled
   - Conflict resolution: Local wins (latest timestamp)

---

## Activity Logging

**Logged Actions:**
- Part created/updated/deleted
- Sale recorded
- Stock adjusted
- Backup created/restored
- Settings changed
- Sync performed

**Log Entry Format:**
```typescript
{
  id: "uuid",
  action: "sale",
  entityType: "part",
  entityId: "part-uuid",
  description: "Sold 2x Brake Pad (SKU: BP-001) for Rs 2,400",
  metadata: {
    quantity: 2,
    amount: 2400,
    previousStock: 10,
    newStock: 8
  },
  createdAt: new Date()
}
```

---

## Implementation Phases

### Phase 1: Foundation (Core Setup)
1. Update theme to AMOLED dark
2. Set up Dexie.js database with all tables
3. Create TypeScript interfaces for all models
4. Create currency utility functions
5. Set up app layout with bottom navigation
6. Create basic routing structure

### Phase 2: Inventory Management
1. Build inventory list page with search/filter
2. Create add/edit part form with validation
3. Implement image capture and storage
4. Add brand and category management
5. Implement part deletion with confirmation
6. Add low stock highlighting

### Phase 3: Sales & Stock
1. Create sale recording form
2. Implement automatic stock deduction
3. Add profit calculation logic
4. Build sales history view
5. Implement activity logging

### Phase 4: Reports & Analytics
1. Build date range picker component
2. Create summary statistics calculations
3. Implement charts (Sales, Profit, Categories)
4. Build report generation logic
5. Implement PDF export
6. Implement Excel export
7. Implement CSV export

### Phase 5: Settings & Backup
1. Build settings page with all sections
2. Implement theme switching
3. Create backup/restore functionality
4. Build activity log view
5. Add Google Drive sync setup (optional feature)

### Phase 6: Polish & Optimization
1. Add loading states and skeletons
2. Implement empty states
3. Add confirmation dialogs
4. Optimize for performance
5. Test on Galaxy A16 viewport
6. Final touch-friendly spacing adjustments

---

## Mobile-First Design Guidelines

**Touch Targets:**
- Minimum 44x44px for all interactive elements
- 8-16px spacing between touch targets

**Typography:**
- Base font size: 16px
- Headers: 20-24px
- Touch-friendly line height: 1.5

**Layout:**
- Full-width cards on mobile
- Bottom navigation: 56px height
- Safe area padding for notches
- Swipe gestures for common actions

**Performance:**
- Virtualized lists for large datasets
- Lazy loading for images
- Debounced search inputs
- Skeleton loaders during data fetch

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/db/database.ts` | Dexie database setup |
| `src/db/models.ts` | TypeScript interfaces |
| `src/utils/currency.ts` | Currency formatting |
| `src/utils/dateUtils.ts` | Date helpers |
| `src/contexts/AppContext.tsx` | Global state |
| `src/components/layout/AppLayout.tsx` | Main layout |
| `src/components/layout/BottomNav.tsx` | Navigation |
| `src/pages/Dashboard.tsx` | Dashboard page |
| `src/pages/Inventory.tsx` | Inventory list |
| `src/pages/AddEditPart.tsx` | Part form |
| `src/pages/Reports.tsx` | Reports page |
| `src/pages/Settings.tsx` | Settings page |
| `src/services/inventoryService.ts` | Inventory CRUD |
| `src/services/salesService.ts` | Sales operations |
| `src/services/exportService.ts` | PDF/Excel/CSV |
| `src/services/backupService.ts` | Backup/Restore |
| + 25 more component and service files |

---

## Summary

This plan delivers a complete, production-ready inventory management app with:

- True offline-first architecture using IndexedDB (Dexie.js)
- Professional AMOLED dark theme optimized for Samsung Galaxy A16
- Pakistan Rupee (Rs) currency throughout
- Full CRUD for inventory, brands, categories
- Sales recording with automatic stock and profit calculations
- Comprehensive reports with real chart visualizations
- Offline PDF, Excel, and CSV exports
- Complete backup and restore functionality
- Optional Google Drive sync (user-controlled)
- Activity logging for audit trail
- Touch-friendly, mobile-first design
