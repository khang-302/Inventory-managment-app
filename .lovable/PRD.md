# Ameer Autos — Product Requirements Document (PRD)

> **Version:** 1.2.0  
> **Last Updated:** 2026-03-13  
> **Status:** Production  

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Target Users](#2-target-users)
3. [Core Features](#3-core-features)
4. [System Architecture](#4-system-architecture)
5. [Data Flow](#5-data-flow)
6. [Local Data Storage](#6-local-data-storage)
7. [Navigation Structure](#7-navigation-structure)
8. [Bill Generation System](#8-bill-generation-system)
9. [Android Integration](#9-android-integration)
10. [Settings System](#10-settings-system)
11. [Future Scalability](#11-future-scalability)

---

## 1. Product Overview

**Ameer Autos** is an offline-first, mobile-first inventory and sales management application designed for auto parts shops. It enables shop owners to track spare parts inventory, record sales transactions, generate professional bills/invoices, and view business analytics — all without requiring an internet connection.

### Key Goals

- **Offline-first:** All data is stored locally in the browser via IndexedDB. No server or cloud account is required for core functionality.
- **Mobile-first:** Optimized for Android phones (deployed as a native APK via Capacitor), with responsive support for tablets and desktops.
- **Professional billing:** Generate premium-quality invoices with customizable color themes, watermarks, and shop branding that can be exported as images or PDFs and shared via WhatsApp or native share.
- **Zero setup:** No login, no account creation. Open the app and start managing inventory immediately.

### Currency & Locale

- Primary currency: **PKR (Pakistani Rupee)**, displayed as `Rs`.
- Locale: `en-PK`.
- Supports Lakh/Crore formatting (e.g., "Rs 12.5 Lakh").

---

## 2. Target Users

| User Type | Description |
|-----------|-------------|
| **Auto parts shop owners** | Small to medium shop owners in Pakistan who sell automotive spare parts and need to track inventory, pricing, and sales. |
| **Shop managers/staff** | Employees who record daily sales and check stock levels. |
| **Solo entrepreneurs** | Single-person operations managing their own parts business. |

### User Characteristics

- May have limited technical literacy — the app must be simple and intuitive.
- Primarily use Android smartphones as their primary computing device.
- Need to generate bills quickly during customer transactions.
- Want to track profit margins and identify low-stock items.
- May not have reliable internet access, making offline operation essential.

---

## 3. Core Features

### 3.1 Dashboard

**Purpose:** At-a-glance overview of business health and quick access to common actions.

**Components:**
- **KPI Cards (2×2 grid):** Total Parts, Inventory Value, Today's Sales, Low Stock Count. Each card uses animated count-up values and distinct accent colors.
- **Quick Actions (4-button grid):** Add Part, New Sale, Reports, Quick Sell — one-tap access to primary workflows.
- **Weekly Sales Mini Chart:** Area chart showing the last 7 days of sales revenue using Recharts.
- **Inventory Health Bar:** Stacked progress bar showing In Stock / Low Stock / Out of Stock distribution.
- **Low Stock Alerts:** List of up to 5 parts at or below minimum stock level, with progress bars and emergency indicators. Clickable to navigate to part details.
- **Monthly Overview:** Current month's profit and today's profit side by side.
- **Recent Activity:** Last 6 activity log entries with icons, labels, relative timestamps, and color-coded action bars.

**Quick Sell Modal:** A streamlined drawer/dialog accessible from the dashboard for recording a single-item sale without navigating away. Supports part selection, quantity, unit price, optional customer info, and auto-bill generation.

### 3.2 Inventory Management

**Purpose:** Full CRUD management of spare parts with filtering, sorting, and bulk operations.

**Features:**
- **Three View Modes:** List view (default), Grid view (card-based), Table view (spreadsheet-style with sortable columns). View mode preference is persisted.
- **Search:** Real-time text search across part name and SKU.
- **Filters:** Brand, Category, and Stock Status filters with collapsible filter panel.
- **Sorting:** Sortable by Name, SKU, Brand, Quantity, and Price. Sort preferences are persisted.
- **Stock Status Badges:** Visual indicators for "Out of Stock" (destructive) and "Low Stock" (warning).
- **Emergency Indicator:** Pulsing red dot for critically low stock items.
- **Bulk Operations (Table View):** Checkbox selection with select-all, bulk delete with confirmation dialog.
- **Add/Edit Part:** Full form with fields for Name, SKU, Brand (with create-new), Category (with create-new), Unit Type (piece/set/pair/box/custom), Quantity, Min Stock Level, Buying Price, Selling Price, Location, Notes, and up to 5 images.
- **Part Details:** Detailed view of a single part with all metadata, stock level visualization, and sale history.

**Data Model — `Part`:**
```
id, name, sku, brandId, categoryId, unitType, customUnit?, quantity,
minStockLevel, buyingPrice, sellingPrice, location, notes, images[],
isDemo?, createdAt, updatedAt
```

### 3.3 Sales System

**Purpose:** Record multi-item sales with cart management, customer info, and optional automatic bill generation.

**Workflow:**
1. Select a part from dropdown (shows available stock).
2. Set quantity and unit price (defaults to selling price).
3. Add to cart (or update existing cart item).
4. Repeat for multiple items.
5. Optionally enter customer name, phone, and notes.
6. Toggle "Auto Generate Bill" (defaults from global setting).
7. Complete sale → stock is deducted, sale records are created, activity is logged, notifications are fired.

**Features:**
- **Cart Management:** Add, edit (inline), remove items. Shows per-item subtotal and profit.
- **Available Stock Tracking:** Real-time calculation of available stock minus quantities already in cart.
- **Profit Calculation:** Per-item and grand total profit computed as `(sellingPrice - buyingPrice) × quantity`.
- **Autocomplete:** Customer name and phone fields use smart autocomplete from previously entered values. Selecting a customer name auto-fills their linked phone number.
- **Auto Bill Generation:** When enabled, a bill is automatically created from the sale data. A success dialog appears with options to View Bill, Share as Image, or close.
- **Multi-Sale Recording:** Uses a database transaction to atomically write all sale records and update stock levels.

**Data Model — `Sale`:**
```
id, partId, partName, partSku, quantity, unitPrice, totalAmount,
buyingPrice, profit, customerName?, customerPhone?, notes?, createdAt
```

### 3.4 Quick Sell

**Purpose:** Rapid single-item sale from the dashboard without navigating to the full sale screen.

- Opens as a modal/drawer.
- Part selector, quantity, unit price, customer info.
- Auto-bill toggle (respects global default).
- Success dialog with bill actions.

### 3.5 Billing System

**Purpose:** Generate professional, customizable invoices for customer transactions.

#### Bill Settings (Global Defaults)
- **Shop Info:** Shop name, tagline, owner name, phone numbers (2), address, website, social media.
- **Logo:** Upload custom shop logo (stored as base64 data URL).
- **Footer Message:** Custom text displayed at the bottom of every bill.
- **Bill Numbering:** Auto-incrementing format `AMT-XXXX`. Counter can be reset.
- **Payment Info:** Toggle to show payment details. Fields: Bank Name, Account Title, Account Number, IBAN, EasyPaisa Number, JazzCash Number.
- **Terms & Conditions:** Toggle to show. Dynamic list of terms (add/edit/remove).
- **Watermark:** Four styles — Text, Logo, Border Frame, Diagonal Lines. Adjustable opacity slider.
- **Color Theme:** Five curated premium palettes:
  - Modern Black & Orange
  - Classic Teal & Gold
  - Royal Blue & Gold
  - Burgundy & Cream
  - Forest & Bronze
- **Auto Generate Bill Default:** Global toggle persisted to database.

#### Bill Creation
- Manual bill creation screen (`/bills/create`) with item entry form.
- Edit existing bills (`/bills/edit/:id`).
- Per-bill overrides for payment info and terms.

#### Bill Preview & Export
- `BillPreviewTemplate` renders a pixel-perfect A4 invoice (794×1123px) using inline styles for reliable image capture.
- **Header:** Side-by-side layout with circular logo badge, shop name (auto-sized font), gold ornament dividers, tagline.
- **Body:** "Invoice From" bar, "Invoice To" block with bill number and date, items table with alternating row colors, grand total gradient bar.
- **Footer:** Terms & conditions, payment info grid, red banner bar with location/phone/website icons in accent circles, and a footer message.
- **Export as Image:** Uses `html-to-image` library to capture the preview as a PNG.
- **Export as PDF:** Uses `jsPDF` with `jspdf-autotable` for structured PDF generation.
- **Sharing:** Native share via Capacitor `Share` plugin, WhatsApp share, or web download fallback.

#### Bill History
- List of all bills with search/filter.
- Per-bill dropdown actions: Edit, Export Image, Export PDF, Share, WhatsApp, Delete.
- Delete confirmation dialog.

**Data Models:**
```
BillSettings: id, shopName, tagline, ownerName, phone1, phone2, address,
  website, socialMedia, logoPath, footerMessage, lastBillNumber,
  showPaymentInfo, paymentInfo{}, showTerms, termsConditions[],
  watermarkEnabled, watermarkStyle, watermarkText, watermarkOpacity,
  billColorTheme, updatedAt

Bill: id, billNumber, buyerName, buyerPhone, date, subtotal, discount,
  finalTotal, notes, showPaymentInfo?, paymentInfo?, showTerms?,
  termsConditions?, createdAt

BillItem: id, billId, partName, partCode, brand, quantity, price, total
```

### 3.6 Reports & Analytics

**Purpose:** Comprehensive business analytics with visual charts and data export.

**Features:**
- **Time Range Selector:** Predefined ranges (Today, Yesterday, This Week, This Month, Last 30 Days, Last 3 Months, This Year, All Time) plus custom date range picker. Selection is persisted.
- **KPI Cards:** Total Revenue, Total Profit, Orders/Bills count, Products Sold.
- **Sales Trend Chart:** Line/area chart showing revenue and profit over time.
- **Month-over-Month Comparison:** Compare current period vs. prior equivalent period.
- **Inventory Distribution Chart:** Pie/donut chart by category and by brand.
- **Low Stock Risk Analysis:** Bar chart showing items at risk with urgency levels (critical/warning/near).
- **Product Performance Matrix:** Scatter/bubble chart showing units sold vs. revenue vs. profit.
- **Sales Activity Heatmap:** Calendar heatmap of daily sales activity.
- **Top Selling Parts:** Ranked list of best-performing products.
- **Insights Panel:** AI-generated textual insights (growth %, top/bottom products, average daily sales).
- **Pull-to-Refresh:** Touch gesture to reload report data on mobile.
- **Export:** PDF (with captured chart images), Excel (multi-sheet), CSV.

### 3.7 Notification System

**Purpose:** Proactive alerts for inventory and business events.

**Types:**
| Type | Trigger | Priority |
|------|---------|----------|
| `low_stock` | Stock drops to/below min level | Critical |
| `part_added` | New part created | Normal |
| `part_sold` | Sale recorded | Normal |
| `backup_complete` | Backup file created | Normal |
| `sync` | Google Drive sync events | Normal |
| `custom` | User-created | Normal |

**Features:**
- **Immediate Notifications:** Fired instantly when the triggering event occurs.
- **Scheduled Notifications:** Fire at a specified future date/time.
- **Recurring Notifications:** Repeat at daily/weekly/monthly intervals.
- **Notification Preferences:** Per-type enable/disable toggles. Master enable/disable switch. Optional critical sound (880Hz beep via Web Audio API).
- **Notification History:** Dedicated page listing all fired notifications with read/unread status.
- **Notification Bell:** Header icon with unread count badge.
- **Templates:** Save reusable notification title/message templates.
- **Scheduler Hook:** `useNotificationScheduler` runs on app mount to process due scheduled/recurring notifications.

**Data Model — `AppNotification`:**
```
id, type, title, message, isRead, isSystem, priority, triggerType,
scheduledAt?, repeatInterval?, lastTriggeredAt?, isFired, createdAt
```

### 3.8 Settings System

See [Section 10](#10-settings-system) for full details.

### 3.9 Navigation System

See [Section 7](#7-navigation-structure) for full details.

---

## 4. System Architecture

### 4.1 Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | React 18 + TypeScript 5.4 |
| Build Tool | Vite 5 |
| Styling | Tailwind CSS 3 + shadcn/ui component library |
| State Management | React Context API + Dexie Live Queries |
| Routing | React Router DOM v6 |
| Charts | Recharts |
| Database | Dexie.js (IndexedDB wrapper) |
| PDF Generation | jsPDF + jspdf-autotable |
| Image Capture | html-to-image |
| Excel Export | SheetJS (xlsx) |
| Forms | React Hook Form + Zod validation |
| Native Bridge | Capacitor (Filesystem, Share, StatusBar) |
| Server Queries | TanStack React Query (for future API integration) |

### 4.2 Project Structure

```
src/
├── components/
│   ├── bill/           # Bill preview template, search filter
│   ├── dashboard/      # Quick sell modal
│   ├── layout/         # AppLayout, Header, BottomNav, SidebarNav, AlertBell
│   ├── reports/        # Chart components, KPI cards, time range selector
│   ├── sale/           # Sale success dialog
│   ├── theme/          # Theme editor, color picker, preset selector
│   └── ui/             # shadcn/ui primitives (50+ components)
├── contexts/
│   ├── AppContext.tsx       # Global state: DB init, stats, settings, navigation
│   ├── ThemeContext.tsx     # Advanced theme management with presets & overrides
│   └── TypographyContext.tsx # Font size and icon size scaling
├── db/
│   └── database.ts     # Dexie.js database definition, migrations, CRUD helpers
├── hooks/
│   ├── use-mobile.tsx          # Responsive breakpoint detection
│   ├── useBackNavigation.ts    # Android hardware back button handling
│   ├── useCountUp.ts           # Animated number counter
│   ├── useCurrencyFormat.ts    # Lakh/Crore formatting
│   ├── useLowStockAlert.ts     # Low stock detection
│   └── useNotificationScheduler.ts # Scheduled notification processor
├── pages/
│   ├── Dashboard.tsx, Inventory.tsx, RecordSale.tsx, Reports.tsx
│   ├── BillCreate.tsx, BillHistory.tsx, BillSettings.tsx
│   ├── AddEditPart.tsx, PartDetails.tsx
│   ├── ActivityLog.tsx, NotificationHistory.tsx
│   ├── Settings.tsx (hub) + settings/ (15 sub-pages)
│   └── Index.tsx, NotFound.tsx
├── services/
│   ├── inventoryService.ts     # Part CRUD, stock updates, reporting
│   ├── salesService.ts         # Sale recording (single & multi), analytics
│   ├── billService.ts          # Bill CRUD, settings, numbering
│   ├── saleBillService.ts      # Bridge: auto-create bill from sale
│   ├── activityLogService.ts   # Activity logging with icons/colors
│   ├── notificationService.ts  # Notification CRUD, scheduling, preferences
│   ├── autocompleteService.ts  # Smart form value persistence
│   ├── brandService.ts         # Brand CRUD
│   ├── categoryService.ts      # Category CRUD
│   ├── crashReportService.ts   # Error capture and reporting
│   └── demoSeedService.ts      # Demo data seeding and cleanup
├── types/
│   ├── index.ts        # Core types (Part, Sale, Brand, Category, etc.)
│   ├── bill.ts         # Bill system types
│   ├── notification.ts # Notification types
│   ├── theme.ts        # Theme configuration types
│   └── crashReport.ts  # Crash report types
└── utils/
    ├── currency.ts, dateUtils.ts, safeNumber.ts
    ├── billColorThemes.ts, billImageExport.ts, billPdf.ts
    ├── exportUtils.ts, reportCapture.ts
    ├── encryption.ts, nativeShare.ts
    ├── constants.ts, themePresets.ts, themeUtils.ts
    └── backupValidation.ts
```

### 4.3 Context Architecture

```
QueryClientProvider
  └─ TooltipProvider
      └─ AppProvider          (DB init, global state, settings, stats)
          └─ AdvancedThemeProvider  (Theme presets, custom colors, section overrides)
              └─ TypographyProvider  (Text/icon scaling)
                  └─ BrowserRouter
                      └─ ErrorBoundary
                          └─ Routes
```

### 4.4 Service Layer

Services are stateless modules that encapsulate database operations and business logic. They:
- Accept typed inputs and return typed outputs.
- Use Dexie transactions for atomic multi-table operations.
- Log activities via `activityLogService`.
- Fire notifications via `notificationService` (non-blocking).
- Perform safe numeric calculations via `safeNumber` utilities to prevent NaN propagation.

---

## 5. Data Flow

### 5.1 Sale → Bill → Report Pipeline

```
                    ┌─────────────┐
                    │  User adds  │
                    │  items to   │
                    │    cart      │
                    └──────┬──────┘
                           │
                    ┌──────▼──────┐
                    │ Complete    │
                    │   Sale      │
                    └──────┬──────┘
                           │
              ┌────────────┼────────────┐
              │            │            │
     ┌────────▼───┐  ┌─────▼─────┐  ┌──▼──────────┐
     │ Sale records│  │ Stock     │  │ Activity    │
     │ written to │  │ deducted  │  │ log entry   │
     │ sales table│  │ from parts│  │ created     │
     └────────┬───┘  └───────────┘  └─────────────┘
              │
     ┌────────▼───────┐
     │ Auto-bill      │ (if enabled)
     │ enabled?       │
     └────────┬───────┘
              │ Yes
     ┌────────▼───────┐
     │ Bill + Items   │
     │ created in DB  │
     └────────┬───────┘
              │
     ┌────────▼───────┐
     │ Success dialog │
     │ View / Share   │
     └────────────────┘

            ↓ (Later)

     ┌─────────────────┐
     │   Reports page  │
     │ reads sales DB  │
     │ computes stats  │
     └─────────────────┘
```

### 5.2 Inventory Lifecycle

```
Add Part → Stored in parts table → Appears in inventory list
         → Activity log: "create"
         → Notification: "part_added"

Record Sale → Stock quantity decremented
            → If qty ≤ minStockLevel → Notification: "low_stock" (critical)
            → Activity log: "sale"

Edit Part → Updated in parts table → Activity log: "update"

Delete Part → Removed from parts table → Activity log: "delete"
```

### 5.3 Real-time Reactivity

Data reactivity is achieved through **Dexie Live Queries** (`useLiveQuery`). When any table is modified:
1. All active live queries re-evaluate.
2. React components re-render with fresh data.
3. Dashboard stats automatically refresh (triggered by `parts.length` and `sales.length` changes).

---

## 6. Local Data Storage

### 6.1 Database Engine

**Dexie.js** wraps the browser's IndexedDB API, providing:
- Typed table definitions with TypeScript generics.
- Indexed fields for fast lookups.
- Transaction support for atomic operations.
- Live queries for reactive UI updates.
- Schema versioning with migrations.

### 6.2 Database Name

`AmeerAutosDB`

### 6.3 Schema Versions

| Version | Changes |
|---------|---------|
| 1 | Initial: parts, brands, categories, sales, activityLogs, settings, backupRecords |
| 2 | Added `isDeleted` index to activityLogs |
| 3 | Added `isDemo` index to parts |
| 4 | Added `billSettings`, `bills`, `billItems` tables |
| 5 | Added `autocompleteEntries` table with compound index `[field+value]` |
| 6 | Added `notifications` and `notificationTemplates` tables |
| 7 | Added `crashReports` table |

### 6.4 Tables

| Table | Primary Key | Indexes |
|-------|------------|---------|
| `parts` | `id` | name, sku, brandId, categoryId, quantity, createdAt, updatedAt, isDemo |
| `brands` | `id` | name, createdAt |
| `categories` | `id` | name, createdAt |
| `sales` | `id` | partId, createdAt |
| `activityLogs` | `id` | action, entityType, createdAt, isDeleted |
| `settings` | `id` | key |
| `backupRecords` | `id` | type, createdAt |
| `billSettings` | `id` | — |
| `bills` | `id` | billNumber, createdAt |
| `billItems` | `id` | billId |
| `autocompleteEntries` | `id` | field, [field+value] |
| `notifications` | `id` | type, isRead, createdAt, triggerType, isFired |
| `notificationTemplates` | `id` | createdAt |
| `crashReports` | `id` | errorCode, createdAt |

### 6.5 Settings Keys (Key-Value Store)

The `settings` table stores app configuration as key-value pairs:

| Key | Type | Default | Description |
|-----|------|---------|-------------|
| `theme` | `'dark' \| 'light' \| 'system'` | `'dark'` | App theme mode |
| `language` | `string` | `'en'` | UI language |
| `currencyFormat` | `string` | `'Rs'` | Currency display symbol |
| `dateFormat` | `string` | `'dd/MM/yyyy'` | Date format pattern |
| `notifications` | `boolean` | `true` | Master notification toggle |
| `syncEnabled` | `boolean` | `false` | Google Drive sync enabled |
| `syncApiKey` | `string` | `''` | Encrypted Google API key |
| `syncFolderId` | `string` | `''` | Google Drive folder ID |
| `lastSyncTime` | `string \| null` | `null` | ISO timestamp of last sync |
| `autoGenerateBill` | `boolean` | `false` | Auto-create bill on sale completion |
| `navShowLabels` | `boolean` | `true` | Show text labels on nav items |
| `navCompactMode` | `boolean` | `false` | Compact navigation mode |
| `navigationLayout` | `'bottom' \| 'sidebar'` | `'bottom'` | Navigation type |
| `navIconStyle` | `'outline' \| 'filled' \| 'rounded'` | `'outline'` | Nav icon stroke style |
| `navIconSize` | `'small' \| 'medium' \| 'large'` | `'medium'` | Nav icon dimensions |
| `navHighlightStyle` | `string` | `'background'` | Active nav indicator style |
| `navAnimation` | `string` | `'fade'` | Nav transition animation |
| `customLogo` | `string \| null` | `null` | Base64 data URL for custom logo |
| `appName` | `string` | `'Ameer Autos'` | Customizable app display name |
| `autoDeleteLogs` | `boolean` | — | Auto-cleanup old activity logs |
| `autoDeleteDays` | `string` | `'30'` | Days before auto-deleting logs |
| `notificationPrefs` | `object` | All `true` | Per-type notification enables |

### 6.6 Backup & Restore

- **Export:** Serializes all tables (parts, brands, categories, sales, activityLogs, settings) to JSON.
- **Import:** Clears all tables in a transaction, then bulk-inserts imported data. Automatically sets `demoDataCleared` flag to prevent demo data restoration.
- **Formats:** JSON (native), Excel (xlsx), CSV.
- **Validation:** Imported data is validated before restoring.
- **Encryption:** API keys are encrypted using AES-GCM (PBKDF2 key derivation) via the Web Crypto API before storage.

---

## 7. Navigation Structure

### 7.1 Layout Options

The app supports two navigation layouts, configurable in Settings:

#### Bottom Navigation (Default)
A fixed bottom bar with 5 routes:

| Icon | Label | Route |
|------|-------|-------|
| LayoutDashboard | Dashboard | `/` |
| Package | Inventory | `/inventory` |
| FileText | Bill | `/bills` |
| BarChart3 | Report | `/reports` |
| Settings | Setting | `/settings` |

Features:
- Active state highlighting (configurable: icon-only, icon+label, background pill).
- Icon style options: outline, filled, rounded.
- Icon size: small, medium, large.
- Animation: none, fade, slide.
- Labels can be shown/hidden.
- Compact mode reduces padding.

#### Sidebar Navigation
A slide-in drawer from the left:
- Same 5 routes as bottom nav.
- Full-width navigation links with icons and labels.
- Header with app logo and name.
- Close on route change, back button, Escape key, or overlay click.
- Body scroll locked when open.

### 7.2 Route Map

```
/                          → Dashboard
/inventory                 → Inventory List
/inventory/add             → Add Part
/inventory/edit/:id        → Edit Part
/inventory/:id             → Part Details
/sale                      → Record Sale (multi-item cart)
/reports                   → Analytics & Reports
/bills                     → Bill History
/bills/create              → Create New Bill
/bills/edit/:id            → Edit Existing Bill
/bills/settings            → Bill Designer Settings
/notifications             → Notification History
/activity-log              → Activity Log
/settings                  → Settings Hub
/settings/branding         → App Name & Logo
/settings/language         → Language & Localization
/settings/theme            → Theme & Appearance
/settings/typography       → Text & Icon Scaling
/settings/navigation       → Navigation Layout
/settings/autocomplete     → Smart Autocomplete Management
/settings/sync             → Google Drive Sync
/settings/backup           → Backup & Restore
/settings/notifications    → Notification Preferences
/settings/activity-log     → Activity Log Settings
/settings/crash-logs       → Error/Crash Reports
/settings/report-problem   → Report a Bug
/settings/about            → About the App
/settings/privacy          → Privacy Policy
/settings/terms            → Terms & Conditions
*                          → 404 Not Found
```

### 7.3 Back Navigation

- **Android hardware back button:** Handled via `useBackNavigation` hook using `window.popstate` events.
- **Header back arrow:** Shown on sub-pages via `<Header showBack />`.
- **Navigation guards:** Sale and bill creation pages hide the bottom nav (`hideNav`) to prevent accidental navigation.

---

## 8. Bill Generation System

### 8.1 Architecture

```
BillSettings (global defaults)
       ↓
Bill (per-invoice data + optional overrides)
       ↓
BillItem[] (line items)
       ↓
BillPreviewTemplate (React component, inline styles, 794×1123px)
       ↓
┌──────────┬──────────┐
│ Image    │ PDF      │
│ Export   │ Export   │
│ (PNG)    │ (jsPDF)  │
└──────────┴──────────┘
       ↓
Native Share / WhatsApp / Download
```

### 8.2 Bill Numbering

- Format: `AMT-XXXX` (zero-padded 4 digits).
- `lastBillNumber` counter stored in `billSettings` table.
- Incremented atomically during bill creation.
- Resettable via Settings.

### 8.3 Color Themes

Five premium palettes, each defining 17+ color tokens:

| Theme | Header BG | Accent 1 | Accent 2 |
|-------|-----------|----------|----------|
| Modern Black & Orange | `#1a1a1a` | `#E8853D` | `#C4A265` |
| Classic Teal & Gold | `#1a3a3a` | `#2A9D8F` | `#C4A265` |
| Royal Blue & Gold | `#1B2A4A` | `#3A6EA5` | `#C9A84C` |
| Burgundy & Cream | `#3D1C2B` | `#8B3A4A` | `#C4A265` |
| Forest & Bronze | `#1C2B1C` | `#4A7C59` | `#B8860B` |

### 8.4 Watermark Styles

| Style | Description |
|-------|-------------|
| Text | Repeating rotated text grid |
| Logo | Repeating logo/initials grid |
| Border Frame | Double-line border with corner accents |
| Diagonal Lines | SVG diagonal line pattern |

### 8.5 Export Pipeline

**Image Export:**
1. Render `BillPreviewTemplate` off-screen (1200ms delay for DOM paint).
2. Capture via `html-to-image` → data URL.
3. On native: Write to Capacitor `Filesystem` (Cache directory) → `Share.share()`.
4. On web: Convert to Blob → `URL.createObjectURL()` → download link.

**PDF Export:**
1. Create jsPDF instance (A4 size).
2. Add header, shop info, customer info.
3. Use `jspdf-autotable` for items table.
4. Add totals, terms, payment info, footer.
5. Save or share.

---

## 9. Android Integration

### 9.1 Capacitor Plugins

| Plugin | Package | Usage |
|--------|---------|-------|
| **Filesystem** | `@capacitor/filesystem` | Save exported images/PDFs to device storage (Cache directory) |
| **Share** | `@capacitor/share` | Native share dialog for bills, reports |
| **StatusBar** | `@capacitor/status-bar` | Transparent status bar with overlay mode for edge-to-edge rendering |

### 9.2 Status Bar Configuration

```typescript
await StatusBar.setOverlaysWebView({ overlay: true });  // Edge-to-edge
await StatusBar.setStyle({ style: Style.Dark });          // Dark icons
await StatusBar.setBackgroundColor({ color: "#00000000" }); // Transparent
```

The app manages its own safe area padding via CSS.

### 9.3 Native Share Flow

1. **Check platform:** `Capacitor.isNativePlatform()`.
2. **If native:**
   - Convert data URL to base64.
   - Write to `Filesystem.writeFile()` in Cache directory.
   - Call `Share.share({ url: fileUri })`.
3. **If web:**
   - Try Web Share API (`navigator.share()`) with `File` object.
   - Fallback: Create download link and trigger click.

### 9.4 WhatsApp Share

- On native: Write file, then `Share.share()` with the file URI (system share picker includes WhatsApp).
- On web: Download file as fallback (cannot directly target WhatsApp).

---

## 10. Settings System

The Settings page is organized into categorized sections with a searchable interface.

### 10.1 Branding
- **App Name:** Customize the display name shown in headers and navigation.
- **Logo:** Upload a custom logo image (base64 stored in settings). Shown in headers, sidebar, and bills.

### 10.2 General
- **Language & Localization:** Currency format (Rs, USD, EUR), date format, locale settings.
- **Theme & Appearance:** Light/Dark/System toggle. Advanced theme system with 6+ preset themes (Industrial Dark, Factory Light, Midnight Steel, etc.) and custom color overrides per CSS variable. Section-specific color overrides for header, sidebar, cards, and navigation.
- **Typography & Icon Size:** Global text scale slider and icon size adjustment.
- **Navigation Layout:** Switch between bottom nav and sidebar drawer. Customize icon style, size, highlight mode, animation, label visibility, and compact mode.
- **Smart Autocomplete:** Manage saved autocomplete entries for form fields (customer names, phone numbers, locations). Bulk clear or individual delete.

### 10.3 Data & Sync
- **Google Drive Auto-Sync:** Connect Google Drive API for automatic backup. Requires API key (encrypted at rest) and folder ID. Manual sync trigger with last-synced timestamp.
- **Backup & Restore:** Export all data as JSON/Excel/CSV. Import from backup file with validation. Maintains `demoDataCleared` flag to prevent demo data restoration.
- **Notifications:** Master toggle, per-type toggles (low stock, part added, part sold, backup complete, sync), critical sound enable. Navigate to dedicated notification preferences page.

### 10.4 Activity & Logs
- **Activity Log:** View all logged actions with filtering and search. Auto-delete old logs after configurable days.
- **Error Logs:** View crash reports with error codes, stack traces, and timestamps. Option to send diagnostics.

### 10.5 Help & Support
- **Report a Problem:** Bug report form sent to developer.

### 10.6 Legal & Info
- **About:** App version, feature list, technology stack.
- **Privacy Policy:** Static page describing data handling.
- **Terms & Conditions:** Static page with usage terms.

---

## 11. Future Scalability

### 11.1 Cloud Sync
The architecture is prepared for cloud integration:
- Google Drive sync is partially implemented (settings stored, manual sync simulated).
- TanStack React Query is installed for future API data fetching.
- The service layer can be extended to sync with a remote database.

### 11.2 Multi-Language Support
- Language setting infrastructure exists (`language` key in settings, Language options: English, Urdu).
- UI strings can be extracted to i18n resource files.

### 11.3 Multi-User / Multi-Shop
- The app name is customizable, suggesting future white-labeling.
- Database structure supports a single-tenant model but could be extended with shop/tenant IDs.

### 11.4 Barcode/QR Scanning
- SKU field exists on all parts — integrating a camera-based barcode scanner would enable rapid stock lookup and sale recording.

### 11.5 Supplier Management
- The Brand model could be extended to include supplier contact information, order history, and reorder points.

### 11.6 Online Payments
- Payment info fields exist on bills (bank accounts, EasyPaisa, JazzCash). Integration with payment gateways could enable invoice-to-payment flows.

### 11.7 Advanced Reporting
- Current reports are client-side computed. Moving to server-side aggregation would improve performance with large datasets.
- Custom report builder with drag-and-drop chart configuration.

### 11.8 PWA Installation
- The app can be enhanced as a Progressive Web App with service worker for true offline capability on web browsers, complementing the Capacitor native build.

---

*This document was generated by analyzing the complete Ameer Autos codebase and reflects the application state as of v1.2.0.*
