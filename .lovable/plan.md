## Fix: Native Android Bill Sharing with Capacitor Plugins

### Problem

The current `nativeShare.ts` uses `navigator.share()` (Web Share API). While this works in browsers, it **fails inside Capacitor Android APKs**:

- Bill images do not appear in the **gallery**.
- PDFs do not save to **Documents/AIM Bills/** reliably.
- Share sheet sometimes does not open.
- WhatsApp icon does not open WhatsApp directly.
- Temporary files are not cleaned.

This results in an **inconsistent mobile experience**, especially on real devices like Samsung Galaxy A16.

---

### Solution

Use **@capacitor/filesystem** and **@capacitor/share** plugins with **native Android intents** for file saving and sharing. Ensure files are visible in the gallery or file manager and WhatsApp sharing works directly from the app.

---

### Dependencies to Install

- `@capacitor/filesystem`
- `@capacitor/share`

---

### Changes Required

**1. Rewrite** `src/utils/nativeShare.ts`

Replace Web Share API with **Capacitor-native logic**:

- `isNativePlatform()` — Detect if running inside Capacitor (`window.Capacitor?.isNativePlatform()`).
- `saveImageToGallery(dataUrl, filename)`:
  - On native:
    - Convert dataUrl to base64.
    - Save to **Directory.ExternalStorage / Pictures / AIM Bills/**.
    - Trigger **Android media scan** so the image appears in the gallery immediately.
  - On web: fallback to blob download.
- `savePdfToDevice(pdfBlob, filename)`:
  - On native:
    - Convert blob to base64 if needed.
    - Save to **Directory.Documents / AIM Bills/**.
    - Ensure binary-safe writing for large PDFs.
  - On web: fallback to blob download.
- `shareFile(dataUrl, filename, mimeType)`:
  - On native:
    - Write temp file via Filesystem.
    - Call `Share.share({ url: fileUri })`.
    - **Delete temporary file** after sharing.
  - On web: fallback to Web Share API.
- `shareViaWhatsAppNative(dataUrl, filename)`:
  - Use native share intent targeting **WhatsApp directly** if icon tapped.
  - Ensure WhatsApp opens with bill image attached.
  - Delete temporary file after sharing.
- Helpers:
  - `blobToBase64(blob)` — converts Blob to base64 string.
  - `dataUrlToBase64(dataUrl)` — extracts base64 from data URL.

**2. Keep Function Signatures Unchanged**

- Existing functions (`saveImageToGallery`, `savePdfToDevice`, `shareViaWhatsAppNative`, `saveFile`) **do not change**.
- `BillHistory.tsx` remains fully compatible.

---

### How It Should Work on Android APK

1. **Save Image**:
  - PNG saved to `Pictures/AIM Bills/AIM_Bill_AMT-0001.png`.
  - Appears immediately in gallery.
2. **Save PDF**:
  - PDF saved to `Documents/AIM Bills/AIM_Bill_AMT-0001.pdf`.
  - Accessible in file manager.
3. **Share Bill**:
  - Opens **Android native share sheet** with all installed apps.
  - Temporary file removed after sharing.
4. **WhatsApp Share**:
  - Tapping WhatsApp icon **opens WhatsApp directly** with bill image attached.
5. **Back Navigation**:
  - Should remain consistent with app navigation stack.

---

### Post-Implementation Step

After pulling these changes, run:

```
npx cap sync
```

Then **rebuild the APK** to test on real devices.