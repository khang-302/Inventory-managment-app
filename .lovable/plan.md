

## Plan: Add Version Changelog to About Page

### Testing Results
All three pages verified end-to-end:
- **About**: Renders correctly with features, tech stack, developer info. Back button works.
- **Privacy Policy**: All sections render. Back navigation works.
- **Terms & Conditions**: All sections render. Back navigation works.

No issues found.

---

### Changelog Implementation

**File:** `src/pages/settings/About.tsx`

Add a "Version History" card between the "Why Choose" card and the end of the page. Uses a timeline-style layout with version badges.

**Changelog data:**
```tsx
const changelog = [
  {
    version: '1.2.0',
    date: 'March 2026',
    changes: [
      'Added About, Privacy Policy & Terms pages',
      'Version changelog section',
      'Settings persistence across restarts',
      'Error boundary for crash protection',
    ],
  },
  {
    version: '1.1.0',
    date: 'February 2026',
    changes: [
      'Professional Bill Generator with PDF/image export',
      'Bulk actions for inventory table view',
      'Google Drive auto-sync',
      'Advanced theme & typography controls',
    ],
  },
  {
    version: '1.0.0',
    date: 'January 2026',
    changes: [
      'Initial release',
      'Inventory management with CRUD operations',
      'Sales recording & profit tracking',
      'Reports & analytics with charts',
      'Offline-first architecture with Dexie.js',
    ],
  },
];
```

**UI:** Each version shown as a card row with a colored version badge, date subtitle, and bullet list of changes. Import `History` icon from lucide-react for the section header.

**Changes:**
| File | Change |
|------|--------|
| `src/pages/settings/About.tsx` | Add changelog data array and "Version History" card section |

