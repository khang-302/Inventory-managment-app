# Ameer Autos — Android Native PRD

## Product Requirements Document

**Version:** 1.0  
**Last Updated:** March 18, 2026  
**Platform:** Android (Native)  
**Min SDK:** 26 (Android 8.0)  
**Target SDK:** 34 (Android 14)

---

## Table of Contents

1. [Product Overview](#1-product-overview)
2. [Target Users](#2-target-users)
3. [Technology Stack](#3-technology-stack)
4. [Architecture](#4-architecture)
5. [Project Structure](#5-project-structure)
6. [Database Design](#6-database-design)
7. [Navigation Structure](#7-navigation-structure)
8. [Core Modules](#8-core-modules)
9. [Bill Generation](#9-bill-generation)
10. [Background Tasks](#10-background-tasks)
11. [Error Handling & Crash Reporting](#11-error-handling--crash-reporting)
12. [Theme System](#12-theme-system)
13. [File Storage & Sharing](#13-file-storage--sharing)
14. [Notifications](#14-notifications)
15. [Settings & Preferences](#15-settings--preferences)
16. [Security](#16-security)
17. [Performance Guidelines](#17-performance-guidelines)
18. [Future Scalability](#18-future-scalability)

---

## 1. Product Overview

### 1.1 Purpose

Ameer Autos is a fully offline-first, native Android inventory and sales management application built for auto parts businesses in Pakistan. It requires zero internet connectivity, zero cloud accounts, and zero setup to function.

### 1.2 Business Goals

- Track auto parts inventory with full CRUD operations
- Record sales with automatic stock deduction and profit calculation
- Generate professional bills/invoices as images and PDFs
- Provide sales and inventory analytics with charts
- Support data backup/restore via local files
- Optional Google Drive sync (user-controlled)

### 1.3 Key Principles

| Principle     | Description                                                                 |
|---------------|-----------------------------------------------------------------------------|
| Offline-First | All data stored locally in SQLite via Room. No network required for any core feature |
| Zero Setup    | App works immediately after install. No accounts, no API keys, no configuration |
| Mobile-Optimized | Designed for budget Android phones (Samsung Galaxy A16 target device)     |
| Pakistan Market | Pakistani Rupee (Rs/₨) currency throughout. Urdu-friendly layout support   |
| AMOLED Dark   | True black (#000000) dark theme for OLED power savings                      |

---

## 2. Target Users

### 2.1 Primary User

- **Role:** Auto parts shop owner/manager in Pakistan
- **Device:** Budget Android phone (Samsung Galaxy A16, 6.7" display, 1080×2340)
- **Tech Literacy:** Basic smartphone user, comfortable with WhatsApp-style apps
- **Language:** Urdu primary, English secondary
- **Connectivity:** Unreliable internet — app must work 100% offline

### 2.2 Usage Patterns

- Opens app 10–30 times daily during business hours
- Records 5–50 sales per day
- Manages inventory of 200–5000 parts
- Generates bills after each sale
- Reviews reports weekly/monthly
- Backs up data weekly

---

## 3. Technology Stack

| Layer         | Technology               | Purpose                          |
|---------------|--------------------------|---------------------------------|
| Language      | **Kotlin**               | Primary development language    |
| UI Framework  | **Jetpack Compose**      | Declarative UI toolkit          |
| Architecture  | **MVVM**                 | ViewModel + StateFlow + Repository |
| Database      | **Room ORM** (SQLite)    | Local persistent storage        |
| Navigation    | **Navigation Component** | Single Activity architecture    |
| DI            | **Hilt**                 | Dependency injection            |
| Async         | **Kotlin Coroutines + Flow** | Asynchronous operations & reactive data |
| Charts        | **Vico Charts**          | Compose-native charting library |
| Background    | **WorkManager**          | Scheduled tasks (cleanup, notifications, sync) |
| Preferences   | **DataStore**            | Key-value settings storage      |
| Image Loading | **Coil**                 | Image loading and caching       |
| PDF           | **Android PdfDocument API** | Native PDF generation          |
| File Sharing  | **FileProvider + ShareCompat** | Secure file sharing with other apps |
| Sound         | **SoundPool**            | Notification sounds             |
| Testing       | **JUnit 5 + Espresso + Compose Test** | Unit, integration, UI tests |
| Build         | **Gradle (Kotlin DSL)**  | Build system                   |

### 3.1 Dependencies (build.gradle.kts)

```kotlin
dependencies {
    // Core
    implementation("androidx.core:core-ktx:1.12.0")
    implementation("androidx.lifecycle:lifecycle-runtime-ktx:2.7.0")
    implementation("androidx.activity:activity-compose:1.8.2")

    // Compose
    implementation(platform("androidx.compose:compose-bom:2024.02.00"))
    implementation("androidx.compose.ui:ui")
    implementation("androidx.compose.ui:ui-graphics")
    implementation("androidx.compose.ui:ui-tooling-preview")
    implementation("androidx.compose.material3:material3")
    implementation("androidx.compose.material:material-icons-extended")

    // Navigation
    implementation("androidx.navigation:navigation-compose:2.7.7")

    // Room
    implementation("androidx.room:room-runtime:2.6.1")
    implementation("androidx.room:room-ktx:2.6.1")
    kapt("androidx.room:room-compiler:2.6.1")

    // Hilt
    implementation("com.google.dagger:hilt-android:2.50")
    kapt("com.google.dagger:hilt-android-compiler:2.50")
    implementation("androidx.hilt:hilt-navigation-compose:1.2.0")

    // DataStore
    implementation("androidx.datastore:datastore-preferences:1.0.0")

    // Coroutines
    implementation("org.jetbrains.kotlinx:kotlinx-coroutines-android:1.8.0")

    // Charts (Vico)
    implementation("com.patrykandpatrick.vico:compose-m3:1.14.0")

    // Image Loading
    implementation("io.coil-kt:coil-compose:2.5.0")

    // WorkManager
    implementation("androidx.work:work-runtime-ktx:2.9.0")

    // JSON Serialization
    implementation("org.jetbrains.kotlinx:kotlinx-serialization-json:1.6.3")

    // UUID
    implementation("com.benasher44:uuid:0.8.4")

    // Excel Export
    implementation("org.apache.poi:poi-ooxml:5.2.5")

    // Testing
    testImplementation("junit:junit:4.13.2")
    androidTestImplementation("androidx.test.ext:junit:1.1.5")
    androidTestImplementation("androidx.compose.ui:ui-test-junit4")
}
```

---

## 4. Architecture

### 4.1 MVVM Pattern

```
┌─────────────────────────────────────────────────┐
│                   UI Layer                       │
│         (Jetpack Compose Screens)                │
│                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐     │
│  │Dashboard │ │Inventory │ │ RecordSale   │ ... │
│  │Screen    │ │Screen    │ │ Screen       │     │
│  └────┬─────┘ └────┬─────┘ └──────┬───────┘     │
│       │             │              │              │
├───────┼─────────────┼──────────────┼──────────────┤
│       ▼             ▼              ▼              │
│              ViewModel Layer                      │
│         (StateFlow + Events)                     │
│                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐     │
│  │Dashboard │ │Inventory │ │ Sale         │ ... │
│  │ViewModel │ │ViewModel │ │ ViewModel    │     │
│  └────┬─────┘ └────┬─────┘ └──────┬───────┘     │
│       │             │              │              │
├───────┼─────────────┼──────────────┼──────────────┤
│       ▼             ▼              ▼              │
│             Repository Layer                      │
│        (Single source of truth)                  │
│                                                  │
│  ┌──────────┐ ┌──────────┐ ┌──────────────┐     │
│  │Parts     │ │Sales     │ │ Bill         │ ... │
│  │Repository│ │Repository│ │ Repository   │     │
│  └────┬─────┘ └────┬─────┘ └──────┬───────┘     │
│       │             │              │              │
├───────┼─────────────┼──────────────┼──────────────┤
│       ▼             ▼              ▼              │
│              Data Layer                           │
│       (Room DAOs + DataStore)                    │
│                                                  │
│  ┌──────────────────────────────────────────┐    │
│  │          AmeerAutosDatabase              │    │
│  │  (SQLite via Room ORM)                   │    │
│  └──────────────────────────────────────────┘    │
└─────────────────────────────────────────────────┘
```

### 4.2 Data Flow

```
User Action → Compose UI → ViewModel (intent) → Repository → Room DAO → SQLite
                                                                   ↓
User sees ← Compose UI ← ViewModel (state) ← Repository ← Flow<List<T>>
```

### 4.3 State Management

```kotlin
// ViewModel exposes immutable state
class InventoryViewModel @Inject constructor(
    private val partsRepository: PartsRepository
) : ViewModel() {

    private val _uiState = MutableStateFlow(InventoryUiState())
    val uiState: StateFlow<InventoryUiState> = _uiState.asStateFlow()

    // Room Flow queries auto-update UI
    val parts: Flow<List<Part>> = partsRepository.getAllParts()

    sealed class UiEvent {
        data class ShowSnackbar(val message: String) : UiEvent()
        object NavigateBack : UiEvent()
    }

    private val _events = Channel<UiEvent>()
    val events = _events.receiveAsFlow()
}
```

---

## 5. Project Structure

```
com.ameerautos.app/
├── AmeerAutosApp.kt                    # Application class (Hilt entry)
├── MainActivity.kt                     # Single Activity
│
├── data/
│   ├── local/
│   │   ├── AmeerAutosDatabase.kt       # Room database
│   │   ├── dao/
│   │   │   ├── PartDao.kt
│   │   │   ├── BrandDao.kt
│   │   │   ├── CategoryDao.kt
│   │   │   ├── SaleDao.kt
│   │   │   ├── BillDao.kt
│   │   │   ├── BillItemDao.kt
│   │   │   ├── ActivityLogDao.kt
│   │   │   ├── NotificationDao.kt
│   │   │   ├── NotificationTemplateDao.kt
│   │   │   ├── CrashReportDao.kt
│   │   │   ├── BackupRecordDao.kt
│   │   │   ├── AutocompleteDao.kt
│   │   │   └── SettingsDao.kt
│   │   ├── entity/
│   │   │   ├── PartEntity.kt
│   │   │   ├── BrandEntity.kt
│   │   │   ├── CategoryEntity.kt
│   │   │   ├── SaleEntity.kt
│   │   │   ├── BillEntity.kt
│   │   │   ├── BillItemEntity.kt
│   │   │   ├── ActivityLogEntity.kt
│   │   │   ├── NotificationEntity.kt
│   │   │   ├── NotificationTemplateEntity.kt
│   │   │   ├── CrashReportEntity.kt
│   │   │   ├── BackupRecordEntity.kt
│   │   │   ├── AutocompleteEntryEntity.kt
│   │   │   └── AppSettingsEntity.kt
│   │   ├── converter/
│   │   │   ├── DateConverter.kt
│   │   │   ├── ListConverter.kt
│   │   │   └── MapConverter.kt
│   │   └── migration/
│   │       └── Migrations.kt
│   ├── datastore/
│   │   └── PreferencesManager.kt       # DataStore preferences
│   └── repository/
│       ├── PartsRepository.kt
│       ├── SalesRepository.kt
│       ├── BillRepository.kt
│       ├── BrandRepository.kt
│       ├── CategoryRepository.kt
│       ├── ActivityLogRepository.kt
│       ├── NotificationRepository.kt
│       ├── AutocompleteRepository.kt
│       ├── BackupRepository.kt
│       └── CrashReportRepository.kt
│
├── di/
│   ├── AppModule.kt                    # Hilt module (DB, DataStore)
│   └── RepositoryModule.kt            # Hilt repository bindings
│
├── domain/
│   ├── model/
│   │   ├── Part.kt                     # Domain models (clean)
│   │   ├── Sale.kt
│   │   ├── Bill.kt
│   │   ├── DashboardStats.kt
│   │   ├── ReportSummary.kt
│   │   └── ...
│   └── usecase/
│       ├── RecordSaleUseCase.kt
│       ├── GenerateBillUseCase.kt
│       ├── ExportReportUseCase.kt
│       ├── BackupDatabaseUseCase.kt
│       └── RestoreDatabaseUseCase.kt
│
├── ui/
│   ├── navigation/
│   │   ├── AppNavHost.kt               # NavHost + route definitions
│   │   ├── BottomNavBar.kt
│   │   ├── DrawerNav.kt
│   │   └── Routes.kt                  # Sealed class routes
│   ├── theme/
│   │   ├── Theme.kt                    # Material 3 theme
│   │   ├── Color.kt                    # Color definitions
│   │   ├── Type.kt                     # Typography
│   │   ├── Shape.kt                    # Shape definitions
│   │   └── ThemePresets.kt             # AMOLED, Classic, etc.
│   ├── components/
│   │   ├── common/
│   │   │   ├── AppTopBar.kt
│   │   │   ├── LoadingScreen.kt
│   │   │   ├── EmptyState.kt
│   │   │   ├── SearchBar.kt
│   │   │   ├── CurrencyText.kt
│   │   │   ├── EmergencyIndicator.kt
│   │   │   └── ConfirmDialog.kt
│   │   ├── dashboard/
│   │   │   ├── KPICard.kt
│   │   │   ├── QuickActions.kt
│   │   │   ├── WeeklySalesChart.kt
│   │   │   ├── StockHealthBar.kt
│   │   │   └── QuickSellBottomSheet.kt
│   │   ├── inventory/
│   │   │   ├── PartListItem.kt
│   │   │   ├── PartGridCard.kt
│   │   │   ├── PartForm.kt
│   │   │   ├── FilterPanel.kt
│   │   │   └── ImagePicker.kt
│   │   ├── sale/
│   │   │   ├── CartItemRow.kt
│   │   │   ├── SaleSuccessDialog.kt
│   │   │   └── PartSelector.kt
│   │   ├── bill/
│   │   │   ├── BillPreviewCanvas.kt
│   │   │   ├── BillSearchFilter.kt
│   │   │   └── BillSettingsForm.kt
│   │   └── reports/
│   │       ├── SalesTrendChart.kt
│   │       ├── TopSellingBarChart.kt
│   │       ├── InventoryPieChart.kt
│   │       ├── SalesHeatmap.kt
│   │       ├── KPIRow.kt
│   │       └── TimeRangeSelector.kt
│   └── screens/
│       ├── DashboardScreen.kt
│       ├── InventoryScreen.kt
│       ├── AddEditPartScreen.kt
│       ├── PartDetailsScreen.kt
│       ├── RecordSaleScreen.kt
│       ├── BillCreateScreen.kt
│       ├── BillHistoryScreen.kt
│       ├── BillSettingsScreen.kt
│       ├── ReportsScreen.kt
│       ├── SettingsScreen.kt
│       ├── ActivityLogScreen.kt
│       ├── NotificationHistoryScreen.kt
│       └── settings/
│           ├── ThemeAppearanceScreen.kt
│           ├── LanguageScreen.kt
│           ├── BackupRestoreScreen.kt
│           ├── NavigationLayoutScreen.kt
│           ├── GoogleDriveSyncScreen.kt
│           ├── NotificationSettingsScreen.kt
│           ├── TypographyScreen.kt
│           ├── BrandingScreen.kt
│           ├── CrashLogsScreen.kt
│           ├── AboutScreen.kt
│           ├── PrivacyPolicyScreen.kt
│           └── TermsConditionsScreen.kt
│
├── viewmodel/
│   ├── DashboardViewModel.kt
│   ├── InventoryViewModel.kt
│   ├── AddEditPartViewModel.kt
│   ├── PartDetailsViewModel.kt
│   ├── RecordSaleViewModel.kt
│   ├── BillViewModel.kt
│   ├── ReportsViewModel.kt
│   ├── SettingsViewModel.kt
│   ├── ActivityLogViewModel.kt
│   └── NotificationViewModel.kt
│
├── worker/
│   ├── NotificationWorker.kt           # Scheduled notification checks
│   ├── AutoCleanupWorker.kt            # Old log cleanup
│   ├── LowStockCheckWorker.kt          # Periodic low stock alerts
│   └── GoogleDriveSyncWorker.kt        # Optional background sync
│
├── util/
│   ├── CurrencyFormatter.kt            # Rs formatting
│   ├── DateUtils.kt                    # Date helpers
│   ├── SafeNumber.kt                   # NaN/Infinity guards
│   ├── BillRenderer.kt                 # Canvas-based bill rendering
│   ├── PdfGenerator.kt                 # PdfDocument wrapper
│   ├── ExcelExporter.kt                # Apache POI export
│   ├── CsvExporter.kt                  # CSV file generation
│   ├── BackupManager.kt                # JSON backup/restore
│   ├── EncryptionUtil.kt               # AES encryption for API keys
│   ├── FileShareUtil.kt                # FileProvider + ShareCompat
│   └── Constants.kt                    # App-wide constants
│
└── service/
    └── CrashReportService.kt           # UncaughtExceptionHandler
```

---

## 6. Database Design

### 6.1 Room Database

```kotlin
@Database(
    entities = [
        PartEntity::class,
        BrandEntity::class,
        CategoryEntity::class,
        SaleEntity::class,
        BillEntity::class,
        BillItemEntity::class,
        ActivityLogEntity::class,
        AppSettingsEntity::class,
        BackupRecordEntity::class,
        AutocompleteEntryEntity::class,
        NotificationEntity::class,
        NotificationTemplateEntity::class,
        CrashReportEntity::class,
        BillSettingsEntity::class
    ],
    version = 13,
    exportSchema = true
)
@TypeConverters(DateConverter::class, ListConverter::class, MapConverter::class)
abstract class AmeerAutosDatabase : RoomDatabase() {
    abstract fun partDao(): PartDao
    abstract fun brandDao(): BrandDao
    abstract fun categoryDao(): CategoryDao
    abstract fun saleDao(): SaleDao
    abstract fun billDao(): BillDao
    abstract fun billItemDao(): BillItemDao
    abstract fun activityLogDao(): ActivityLogDao
    abstract fun settingsDao(): SettingsDao
    abstract fun backupRecordDao(): BackupRecordDao
    abstract fun autocompleteDao(): AutocompleteDao
    abstract fun notificationDao(): NotificationDao
    abstract fun notificationTemplateDao(): NotificationTemplateDao
    abstract fun crashReportDao(): CrashReportDao
    abstract fun billSettingsDao(): BillSettingsDao
}
```

### 6.2 Entity Definitions

#### Parts

```kotlin
@Entity(
    tableName = "parts",
    indices = [
        Index("name"),
        Index("sku", unique = true),
        Index("brandId"),
        Index("categoryId"),
        Index("quantity"),
        Index("createdAt")
    ]
)
data class PartEntity(
    @PrimaryKey val id: String,
    val name: String,
    val sku: String,
    val brandId: String,
    val categoryId: String,
    val unitType: String,           // "piece", "set", "pair", "box", "custom"
    val customUnit: String?,
    val quantity: Int,
    val minStockLevel: Int,
    val buyingPrice: Double,        // Pakistani Rupees
    val sellingPrice: Double,       // Pakistani Rupees
    val location: String,
    val notes: String,
    val images: List<String>,       // TypeConverter: JSON list of base64/file paths
    val createdAt: Long,            // Epoch millis
    val updatedAt: Long
)
```

#### Brands

```kotlin
@Entity(tableName = "brands", indices = [Index("name")])
data class BrandEntity(
    @PrimaryKey val id: String,
    val name: String,
    val createdAt: Long
)
```

#### Categories

```kotlin
@Entity(tableName = "categories", indices = [Index("name")])
data class CategoryEntity(
    @PrimaryKey val id: String,
    val name: String,
    val createdAt: Long
)
```

#### Sales

```kotlin
@Entity(
    tableName = "sales",
    indices = [Index("partId"), Index("createdAt")]
)
data class SaleEntity(
    @PrimaryKey val id: String,
    val partId: String,
    val partName: String,           // Denormalized
    val partSku: String,            // Denormalized
    val quantity: Int,
    val unitPrice: Double,
    val totalAmount: Double,
    val buyingPrice: Double,
    val profit: Double,
    val customerName: String?,
    val customerPhone: String?,
    val notes: String?,
    val createdAt: Long
)
```

#### Bills

```kotlin
@Entity(
    tableName = "bills",
    indices = [Index("billNumber"), Index("createdAt")]
)
data class BillEntity(
    @PrimaryKey val id: String,
    val billNumber: String,
    val customerName: String?,
    val customerPhone: String?,
    val subtotal: Double,
    val discount: Double,
    val discountType: String,       // "percentage" | "fixed"
    val tax: Double,
    val taxType: String,
    val totalAmount: Double,
    val notes: String?,
    val status: String,             // "draft" | "final"
    val saleIds: List<String>,      // TypeConverter: JSON list
    val createdAt: Long,
    val updatedAt: Long
)
```

#### Bill Items

```kotlin
@Entity(
    tableName = "bill_items",
    indices = [Index("billId")],
    foreignKeys = [
        ForeignKey(
            entity = BillEntity::class,
            parentColumns = ["id"],
            childColumns = ["billId"],
            onDelete = ForeignKey.CASCADE
        )
    ]
)
data class BillItemEntity(
    @PrimaryKey val id: String,
    val billId: String,
    val partId: String,
    val partName: String,
    val partSku: String,
    val quantity: Int,
    val unitPrice: Double,
    val totalPrice: Double,
    val createdAt: Long
)
```

#### Bill Settings

```kotlin
@Entity(tableName = "bill_settings")
data class BillSettingsEntity(
    @PrimaryKey val id: String,
    val shopName: String,
    val shopAddress: String,
    val shopPhone: String,
    val shopEmail: String?,
    val shopLogo: String?,          // Base64 or file path
    val showLogo: Boolean,
    val showWatermark: Boolean,
    val watermarkText: String?,
    val headerNote: String?,
    val footerNote: String?,
    val termsAndConditions: String?,
    val paymentBankName: String?,
    val paymentAccountTitle: String?,
    val paymentAccountNumber: String?,
    val paymentJazzCash: String?,
    val paymentEasyPaisa: String?,
    val colorTheme: String,         // "classic", "modern-blue", etc.
    val updatedAt: Long
)
```

#### Activity Logs

```kotlin
@Entity(
    tableName = "activity_logs",
    indices = [Index("action"), Index("entityType"), Index("createdAt")]
)
data class ActivityLogEntity(
    @PrimaryKey val id: String,
    val action: String,             // "create", "update", "delete", "sale", "backup", "restore", "sync"
    val entityType: String,         // "part", "sale", "brand", "category", "settings", "backup"
    val entityId: String?,
    val description: String,
    val metadata: String?,          // JSON string
    val isDeleted: Boolean,
    val createdAt: Long
)
```

#### App Settings

```kotlin
@Entity(tableName = "settings", indices = [Index("key", unique = true)])
data class AppSettingsEntity(
    @PrimaryKey val id: String,
    val key: String,
    val value: String,              // JSON-serialized value
    val updatedAt: Long
)
```

#### Notifications

```kotlin
@Entity(
    tableName = "notifications",
    indices = [Index("type"), Index("createdAt")]
)
data class NotificationEntity(
    @PrimaryKey val id: String,
    val title: String,
    val message: String,
    val type: String,               // "lowStock", "sale", "backup", "system", "custom"
    val priority: String,           // "low", "medium", "high", "critical"
    val isRead: Boolean,
    val isFired: Boolean,
    val isSystem: Boolean,
    val scheduledAt: Long?,
    val recurringInterval: String?,
    val createdAt: Long
)
```

#### Notification Templates

```kotlin
@Entity(tableName = "notification_templates")
data class NotificationTemplateEntity(
    @PrimaryKey val id: String,
    val title: String,
    val message: String,
    val createdAt: Long
)
```

#### Autocomplete Entries

```kotlin
@Entity(
    tableName = "autocomplete_entries",
    indices = [Index("field"), Index("value")]
)
data class AutocompleteEntryEntity(
    @PrimaryKey val id: String,
    val field: String,
    val value: String,
    val linkedPhone: String?,
    val createdAt: Long
)
```

#### Crash Reports

```kotlin
@Entity(tableName = "crash_reports", indices = [Index("createdAt")])
data class CrashReportEntity(
    @PrimaryKey val id: String,
    val errorCode: String,
    val errorType: String,
    val errorMessage: String,
    val stackTrace: String,
    val currentScreen: String,
    val lastAction: String,
    val appVersion: String,
    val deviceModel: String,
    val screenResolution: String,
    val createdAt: Long,
    val isRead: Boolean
)
```

#### Backup Records

```kotlin
@Entity(
    tableName = "backup_records",
    indices = [Index("type"), Index("createdAt")]
)
data class BackupRecordEntity(
    @PrimaryKey val id: String,
    val type: String,               // "local" | "gdrive"
    val filename: String,
    val size: Long,
    val format: String,             // "json" | "csv" | "xlsx"
    val createdAt: Long
)
```

### 6.3 DAO Examples

```kotlin
@Dao
interface PartDao {
    @Query("SELECT * FROM parts ORDER BY name ASC")
    fun getAllParts(): Flow<List<PartEntity>>

    @Query("SELECT * FROM parts WHERE id = :id")
    suspend fun getPartById(id: String): PartEntity?

    @Query("SELECT * FROM parts WHERE sku = :sku")
    suspend fun getPartBySku(sku: String): PartEntity?

    @Query("SELECT * FROM parts WHERE quantity <= minStockLevel AND quantity > 0")
    fun getLowStockParts(): Flow<List<PartEntity>>

    @Query("SELECT * FROM parts WHERE quantity = 0")
    fun getOutOfStockParts(): Flow<List<PartEntity>>

    @Query("""
        SELECT * FROM parts
        WHERE (:search IS NULL OR name LIKE '%' || :search || '%' OR sku LIKE '%' || :search || '%')
        AND (:brandId IS NULL OR brandId = :brandId)
        AND (:categoryId IS NULL OR categoryId = :categoryId)
        ORDER BY name ASC
    """)
    fun getFilteredParts(
        search: String?,
        brandId: String?,
        categoryId: String?
    ): Flow<List<PartEntity>>

    @Query("SELECT COUNT(*) FROM parts")
    fun getPartCount(): Flow<Int>

    @Query("SELECT SUM(quantity * buyingPrice) FROM parts")
    fun getInventoryCostValue(): Flow<Double?>

    @Query("SELECT SUM(quantity * sellingPrice) FROM parts")
    fun getInventoryRetailValue(): Flow<Double?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(part: PartEntity)

    @Update
    suspend fun update(part: PartEntity)

    @Delete
    suspend fun delete(part: PartEntity)

    @Query("DELETE FROM parts WHERE id IN (:ids)")
    suspend fun deleteByIds(ids: List<String>)
}

@Dao
interface SaleDao {
    @Query("SELECT * FROM sales ORDER BY createdAt DESC")
    fun getAllSales(): Flow<List<SaleEntity>>

    @Query("SELECT * FROM sales WHERE createdAt >= :startOfDay ORDER BY createdAt DESC")
    fun getTodaySales(startOfDay: Long): Flow<List<SaleEntity>>

    @Query("SELECT * FROM sales WHERE createdAt BETWEEN :start AND :end ORDER BY createdAt DESC")
    fun getSalesInRange(start: Long, end: Long): Flow<List<SaleEntity>>

    @Query("SELECT * FROM sales WHERE partId = :partId ORDER BY createdAt DESC")
    fun getSalesByPart(partId: String): Flow<List<SaleEntity>>

    @Query("SELECT SUM(totalAmount) FROM sales WHERE createdAt >= :startOfDay")
    fun getTodayTotal(startOfDay: Long): Flow<Double?>

    @Query("SELECT SUM(profit) FROM sales WHERE createdAt >= :startOfDay")
    fun getTodayProfit(startOfDay: Long): Flow<Double?>

    @Query("SELECT SUM(profit) FROM sales WHERE createdAt >= :startOfMonth")
    fun getMonthlyProfit(startOfMonth: Long): Flow<Double?>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insert(sale: SaleEntity)

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertAll(sales: List<SaleEntity>)

    @Delete
    suspend fun delete(sale: SaleEntity)

    @Query("DELETE FROM sales WHERE id = :id")
    suspend fun deleteById(id: String)
}
```

### 6.4 Type Converters

```kotlin
class DateConverter {
    @TypeConverter
    fun fromTimestamp(value: Long?): Date? = value?.let { Date(it) }

    @TypeConverter
    fun dateToTimestamp(date: Date?): Long? = date?.time
}

class ListConverter {
    private val json = Json { ignoreUnknownKeys = true }

    @TypeConverter
    fun fromStringList(value: List<String>): String = json.encodeToString(value)

    @TypeConverter
    fun toStringList(value: String): List<String> =
        json.decodeFromString(value)
}

class MapConverter {
    private val json = Json { ignoreUnknownKeys = true }

    @TypeConverter
    fun fromMap(value: Map<String, String>?): String? =
        value?.let { json.encodeToString(it) }

    @TypeConverter
    fun toMap(value: String?): Map<String, String>? =
        value?.let { json.decodeFromString(it) }
}
```

### 6.5 Migrations

```kotlin
object Migrations {
    val MIGRATION_1_2 = object : Migration(1, 2) {
        override fun migrate(db: SupportSQLiteDatabase) {
            // Add bill_settings table
            db.execSQL("""
                CREATE TABLE IF NOT EXISTS bill_settings (
                    id TEXT NOT NULL PRIMARY KEY,
                    shopName TEXT NOT NULL DEFAULT 'Ameer Autos',
                    shopAddress TEXT,
                    shopPhone TEXT,
                    shopEmail TEXT,
                    shopLogo TEXT,
                    showLogo INTEGER NOT NULL DEFAULT 1,
                    showWatermark INTEGER NOT NULL DEFAULT 0,
                    watermarkText TEXT,
                    headerNote TEXT,
                    footerNote TEXT,
                    termsAndConditions TEXT,
                    paymentBankName TEXT,
                    paymentAccountTitle TEXT,
                    paymentAccountNumber TEXT,
                    paymentJazzCash TEXT,
                    paymentEasyPaisa TEXT,
                    colorTheme TEXT NOT NULL DEFAULT 'classic',
                    updatedAt INTEGER NOT NULL
                )
            """.trimIndent())
        }
    }

    // Additional migrations follow same pattern
    // Each schema change gets a sequential migration
}
```

---

## 7. Navigation Structure

### 7.1 Route Definitions

```kotlin
sealed class Screen(val route: String) {
    object Dashboard : Screen("dashboard")
    object Inventory : Screen("inventory")
    object AddPart : Screen("inventory/add")
    data class EditPart(val id: String) : Screen("inventory/edit/{id}") {
        companion object { const val ROUTE = "inventory/edit/{id}" }
    }
    data class PartDetails(val id: String) : Screen("inventory/{id}") {
        companion object { const val ROUTE = "inventory/{id}" }
    }
    object RecordSale : Screen("sale")
    object BillCreate : Screen("bill/create")
    object BillHistory : Screen("bill/history")
    object BillSettings : Screen("bill/settings")
    object Reports : Screen("reports")
    object Settings : Screen("settings")
    object ActivityLog : Screen("activity-log")
    object NotificationHistory : Screen("notifications")

    // Settings sub-screens
    object ThemeAppearance : Screen("settings/theme")
    object Language : Screen("settings/language")
    object NavigationLayout : Screen("settings/navigation")
    object BackupRestore : Screen("settings/backup")
    object GoogleDriveSync : Screen("settings/sync")
    object Notifications : Screen("settings/notifications")
    object Typography : Screen("settings/typography")
    object Branding : Screen("settings/branding")
    object CrashLogs : Screen("settings/crash-logs")
    object About : Screen("settings/about")
    object PrivacyPolicy : Screen("settings/privacy")
    object TermsConditions : Screen("settings/terms")
}
```

### 7.2 NavHost

```kotlin
@Composable
fun AppNavHost(
    navController: NavHostController,
    modifier: Modifier = Modifier
) {
    NavHost(
        navController = navController,
        startDestination = Screen.Dashboard.route,
        modifier = modifier
    ) {
        composable(Screen.Dashboard.route) {
            DashboardScreen(navController)
        }
        composable(Screen.Inventory.route) {
            InventoryScreen(navController)
        }
        composable(
            route = Screen.PartDetails.ROUTE,
            arguments = listOf(navArgument("id") { type = NavType.StringType })
        ) { backStackEntry ->
            PartDetailsScreen(
                partId = backStackEntry.arguments?.getString("id") ?: "",
                navController = navController
            )
        }
        // ... all other routes
    }
}
```

### 7.3 Bottom Navigation

```kotlin
data class BottomNavItem(
    val screen: Screen,
    val label: String,
    val icon: ImageVector,
    val selectedIcon: ImageVector
)

val bottomNavItems = listOf(
    BottomNavItem(Screen.Dashboard, "Home", Icons.Outlined.Home, Icons.Filled.Home),
    BottomNavItem(Screen.Inventory, "Inventory", Icons.Outlined.Inventory2, Icons.Filled.Inventory2),
    BottomNavItem(Screen.BillHistory, "Bills", Icons.Outlined.Receipt, Icons.Filled.Receipt),
    BottomNavItem(Screen.Reports, "Reports", Icons.Outlined.BarChart, Icons.Filled.BarChart),
    BottomNavItem(Screen.Settings, "Settings", Icons.Outlined.Settings, Icons.Filled.Settings)
)
```

### 7.4 Drawer Navigation (Alternative Layout)

Users can switch between bottom nav and drawer nav via Settings → Navigation Layout. The drawer provides the same navigation items in a side panel with the shop logo and app name in the header.

---

## 8. Core Modules

### 8.1 Dashboard

**Screen:** `DashboardScreen.kt`  
**ViewModel:** `DashboardViewModel.kt`

**Features:**
- 4 KPI cards: Total Parts, Inventory Value (Rs), Today's Sales (Rs), Today's Profit (Rs)
- Quick action buttons: Add Part, Record Sale, View Reports, Quick Sell
- Weekly sales mini area chart (last 7 days)
- Today's sales breakdown (new sales vs quick sales)
- Inventory health bar (in-stock / low-stock / out-of-stock ratio)
- Low stock alerts list with emergency indicators
- Monthly profit overview
- Recent activity log (last 10 entries)
- Quick Sell bottom sheet (ModalBottomSheet)

**Data Sources (Room Flows):**
```kotlin
class DashboardViewModel @Inject constructor(
    private val partsRepo: PartsRepository,
    private val salesRepo: SalesRepository,
    private val activityRepo: ActivityLogRepository
) : ViewModel() {

    val partCount: Flow<Int> = partsRepo.getPartCount()
    val inventoryValue: Flow<Double> = partsRepo.getInventoryCostValue()
    val todaySales: Flow<Double> = salesRepo.getTodayTotal()
    val todayProfit: Flow<Double> = salesRepo.getTodayProfit()
    val monthlyProfit: Flow<Double> = salesRepo.getMonthlyProfit()
    val lowStockParts: Flow<List<Part>> = partsRepo.getLowStockParts()
    val recentActivity: Flow<List<ActivityLog>> = activityRepo.getRecent(10)
    val weeklySales: Flow<List<WeeklySaleDay>> = salesRepo.getWeeklySales()
}
```

### 8.2 Inventory

**Screen:** `InventoryScreen.kt`  
**ViewModel:** `InventoryViewModel.kt`

**Features:**
- Search bar (name, SKU)
- Filter panel (brand, category, stock status)
- Three view modes: List, Grid, Table (persisted preference)
- Sort by: Name, SKU, Brand, Quantity, Price (persisted)
- Bulk selection with multi-delete
- Floating Action Button → Add Part
- Part cards show: image thumbnail, name, SKU, stock quantity (color-coded), selling price
- Low stock / out of stock badges with emergency indicator
- Pull-to-refresh (SwipeRefresh)

**Stock Status Enum:**
```kotlin
enum class StockStatus {
    ALL,
    IN_STOCK,       // quantity > minStockLevel
    LOW_STOCK,      // quantity <= minStockLevel && quantity > 0
    OUT_OF_STOCK    // quantity == 0
}
```

### 8.3 Add/Edit Part

**Screen:** `AddEditPartScreen.kt`  
**ViewModel:** `AddEditPartViewModel.kt`

**Form Fields:**
| Field           | Type               | Validation                  |
|-----------------|--------------------|-----------------------------|
| Part Name       | TextField          | Required, 3–100 chars        |
| SKU             | TextField          | Required, 2–50 chars, unique |
| Brand           | Dropdown + "Add New" | Required                   |
| Category        | Dropdown + "Add New" | Required                   |
| Unit Type       | Segmented buttons  | piece/set/pair/box/custom    |
| Custom Unit     | TextField          | Required if unitType = custom|
| Quantity        | Number field       | ≥ 0, integer                |
| Min Stock Level | Number field       | ≥ 0, integer                |
| Buying Price    | Number field       | > 0, Rs                    |
| Selling Price   | Number field       | > 0, Rs                    |
| Location        | TextField          | Optional                   |
| Notes           | TextField (multiline) | Optional, max 500 chars    |
| Images          | Image picker       | Up to 5, camera + gallery   |

**Image Handling:**
- Camera capture via `ActivityResultContracts.TakePicture()`
- Gallery pick via `ActivityResultContracts.GetContent()`
- Images compressed to max 500KB using `Bitmap.compress()`
- Stored as file paths in app-internal storage
- Thumbnails generated (150×150) for list views

### 8.4 Record Sale

**Screen:** `RecordSaleScreen.kt`  
**ViewModel:** `RecordSaleViewModel.kt`

**Flow:**
1. User searches/selects a part from inventory
2. Sets quantity (validated against available stock)
3. Unit price auto-filled from sellingPrice (editable)
4. Can add multiple items to cart
5. Optional: customer name + phone (autocomplete from history)
6. Tap "Complete Sale" → validates → records sale → deducts stock → logs activity
7. Optional: auto-generate bill

**Cart State:**
```kotlin
data class CartItem(
    val id: String,
    val partId: String,
    val partName: String,
    val partSku: String,
    val availableStock: Int,
    val buyingPrice: Double,
    val quantity: Int,
    val unitPrice: Double
) {
    val totalPrice: Double get() = quantity * unitPrice
    val profit: Double get() = (unitPrice - buyingPrice) * quantity
}

data class RecordSaleUiState(
    val cartItems: List<CartItem> = emptyList(),
    val customerName: String = "",
    val customerPhone: String = "",
    val notes: String = "",
    val autoGenerateBill: Boolean = true,
    val isProcessing: Boolean = false
) {
    val subtotal: Double get() = cartItems.sumOf { it.totalPrice }
    val totalProfit: Double get() = cartItems.sumOf { it.profit }
}
```

### 8.5 Bills

**Screens:** `BillCreateScreen.kt`, `BillHistoryScreen.kt`, `BillSettingsScreen.kt`  
**ViewModel:** `BillViewModel.kt`

**Bill Settings (persisted in bill_settings table):**
- Shop name, address, phone, email
- Logo (image file path)
- Show/hide logo toggle
- Watermark text + toggle
- Header/footer notes
- Terms & conditions
- Payment info (bank name, account title, account number, JazzCash, EasyPaisa)
- Color theme selection

**Bill Generation (see Section 9)**

**Bill History:**
- List of all generated bills
- Search by bill number, customer name
- Filter by date range
- Tap to preview → share/export options

### 8.6 Reports & Analytics

**Screen:** `ReportsScreen.kt`  
**ViewModel:** `ReportsViewModel.kt`

**Time Ranges:**
- Today, This Week, Last 2 Weeks, Last 3 Weeks
- This Month, Previous Month
- Last 3 Months, Last 6 Months, This Year
- Custom date range (DateRangePicker)

**KPI Summary:**
| Metric       | Calculation                      |
|--------------|---------------------------------|
| Total Sales  | Sum of sale.totalAmount in range|
| Total Profit | Sum of sale.profit in range     |
| Profit Margin| (totalProfit / totalSales) × 100|
| Items Sold   | Sum of sale.quantity in range   |
| Avg Sale Value| totalSales / salesCount         |
| Sales Count  | Count of sales in range         |

**Charts (Vico):**
- Sales Trend (Line chart)
- Profit Trend (Area chart)
- Top Selling Parts (Horizontal bar chart)
- Sales by Category (Pie/Donut chart)
- Inventory Distribution (Stacked bar chart)
- Sales Heatmap (Grid-based heat visualization)
- Orders Trend (Bar chart)
- Items Sold Over Time (Line chart)

**Sale Type Filter:**
- All Sales
- New Sales (from RecordSale screen)
- Quick Sales (from QuickSell modal)

**Export Options:**
- PDF report (Android PdfDocument)
- Excel spreadsheet (Apache POI)
- CSV file

### 8.7 Activity Log

**Screen:** `ActivityLogScreen.kt`  
**ViewModel:** `ActivityLogViewModel.kt`

**Logged Actions:**
| Action  | Entity   | Example Description                      |
|---------|----------|----------------------------------------|
| create  | part     | "Added new part: Brake Pad (BP-001)"  |
| update  | part     | "Updated part: Brake Pad (BP-001)"    |
| delete  | part     | "Deleted part: Brake Pad (BP-001)"    |
| sale    | sale     | "Sold 2× Brake Pad for Rs 2,400"      |
| backup  | backup   | "Created JSON backup: ameer_autos_2026-03-18.json" |
| restore | backup   | "Restored database from backup"        |
| sync    | settings | "Synced data to Google Drive"          |

**Features:**
- Chronological list with relative timestamps
- Filter by action type
- Search descriptions
- Soft delete (isDeleted flag)
- Auto-cleanup of logs older than 90 days (WorkManager)
- Export activity log as CSV

### 8.8 Settings

**Screen:** `SettingsScreen.kt`

**Settings Layout:**
```
┌──────────────────────────────────┐
│  ← Settings                      │
├──────────────────────────────────┤
│  🔍 Search settings...           │
├──────────────────────────────────┤
│  › Language & Localization       │
│  › Theme & Appearance            │
│  › Typography                    │
│  › Navigation Layout             │
│  › Branding (Logo & Name)        │
├──────────────────────────────────┤
│  › Google Drive Auto-Sync        │
│    Real-time backup in Excel,    │
│    Sheets & JSON                 │
│  › Backup & Restore              │
│    Advanced backup and export    │
├──────────────────────────────────┤
│  Notifications          [Toggle] │
│  › Notification Settings         │
├──────────────────────────────────┤
│  › Activity Log Settings         │
│  › Autocomplete Settings         │
│  › Crash Logs                    │
├──────────────────────────────────┤
│  › About                         │
│  › Privacy Policy                │
│  › Terms & Conditions            │
│  › Report a Problem              │
└──────────────────────────────────┘
```

---

## 9. Bill Generation

### 9.1 Bill Rendering (Canvas/Bitmap)

Bills are rendered as bitmaps using Android Canvas API for pixel-perfect control:

```kotlin
class BillRenderer(private val context: Context) {

    fun renderBill(
        bill: Bill,
        items: List<BillItem>,
        settings: BillSettings
    ): Bitmap {
        // Calculate dimensions based on content
        val width = 1080  // Standard width
        val height = calculateHeight(items.size, settings)

        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)

        // Draw background
        canvas.drawColor(Color.WHITE)

        // Draw sections
        drawHeader(canvas, settings)        // Shop name, logo, address
        drawBillInfo(canvas, bill)          // Bill number, date, customer
        drawItemsTable(canvas, items)       // Items with columns
        drawTotals(canvas, bill)            // Subtotal, discount, tax, total
        drawPaymentInfo(canvas, settings)   // Bank/JazzCash/EasyPaisa
        drawFooter(canvas, settings)        // Terms, notes, watermark

        return bitmap
    }
}
```

### 9.2 PDF Generation

```kotlin
class PdfGenerator(private val context: Context) {

    fun generateBillPdf(
        bill: Bill,
        items: List<BillItem>,
        settings: BillSettings
    ): File {
        val document = PdfDocument()
        val pageInfo = PdfDocument.PageInfo.Builder(595, 842, 1).create() // A4
        val page = document.startPage(pageInfo)

        val canvas = page.canvas
        // Draw bill content on canvas (similar to BillRenderer)
        drawBillOnCanvas(canvas, bill, items, settings)

        document.finishPage(page)

        val file = File(context.cacheDir, "${bill.billNumber}.pdf")
        FileOutputStream(file).use { document.writeTo(it) }
        document.close()

        return file
    }
}
```

### 9.3 Sharing Bills

```kotlin
class FileShareUtil(private val context: Context) {

    fun shareBillImage(bitmap: Bitmap, billNumber: String) {
        val file = saveBitmapToCache(bitmap, "$billNumber.png")
        val uri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            file
        )

        val intent = ShareCompat.IntentBuilder(context)
            .setType("image/png")
            .setStream(uri)
            .setSubject("Bill $billNumber - Ameer Autos")
            .setChooserTitle("Share Bill")
            .createChooserIntent()
            .addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION)

        context.startActivity(intent)
    }

    fun shareBillPdf(pdfFile: File, billNumber: String) {
        val uri = FileProvider.getUriForFile(
            context,
            "${context.packageName}.fileprovider",
            pdfFile
        )

        val intent = ShareCompat.IntentBuilder(context)
            .setType("application/pdf")
            .setStream(uri)
            .setSubject("Bill $billNumber - Ameer Autos")
            .createChooserIntent()

        context.startActivity(intent)
    }
}
```

---

## 10. Background Tasks

### 10.1 WorkManager Setup

```kotlin
@HiltWorker
class NotificationWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted params: WorkerParameters,
    private val notificationRepo: NotificationRepository
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val fired = notificationRepo.processScheduledNotifications()
        return if (fired >= 0) Result.success() else Result.retry()
    }
}

// Schedule in Application.onCreate()
fun schedulePeriodicWork(context: Context) {
    val workManager = WorkManager.getInstance(context)

    // Check notifications every 15 minutes
    val notificationWork = PeriodicWorkRequestBuilder<NotificationWorker>(
        15, TimeUnit.MINUTES
    ).setConstraints(
        Constraints.Builder()
            .setRequiresBatteryNotLow(true)
            .build()
    ).build()

    workManager.enqueueUniquePeriodicWork(
        "notification_check",
        ExistingPeriodicWorkPolicy.KEEP,
        notificationWork
    )

    // Auto-cleanup old logs daily
    val cleanupWork = PeriodicWorkRequestBuilder<AutoCleanupWorker>(
        1, TimeUnit.DAYS
    ).build()

    workManager.enqueueUniquePeriodicWork(
        "auto_cleanup",
        ExistingPeriodicWorkPolicy.KEEP,
        cleanupWork
    )

    // Low stock check every 6 hours
    val lowStockWork = PeriodicWorkRequestBuilder<LowStockCheckWorker>(
        6, TimeUnit.HOURS
    ).build()

    workManager.enqueueUniquePeriodicWork(
        "low_stock_check",
        ExistingPeriodicWorkPolicy.KEEP,
        lowStockWork
    )
}
```

### 10.2 Auto-Cleanup Worker

```kotlin
@HiltWorker
class AutoCleanupWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted params: WorkerParameters,
    private val activityLogRepo: ActivityLogRepository,
    private val crashReportRepo: CrashReportRepository
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val ninetyDaysAgo = System.currentTimeMillis() - (90L * 24 * 60 * 60 * 1000)

        // Delete old activity logs
        activityLogRepo.deleteOlderThan(ninetyDaysAgo)

        // Keep only last 50 crash reports
        crashReportRepo.trimToMax(50)

        return Result.success()
    }
}
```

### 10.3 Google Drive Sync Worker (Optional)

```kotlin
@HiltWorker
class GoogleDriveSyncWorker @AssistedInject constructor(
    @Assisted context: Context,
    @Assisted params: WorkerParameters,
    private val backupRepo: BackupRepository,
    private val prefsManager: PreferencesManager
) : CoroutineWorker(context, params) {

    override suspend fun doWork(): Result {
        val syncEnabled = prefsManager.isSyncEnabled.first()
        if (!syncEnabled) return Result.success()

        val apiKey = prefsManager.getSyncApiKey.first() ?: return Result.failure()
        val folderId = prefsManager.getSyncFolderId.first() ?: return Result.failure()

        return try {
            backupRepo.syncToGoogleDrive(apiKey, folderId)
            Result.success()
        } catch (e: Exception) {
            Result.retry()
        }
    }
}
```

---

## 11. Error Handling & Crash Reporting

### 11.1 Global Exception Handler

```kotlin
class CrashReportService(
    private val context: Context,
    private val crashReportDao: CrashReportDao
) : Thread.UncaughtExceptionHandler {

    private val defaultHandler = Thread.getDefaultUncaughtExceptionHandler()

    override fun uncaughtException(thread: Thread, throwable: Throwable) {
        try {
            val report = CrashReportEntity(
                id = UUID.randomUUID().toString(),
                errorCode = "CRASH_${throwable.javaClass.simpleName}",
                errorType = throwable.javaClass.name,
                errorMessage = throwable.message ?: "Unknown error",
                stackTrace = throwable.stackTraceToString(),
                currentScreen = NavigationTracker.currentScreen,
                lastAction = NavigationTracker.lastAction,
                appVersion = BuildConfig.VERSION_NAME,
                deviceModel = "${Build.MANUFACTURER} ${Build.MODEL}",
                screenResolution = getScreenResolution(),
                createdAt = System.currentTimeMillis(),
                isRead = false
            )

            // Save synchronously (we're about to crash)
            runBlocking {
                crashReportDao.insert(report)
            }
        } finally {
            defaultHandler?.uncaughtException(thread, throwable)
        }
    }
}
```

### 11.2 Crash Recovery

On app launch, check for unread crash reports and show a recovery dialog:

```kotlin
// In MainActivity.onCreate()
lifecycleScope.launch {
    val unreadCrashes = crashReportDao.getUnreadCount()
    if (unreadCrashes > 0) {
        showCrashRecoveryDialog()
    }
}
```

### 11.3 Developer Email

Crash reports can be shared via email to `zeeshankhan25102006@gmail.com` using an implicit intent with crash details formatted as the email body.

---

## 12. Theme System

### 12.1 Material 3 Theme

```kotlin
// Color.kt
object AmeerAutosColors {
    // AMOLED Dark (Default)
    val AmoledDarkColorScheme = darkColorScheme(
        primary = Color(0xFF4CAF50),              // Green accent
        onPrimary = Color.White,
        primaryContainer = Color(0xFF1B5E20),
        secondary = Color(0xFF1A1A1A),
        onSecondary = Color(0xFFFAFAFA),
        background = Color.Black,                  // True AMOLED black
        onBackground = Color(0xFFFAFAFA),
        surface = Color(0xFF0A0A0A),
        onSurface = Color(0xFFFAFAFA),
        surfaceVariant = Color(0xFF1A1A1A),
        error = Color(0xFFEF5350),
        outline = Color(0xFF262626)
    )

    // Light Theme
    val LightColorScheme = lightColorScheme(
        primary = Color(0xFF2E7D32),
        onPrimary = Color.White,
        background = Color(0xFFFAFAFA),
        surface = Color.White,
        onSurface = Color(0xFF1A1A1A),
        outline = Color(0xFFE0E0E0)
    )

    // Midnight Blue
    val MidnightBlueColorScheme = darkColorScheme(
        primary = Color(0xFF42A5F5),
        background = Color(0xFF0D1117),
        surface = Color(0xFF161B22),
        outline = Color(0xFF30363D)
    )

    // Emerald
    val EmeraldColorScheme = darkColorScheme(
        primary = Color(0xFF10B981),
        background = Color(0xFF022C22),
        surface = Color(0xFF064E3B),
        outline = Color(0xFF065F46)
    )
}
```

### 12.2 Theme Switching

```kotlin
// Theme.kt
@Composable
fun AmeerAutosTheme(
    themePreset: String = "amoled",
    darkTheme: Boolean = isSystemInDarkTheme(),
    content: @Composable () -> Unit
) {
    val colorScheme = when (themePreset) {
        "amoled" -> AmeerAutosColors.AmoledDarkColorScheme
        "light" -> AmeerAutosColors.LightColorScheme
        "midnight-blue" -> AmeerAutosColors.MidnightBlueColorScheme
        "emerald" -> AmeerAutosColors.EmeraldColorScheme
        "system" -> if (darkTheme) AmeerAutosColors.AmoledDarkColorScheme
                    else AmeerAutosColors.LightColorScheme
        else -> AmeerAutosColors.AmoledDarkColorScheme
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = AmeerAutosTypography,
        shapes = AmeerAutosShapes,
        content = content
    )
}
```

### 12.3 DataStore Preferences for Theme

```kotlin
class PreferencesManager @Inject constructor(
    @ApplicationContext private val context: Context
) {
    private val dataStore = context.dataStore

    val themePreset: Flow<String> = dataStore.data.map { prefs ->
        prefs[PreferenceKeys.THEME_PRESET] ?: "amoled"
    }

    suspend fun setThemePreset(preset: String) {
        dataStore.edit { prefs ->
            prefs[PreferenceKeys.THEME_PRESET] = preset
        }
    }

    // Navigation layout, icon style, etc. stored similarly
}
```

---

## 13. File Storage & Sharing

### 13.1 Internal Storage

All app-generated files (images, backups, exports) are stored in the app's internal storage directory:

```kotlin
// Image storage
val imageDir = File(context.filesDir, "part_images")

// Backup storage
val backupDir = File(context.filesDir, "backups")

// Export storage (temporary, in cache)
val exportDir = File(context.cacheDir, "exports")

// Bill images
val billDir = File(context.filesDir, "bills")
```

### 13.2 FileProvider Configuration

```xml
<!-- AndroidManifest.xml -->
<provider
    android:name="androidx.core.content.FileProvider"
    android:authorities="${applicationId}.fileprovider"
    android:exported="false"
    android:grantUriPermissions="true">
    <meta-data
        android:name="android.support.FILE_PROVIDER_PATHS"
        android:resource="@xml/file_paths" />
</provider>

<!-- res/xml/file_paths.xml -->
<paths>
    <files-path name="images" path="part_images/" />
    <files-path name="bills" path="bills/" />
    <files-path name="backups" path="backups/" />
    <cache-path name="exports" path="exports/" />
</paths>
```

### 13.3 Backup/Restore

**Export (JSON):**
```kotlin
suspend fun exportDatabase(): BackupData {
    return BackupData(
        parts = partDao.getAllPartsList(),
        brands = brandDao.getAllBrandsList(),
        categories = categoryDao.getAllCategoriesList(),
        sales = saleDao.getAllSalesList(),
        bills = billDao.getAllBillsList(),
        billItems = billItemDao.getAllBillItemsList(),
        activityLogs = activityLogDao.getAllLogsList(),
        settings = settingsDao.getAllSettingsList(),
        autocompleteEntries = autocompleteDao.getAllEntriesList(),
        exportedAt = System.currentTimeMillis(),
        version = DATABASE_VERSION
    )
}
```

**Import (JSON):**
```kotlin
suspend fun importDatabase(data: BackupData): Result<String> {
    return try {
        database.withTransaction {
            // Clear all tables
            partDao.deleteAll()
            brandDao.deleteAll()
            // ... clear all tables

            // Insert backup data
            data.parts?.let { partDao.insertAll(it) }
            data.brands?.let { brandDao.insertAll(it) }
            // ... insert all data
        }
        Result.success("Database restored successfully")
    } catch (e: Exception) {
        Result.failure(e)
    }
}
```

---

## 14. Notifications

### 14.1 Android Notification Channels

```kotlin
object NotificationChannels {
    const val LOW_STOCK = "low_stock"
    const val SALES = "sales"
    const val BACKUP = "backup"
    const val SYSTEM = "system"

    fun createChannels(context: Context) {
        val manager = context.getSystemService(NotificationManager::class.java)

        val channels = listOf(
            NotificationChannel(LOW_STOCK, "Low Stock Alerts", NotificationManager.IMPORTANCE_HIGH),
            NotificationChannel(SALES, "Sales", NotificationManager.IMPORTANCE_DEFAULT),
            NotificationChannel(BACKUP, "Backup", NotificationManager.IMPORTANCE_LOW),
            NotificationChannel(SYSTEM, "System", NotificationManager.IMPORTANCE_DEFAULT)
        )

        channels.forEach { manager.createNotificationChannel(it) }
    }
}
```

### 14.2 Notification Types

| Type     | Channel   | Priority | Sound          | Description               |
|----------|-----------|----------|----------------|---------------------------|
| lowStock | LOW_STOCK | High     | Critical beep  | Part stock below minimum  |
| sale     | SALES     | Default  | Standard       | Sale recorded confirmation|
| backup   | BACKUP    | Low      | None           | Backup completed          |
| system   | SYSTEM    | Default  | Standard       | General system alerts     |
| custom   | SYSTEM    | Default  | Standard       | User-created notifications|

### 14.3 In-App Notification Center

The app maintains its own notification database (separate from Android system notifications) for in-app notification history, read/unread tracking, and notification management.

---

## 15. Settings & Preferences

### 15.1 DataStore Keys

```kotlin
object PreferenceKeys {
    val THEME_PRESET = stringPreferencesKey("theme_preset")
    val NAVIGATION_LAYOUT = stringPreferencesKey("navigation_layout")
    val NAV_SHOW_LABELS = booleanPreferencesKey("nav_show_labels")
    val NAV_COMPACT_MODE = booleanPreferencesKey("nav_compact_mode")
    val NAV_ICON_STYLE = stringPreferencesKey("nav_icon_style")
    val NAV_ICON_SIZE = stringPreferencesKey("nav_icon_size")
    val NAV_HIGHLIGHT_STYLE = stringPreferencesKey("nav_highlight_style")
    val NAV_ANIMATION = stringPreferencesKey("nav_animation")
    val NOTIFICATIONS_ENABLED = booleanPreferencesKey("notifications_enabled")
    val CURRENCY_FORMAT = stringPreferencesKey("currency_format")
    val DATE_FORMAT = stringPreferencesKey("date_format")
    val LANGUAGE = stringPreferencesKey("language")
    val AUTO_GENERATE_BILL = booleanPreferencesKey("auto_generate_bill")
    val CUSTOM_LOGO = stringPreferencesKey("custom_logo")
    val APP_NAME = stringPreferencesKey("app_name")
    val FONT_FAMILY = stringPreferencesKey("font_family")
    val FONT_SCALE = floatPreferencesKey("font_scale")
    val SYNC_ENABLED = booleanPreferencesKey("sync_enabled")
    val SYNC_API_KEY = stringPreferencesKey("sync_api_key")       // AES encrypted
    val SYNC_FOLDER_ID = stringPreferencesKey("sync_folder_id")
    val LAST_SYNC_TIME = longPreferencesKey("last_sync_time")
    val INVENTORY_VIEW_MODE = stringPreferencesKey("inventory_view_mode")
    val INVENTORY_SORT_COLUMN = stringPreferencesKey("inventory_sort_column")
    val INVENTORY_SORT_DIRECTION = stringPreferencesKey("inventory_sort_direction")
}
```

---

## 16. Security

### 16.1 Data Protection

- **Local only:** All data stays on device unless user explicitly enables Google Drive sync
- **No analytics:** No tracking, telemetry, or data collection
- **API key encryption:** Google Drive API keys stored with AES encryption via Android Keystore
- **FileProvider:** All file sharing uses secure content URIs (no `file://` URIs)
- **ProGuard/R8:** Code obfuscation enabled in release builds

### 16.2 Encryption Utility

```kotlin
class EncryptionUtil {
    private val keyStore = KeyStore.getInstance("AndroidKeyStore").apply { load(null) }

    private fun getOrCreateKey(): SecretKey {
        val alias = "ameer_autos_key"
        if (keyStore.containsAlias(alias)) {
            return (keyStore.getEntry(alias, null) as KeyStore.SecretKeyEntry).secretKey
        }

        val keyGenerator = KeyGenerator.getInstance(
            KeyProperties.KEY_ALGORITHM_AES,
            "AndroidKeyStore"
        )
        keyGenerator.init(
            KeyGenParameterSpec.Builder(alias,
                KeyProperties.PURPOSE_ENCRYPT or KeyProperties.PURPOSE_DECRYPT)
                .setBlockModes(KeyProperties.BLOCK_MODE_GCM)
                .setEncryptionPaddings(KeyProperties.ENCRYPTION_PADDING_NONE)
                .build()
        )
        return keyGenerator.generateKey()
    }

    fun encrypt(plainText: String): String { /* AES-GCM encryption */ }
    fun decrypt(cipherText: String): String { /* AES-GCM decryption */ }
}
```

---

## 17. Performance Guidelines

### 17.1 Target Device

| Spec     | Samsung Galaxy A16          |
|----------|----------------------------|
| Display  | 6.7" PLS LCD, 1080 × 2340  |
| RAM      | 4 GB                       |
| Storage  | 128 GB                     |
| CPU      | MediaTek Dimensity 6300    |
| Android  | 14 (One UI 6.1)            |

### 17.2 Performance Targets

| Metric           | Target               |
|------------------|----------------------|
| Cold start       | < 1.5 seconds        |
| Screen transition| < 300ms              |
| Database query   | < 100ms for common queries |
| List scroll      | 60 fps (no jank)     |
| APK size         | < 15 MB              |
| Memory usage     | < 100 MB in normal use|
| Battery          | No background drain (WorkManager only) |

### 17.3 Optimization Strategies

- **Lazy lists:** `LazyColumn` / `LazyVerticalGrid` for all data lists
- **Room Flows:** Reactive queries instead of polling
- **Image compression:** Max 500KB per image, thumbnails for lists
- **Pagination:** Load 50 items at a time for large datasets
- **Stable keys:** Use `key = { item.id }` in all lazy lists
- **Remember/derivedStateOf:** Minimize recompositions
- **Background work:** All DB operations on `Dispatchers.IO`
- **Bitmap recycling:** Release bitmaps after bill generation

### 17.4 Touch Targets

- Minimum touch target: 48dp × 48dp (Material 3 standard)
- Spacing between interactive elements: 8–16dp
- Bottom navigation height: 80dp (with labels)
- FAB size: 56dp standard

---

## 18. Future Scalability

### 18.1 Planned Features

| Feature           | Description                          | Priority |
|-------------------|------------------------------------|----------|
| Cloud Sync        | Full cloud backup with Supabase/Firebase | Medium   |
| Multi-language    | Urdu, Sindhi, Punjabi translations | Medium   |
| Multi-shop        | Support multiple shop locations     | Low      |
| Barcode Scanner   | CameraX barcode scanning for SKU    | Medium   |
| Payment Integration | JazzCash/EasyPaisa payment tracking | Low    |
| Customer Database | Full CRM with purchase history      | Medium   |
| Supplier Management | Track suppliers and purchase orders | Low    |
| PWA Export        | Generate web version from same data models | Low  |
| Widgets           | Home screen widgets for quick stats | Low     |
| Wear OS           | Quick sale recording on smartwatch  | Very Low |

### 18.2 Architecture Readiness

The MVVM + Repository pattern supports:
- **Remote data sources:** Add `RemoteDataSource` alongside `LocalDataSource` in repositories
- **Sync engine:** Repository mediates between local and remote, with conflict resolution
- **Feature modules:** Gradle modules for each feature (`:inventory`, `:sales`, `:reports`)
- **Testing:** Every layer independently testable (Unit → Integration → UI)

---

## Appendix A: Currency Formatting

```kotlin
object CurrencyFormatter {
    fun format(amount: Double): String {
        val formatted = NumberFormat.getNumberInstance(Locale("en", "PK")).format(amount)
        return "Rs $formatted"
    }

    fun formatShort(amount: Double): String {
        return when {
            amount >= 10_000_000 -> "Rs ${String.format("%.2f", amount / 10_000_000)} Cr"
            amount >= 100_000 -> "Rs ${String.format("%.2f", amount / 100_000)} Lac"
            else -> format(amount)
        }
    }

    fun parse(value: String): Double {
        return value.replace(Regex("[^0-9.-]"), "").toDoubleOrNull() ?: 0.0
    }
}
```

## Appendix B: Safe Number Utilities

```kotlin
object SafeNumber {
    fun safe(value: Double, fallback: Double = 0.0): Double {
        return if (value.isNaN() || value.isInfinite()) fallback else value
    }

    fun safeInt(value: Int?, fallback: Int = 0): Int {
        return value ?: fallback
    }

    fun safeDivide(numerator: Double, denominator: Double, fallback: Double = 0.0): Double {
        return if (denominator == 0.0) fallback else safe(numerator / denominator, fallback)
    }

    fun safeMultiply(a: Double, b: Double): Double {
        return safe(a * b)
    }
}
```

## Appendix C: Constants

```kotlin
object Constants {
    const val APP_NAME = "Ameer Autos"
    const val APP_VERSION = "1.0.0"
    const val APP_TAGLINE = "Inventory & Sales Manager"

    const val CURRENCY_SYMBOL = "Rs"
    const val CURRENCY_CODE = "PKR"
    const val LOCALE = "en-PK"

    const val DEFAULT_MIN_STOCK_LEVEL = 5
    const val MAX_IMAGES_PER_PART = 5
    const val MAX_IMAGE_SIZE_BYTES = 500 * 1024  // 500KB
    const val THUMBNAIL_WIDTH = 150
    const val THUMBNAIL_HEIGHT = 150

    const val DEFAULT_PAGE_SIZE = 50
    const val RECENT_ACTIVITY_LIMIT = 10
    const val LOW_STOCK_THRESHOLD = 5
    const val MAX_CRASH_LOGS = 50

    const val BACKUP_FILE_PREFIX = "ameer_autos_backup"
    const val DATABASE_NAME = "AmeerAutosDB"

    const val DEVELOPER_EMAIL = "zeeshankhan25102006@gmail.com"
}
```

---

*This PRD serves as the definitive reference for building the Ameer Autos Android application. All implementation decisions should align with this document.*
