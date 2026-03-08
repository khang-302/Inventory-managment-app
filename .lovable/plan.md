

## Plan: Add About, Privacy Policy & Terms Pages + Tech Stack Info

### Overview
Create three new settings sub-pages (About, Privacy Policy, Terms & Conditions) with the user-provided content, add a "Tech Stack" section to the About page, and link them from the Settings page.

---

### New Files

**1. `src/pages/settings/About.tsx`**
- Full About page with all provided content (features list, developer info, app description)
- **Tech Stack section** showing: React, TypeScript, Vite, Tailwind CSS, shadcn/ui (Frontend); Dexie.js/IndexedDB (Local Database); Recharts (Charts); jsPDF/xlsx (Exports); Google Drive API (Optional Cloud Sync)
- Uses `AppLayout` + `Header` with back navigation
- Professional card-based layout with icons

**2. `src/pages/settings/PrivacyPolicy.tsx`**
- Privacy Policy page with all provided content
- Sections: Introduction, Data Collection & Usage, Your Rights, Contact
- Clean typography with card sections

**3. `src/pages/settings/TermsConditions.tsx`**
- Terms & Conditions page with all provided content
- Sections: Acceptance, Use of App, Data Integrity, Limitations, IP, Contact, Modifications

---

### Modified Files

**4. `src/pages/Settings.tsx`**
- Add a new "Legal & Info" card group at the bottom (before App Info footer)
- Three items: About (Info icon), Privacy Policy (Shield icon), Terms & Conditions (FileText icon)
- Include in search filtering

**5. `src/App.tsx`**
- Add three new routes:
  - `/settings/about` → About
  - `/settings/privacy` → PrivacyPolicy
  - `/settings/terms` → TermsConditions

---

### Design
- Same card-based layout as existing settings sub-pages
- Mobile-first, consistent with app's premium style
- Scrollable content with proper spacing

