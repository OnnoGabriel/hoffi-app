# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Mobile-first Vue 3 application for camera-based OCR (Optical Character Recognition) designed for extracting text and order numbers from camera images in real-time. Uses dual OCR engine strategy: native TextDetector API with Tesseract.js fallback.

**Current Branch**: `vue3` (main development)
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

### Single-Component Application

This is a minimal Vue 3 app with a single-page architecture:
- **App.vue**: Root component (simple Vuetify container wrapper)
- **OCRCamera.vue**: All core functionality in one component (~430 lines)
- **vuetify.js**: Material Design theme configuration
- **main.js**: Minimal Vue app initialization with Vuetify plugin

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

Business logic (src/components/OCRCamera.vue:316-333):
- Searches recognized text for lines containing "KD-Auftrag:"
- Extracts first token matching pattern `\d+\D` (digits followed by non-digit)
- Updates `orderNumber` ref separately from full OCR result

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

## HTTPS Requirement

Camera access requires HTTPS on mobile devices:
- Dev server configured with `host: true` for network access
- Uncomment `https: true` in vite.config.js:15 for HTTPS
- Localhost exempt from HTTPS requirement

## Vuetify Configuration

Auto-import enabled in vite.config.js:8:
```javascript
vuetify({ autoImport: true })
```

All Vuetify components available without explicit imports. Theme customization in src/plugins/vuetify.js.

## Key Technical Constraints

- **German Language**: Tesseract configured for `deu` language model
- **Mobile-First**: UI optimized for mobile viewport, responsive grid
- **Video Constraints**: Ideal width 1280px for quality/performance balance
- **Frame Processing**: Max 1024px width to optimize OCR speed
- **Live OCR Interval**: 1500ms balances responsiveness vs CPU usage

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
