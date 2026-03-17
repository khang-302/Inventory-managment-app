

## Plan: Create Android PRD Document

Create `Android_PRD.md` in the project root, rewriting the entire application specification as a native Android app using the requested technology stack (Kotlin, Jetpack Compose, MVVM, Room, Navigation Component, WorkManager, MPAndroidChart/Vico).

### Content Structure

The PRD will map every existing feature from the current web-based PRD into Android-native equivalents:

| Web Technology | Android Equivalent |
|---|---|
| React + TypeScript | Kotlin + Jetpack Compose |
| Dexie.js (IndexedDB) | Room ORM (SQLite) |
| React Router | Navigation Component (Single Activity) |
| React Context | ViewModels + StateFlow |
| Recharts | Vico Charts / MPAndroidChart |
| Capacitor Filesystem/Share | Android FileProvider + ShareCompat |
| html-to-image | Canvas/Bitmap rendering |
| jsPDF | Android PDF APIs (PdfDocument) |
| Web Audio API (beep) | Android MediaPlayer / SoundPool |
| localStorage | DataStore Preferences |
| Dexie Live Queries | Room Flow queries |
| Tailwind CSS | Material 3 Design System |

### Document Sections

1. Product Overview (same business goals, offline-first, zero-setup)
2. Target Users (unchanged)
3. Android Technology Stack (Kotlin, Compose, MVVM, Room, etc.)
4. Architecture (Single Activity, MVVM layers, Repository pattern)
5. Database Design (Room entities, DAOs, migrations — matching all 14 tables)
6. Navigation Structure (NavHost, bottom nav, drawer)
7. Core Modules (Dashboard, Inventory, Sales, Bills, Reports, Notifications, Settings)
8. Bill Generation (Canvas/Bitmap rendering, PdfDocument, ShareCompat)
9. Background Tasks (WorkManager for notifications, auto-cleanup)
10. Error Handling (Thread.UncaughtExceptionHandler, crash DB)
11. Theme System (Material 3 dynamic colors, DataStore)
12. File Storage (Android internal/external storage, FileProvider)
13. Future Scalability

### File

| File | Action |
|---|---|
| `Android_PRD.md` | Create — full Android PRD (~800-1000 lines) |

