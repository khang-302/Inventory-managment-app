

## Plan: Add Camera + Gallery Upload Options for Part Images

Currently the image input only has one button with `capture="environment"`, which forces the camera on mobile. The user wants **two separate buttons**: one for camera capture and one for gallery/file upload.

### Changes

**File: `src/pages/AddEditPart.tsx`** (lines 424-437)

Replace the single `<label>` button with two side-by-side buttons:

1. **Camera button** — `<input type="file" accept="image/*" capture="environment">` with a `Camera` icon and "Camera" label
2. **Gallery button** — `<input type="file" accept="image/*" multiple>` (no `capture` attribute) with an `ImagePlus` icon and "Gallery" label

Both inputs share the existing `handleImageCapture` handler. Import `ImagePlus` from `lucide-react`.

The two buttons will be styled as dashed-border boxes (same size as image thumbnails) sitting side by side in the existing flex-wrap container. They only render when `images.length < 5`; if there's room for only one more image, both still show but `multiple` is effectively limited by the existing length check in `handleImageCapture`.

