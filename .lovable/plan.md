

## Add FAQ Section to About Page

### What
Add a new "Frequently Asked Questions" card between the "Why Choose Us" and "Tech Stack" sections, using the existing `Accordion` component for a clean, collapsible Q&A layout.

### FAQ Content (8 questions across 3 categories)

**Offline Usage:**
1. Does this app need internet? -- No, 100% offline. Internet only needed for optional Google Drive sync.
2. What happens if my phone restarts unexpectedly? -- Crash-safe IndexedDB writes ensure no data loss.
3. Can I use this on multiple devices? -- Data is stored per device. Use Backup & Restore to transfer.

**Data Safety:**
4. Where is my data stored? -- Locally in your browser's IndexedDB. Never sent to any server.
5. Can I recover deleted items? -- Yes, soft-delete system archives all deletions for restoration.
6. How do I back up my data? -- Settings > Backup & Restore. Export as JSON, Excel, or CSV.

**Cloud Sync:**
7. Is Google Drive sync required? -- No, completely optional. You provide your own API key.
8. Is my API key safe? -- Encrypted with AES-GCM and PBKDF2 key derivation. Stored locally only.

### Design
- Card with `❓ Frequently Asked Questions` title, matching existing card style
- `Accordion` (type="single", collapsible) with each Q&A as an `AccordionItem`
- Each trigger shows a category badge (Offline / Data / Cloud) + question text
- Answers in `text-xs text-muted-foreground` with relaxed line height

### File Changes
- `src/pages/settings/About.tsx` -- Add `Accordion` imports, FAQ data array, and FAQ card section (~40 lines added)

