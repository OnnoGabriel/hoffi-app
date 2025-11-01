# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**Hoffi-Store** is a Progressive Web App (PWA) for warehouse management in metal processing facilities. The app enables workers to organize components on pallets using OCR-based scanning of delivery notes (KD-Numbers) or manual entry. Built with Vue 3, Vuetify, Vue Router, and IndexedDB for offline-capable persistent storage.

**Key Features:**
- OCR scanning for KD-Numbers (dual engine: TextDetector API + Tesseract.js)
- Manual KD-Number entry fallback
- Warehouse location assignment (6 rows, 5 shelves, 3 positions per shelf)
- Search and filter by KD-Number
- Component checkout system
- Persistent local storage (IndexedDB)
- Installable as PWA on mobile devices

**Current Branch**: `add-store-functions`
**Main Branch**: `main`

## Common Commands

### Development
```bash
npm run dev          # Start dev server at localhost:3000
npm run build        # Production build to dist/
npm run preview      # Preview production build
```

### Installation
```bash
npm install
```

## Architecture

### Multi-Page Application Structure

```
src/
├── components/
│   ├── OCRCamera.vue          - OCR scanning + manual entry (tabs)
│   ├── LagerplatzAuswahl.vue  - Warehouse location selection
│   ├── BauteilSuche.vue       - Search/filter/checkout interface
│   └── PwaInstallPrompt.vue   - PWA installation prompt
├── views/
│   ├── Dashboard.vue          - Home with statistics and navigation
│   ├── ErfassenView.vue       - Capture workflow (OCR → location)
│   └── SuchenView.vue         - Search/checkout view
├── services/
│   └── database.js            - IndexedDB operations (idb wrapper)
├── router/
│   └── index.js               - Vue Router configuration
├── plugins/
│   └── vuetify.js             - Material Design theme
├── App.vue                    - Root component with router-view
└── main.js                    - App initialization
```

### Dual OCR Engine Strategy

The application implements a fallback pattern for OCR:

1. **Primary: Native TextDetector API**
   - Detected at runtime: `if ('TextDetector' in window)`
   - Near real-time performance, low resource usage
   - Available in Chrome/Edge browsers
   - Used when available via `usingTextDetector` flag

2. **Fallback: Tesseract.js**
   - German language model (`deu`)
   - Lazy-loaded on first OCR operation via `ensureTesseract()`
   - Slower but universal browser support
   - Worker instance stored in `tesseractWorker`

OCR flow (src/components/OCRCamera.vue:276-314):
```
doOCR() → captureFrame() → Try runTextDetector() → Fallback to runTesseract()
```

### Camera Stream Management

Camera initialization uses progressive fallback:
1. Try exact environment facing mode: `facingMode: { exact: 'environment' }`
2. Fallback to non-exact: `facingMode: 'environment'`
3. Store stream globally for torch control and frame capture
4. Track reference stored for flashlight/torch capability detection

Critical cleanup pattern in `onBeforeUnmount()`:
- Stop camera tracks
- Clear live OCR interval
- Terminate Tesseract worker to prevent memory leaks

### Order Number Extraction

Business logic (src/components/OCRCamera.vue):
- Searches recognized text for lines containing "KD-Auftrag:"
- Extracts first token matching pattern `\d+\D` (digits followed by non-digit)
- Updates `orderNumber` ref separately from full OCR result
- Emits `kdNummerSelected` event to parent component
- Supports manual entry as fallback (tab navigation)

### Data Persistence (IndexedDB)

**Database:** `hoffi-store-db`
**Object Store:** `bauteile`

**Schema:**
```javascript
{
  id: number (auto-increment),
  kdNummer: string,
  anzahl: number,
  reihe: number (1-6),
  fach: number (1-5),
  position: string ('links' | 'mitte' | 'rechts'),
  erfasstAm: timestamp
}
```

**Indexes:**
- `kdNummer` (non-unique) - for fast searches
- `erfasstAm` (non-unique) - for sorting by creation date

**Service Functions** (src/services/database.js):
- `addBauteil(bauteil)` - Add new component
- `getAllBauteile()` - Get all components
- `getBauteileByKdNummer(kdNummer)` - Search by KD-Number
- `getBauteileCount()` - Total component count (summed)
- `getUniqueEntriesCount()` - Number of database entries
- `updateBauteilAnzahl(id, neueAnzahl)` - Update/delete on checkout
- `clearAllBauteile()` - Reset database (dev/testing)

### Frame Capture Optimization

Uses off-screen canvas for efficiency:
- Created once at module level: `const offCanvas = document.createElement('canvas')`
- Reused for all frame captures to avoid repeated allocation
- Limits max width to 1024px to reduce OCR processing load
- Maintains aspect ratio when scaling

### Live OCR Mode

Continuous recognition implemented via interval:
- Toggle via `liveOcrEnabled` ref (watched for start/stop)
- Runs `doOCR()` every 1500ms when active
- Interval stored in `liveInterval` for cleanup
- Automatically stopped on camera stop or component unmount

## PWA Configuration

### Progressive Web App Features

The app is configured as a PWA using `vite-plugin-pwa`:

**Manifest** (auto-generated at build):
- Name: "Hoffi-Store Lagerverwaltung"
- Theme color: #1976D2 (primary blue)
- Display mode: standalone
- Orientation: portrait
- Icons: SVG with maskable variant

**Service Worker** (Workbox):
- Auto-update strategy
- Precaches all static assets (JS, CSS, HTML, fonts)
- Runtime caching for Tesseract.js CDN resources
- Offline-capable after first load

**Installation:**
- `PwaInstallPrompt.vue` component shows install banner after 3 seconds
- User can dismiss (saved to localStorage)
- Works on Android, iOS, and desktop Chrome/Edge

**Icons:**
- `/public/icons/icon.svg` - Standard app icon (512x512)
- `/public/icons/icon-maskable.svg` - Maskable icon for Android
- `/public/favicon.svg` - Browser favicon

### HTTPS Requirement

Camera access and PWA installation require HTTPS on mobile devices:
- Dev server configured with `host: true` for network access
- Uncomment `https: true` in vite.config.js for HTTPS in development
- Localhost exempt from HTTPS requirement
- Production deployment must use HTTPS

## Vuetify Configuration

Auto-import enabled in vite.config.js:8:
```javascript
vuetify({ autoImport: true })
```

All Vuetify components available without explicit imports. Theme customization in src/plugins/vuetify.js.

## Key Technical Constraints

- **German Language**: Tesseract configured for `deu` language model
- **Mobile-First**: UI optimized for mobile viewport with large touch targets
- **Video Constraints**: Ideal width 1280px for quality/performance balance
- **Frame Processing**: Max 1024px width to optimize OCR speed
- **Live OCR Interval**: 1500ms balances responsiveness vs CPU usage
- **Warehouse Structure**: Fixed 6 rows × 5 shelves × 3 positions (108 total locations)
- **UI Standards**: Minimum button height 80-100px, font size 1.3-1.5rem for inputs

## User Workflows

### 1. Capture Workflow (Dashboard → Erfassen)

1. User clicks "Bauteil erfassen" on dashboard
2. **OCRCamera component** displays:
   - Tab 1: Camera scanning with OCR
   - Tab 2: Manual KD-Number entry
3. User scans or enters KD-Number
4. Click "Weiter zur Lagerplatzvergabe"
5. **LagerplatzAuswahl component** shows:
   - Confirmed KD-Number display
   - Quantity input (+/- buttons)
   - Warehouse location selectors (Row, Shelf, Position)
6. Click "Speichern" → Saves to IndexedDB
7. Success dialog with options:
   - "Weiteres Bauteil erfassen" (reset to step 2)
   - "Zurück zum Dashboard"

### 2. Search/Checkout Workflow (Dashboard → Suchen)

1. User clicks "Bauteil suchen" on dashboard
2. **BauteilSuche component** displays:
   - All warehouse locations grouped and sorted
   - Each location shows all components (KD-Numbers + quantities)
3. User enters KD-Number in filter → Live filtering
4. Expand location to see components
5. Click "Checkout" on component:
   - Dialog shows available quantity
   - User selects quantity to remove (+/- buttons or "Alle entnehmen")
   - Confirm → Updates database (reduces quantity or deletes entry)
6. List auto-refreshes after checkout

### 3. Dashboard Statistics

- **Bauteile gesamt**: Sum of all `anzahl` values across all entries
- **Lagerplätze belegt**: Count of unique database entries
- Auto-updates when returning from other views

## Important Implementation Details

### State Management
All state in OCRCamera.vue using Vue 3 Composition API refs:
- `cameraActive`, `ocrProcessing`, `liveOcrEnabled`: UI control states
- `recognizedText`, `orderNumber`: OCR results
- `statusMessage`, `statusType`: User feedback system

Module-level variables for non-reactive state:
- `stream`, `track`: MediaStream references
- `textDetector`, `tesseractWorker`: OCR engine instances
- `usingTextDetector`, `tesseractLoaded`: Engine availability flags

### Error Handling
Status message system (src/components/OCRCamera.vue:380-393):
- Auto-dismisses success/info messages after 3 seconds
- Error/warning messages persist until manually closed
- All async operations wrapped in try-catch with user-facing error messages

### Memory Management
Critical cleanup in `onBeforeUnmount()`:
1. Stop all camera tracks: `stream.getTracks().forEach(t => t.stop())`
2. Clear live OCR interval
3. Terminate Tesseract worker: `tesseractWorker.terminate()`
4. Null out references to prevent leaks
