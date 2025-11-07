# Hoffi Store - Mobile Kamera + OCR Demo

A Vue 3 application using Vuetify for camera-based OCR (Optical Character Recognition) with support for both native TextDetector API and Tesseract.js fallback. Designed for mobile devices to extract text and order numbers from camera images in real-time.

## Features

- 📷 **Camera Access**: Use device camera with environment (rear) facing mode
- 🔍 **Text Recognition**: Extract text from camera feed using OCR
- ⚡ **Dual OCR Engine**: Native TextDetector API with Tesseract.js fallback
- 📸 **Photo Mode**: Single snapshot text recognition
- 🎥 **Video Mode**: Continuous text recognition (every 1.5s)
- 💡 **Flashlight Control**: Toggle device torch/flashlight
- 📋 **Order Number Extraction**: Automatically extract order numbers from "KD-Auftrag:" labels
- 📱 **Mobile-First**: Optimized for mobile devices with responsive UI
- 🌍 **German Language**: UI and OCR optimized for German text
- 🚀 **PWA Support**: Installable app with offline capabilities and service worker caching

## Tech Stack

- **Vue 3** (v3.4.21) - Progressive JavaScript framework with Composition API
- **Vuetify 3** (v3.5.10) - Material Design component framework
- **Vite** (v5.1.6) - Next-generation frontend build tool
- **vite-plugin-pwa** - PWA plugin with service worker and manifest generation
- **Tesseract.js** (v5.0.4) - JavaScript OCR library with German language support
- **TextDetector API** - Native browser text detection (when available)
- **@mdi/font** - Material Design Icons

## Prerequisites

- Node.js (v16 or higher)
- npm or yarn
- HTTPS connection (required for camera access on mobile devices)
- Modern browser with camera API support

## Installation

1. Clone the repository:

```bash
git clone <repository-url>
cd hoffi-app
```

2. Install dependencies:

```bash
npm install
```

## Development

Start the development server:

```bash
npm run dev
```

The app will be available at `http://localhost:3000`

### HTTPS for Mobile Testing

Camera access requires HTTPS on mobile devices. For local network testing:

1. The Vite server is configured with `host: true` to allow network access
2. Enable HTTPS in `vite.config.js` by uncommenting the `https: true` line
3. Generate SSL certificates for local development (see vite.config.js:15)

## Building for Production

Build the application for production:

```bash
npm run build
```

Preview the production build:

```bash
npm run preview
```

The production build will be output to the `dist/` directory.

## Publish on GitHub Pages

```bash
$ npm run build && git subtree push --prefix dist origin gh-pages
```

> 📖 **For detailed deployment instructions, see [DEPLOYMENT.md](DEPLOYMENT.md)**

## PWA (Progressive Web App)

This application is a fully functional Progressive Web App that can be installed on mobile devices and desktops.

> 📖 **For detailed PWA implementation documentation, see [PWA.md](PWA.md)**

### PWA Features

- **Installable**: Add to home screen on mobile devices or install as desktop app
- **Offline Support**: Service worker caches assets for offline functionality
- **Auto-Update**: Automatically updates when new versions are deployed
- **App-Like Experience**: Runs in standalone mode without browser UI
- **Fast Loading**: Cached resources load instantly

### Installing the PWA

#### On Mobile (iOS/Android)

1. Open the app in your mobile browser (Safari on iOS, Chrome on Android)
2. Look for the "Add to Home Screen" or "Install" prompt
3. **iOS Safari**: Tap the Share button → "Add to Home Screen"
4. **Android Chrome**: Tap the menu → "Add to Home Screen" or "Install App"
5. The app icon will appear on your home screen

#### On Desktop (Chrome/Edge)

1. Open the app in Chrome or Edge browser
2. Look for the install icon (⊕) in the address bar
3. Click "Install" in the prompt
4. The app will open in its own window

### PWA Configuration

The PWA is configured in `vite.config.js` with the following settings:

- **Auto-Update**: Service worker updates automatically on new deployments
- **Offline Caching**: All static assets (JS, CSS, HTML, images) are cached
- **CDN Caching**: External resources (fonts, libraries) are cached for 1 year
- **Dev Mode**: PWA features enabled in development for testing

### PWA Icons

PWA icons are generated from `public/favicon.svg`. To regenerate icons:

```bash
./generate-pwa-icons.sh
```

This creates:
- `pwa-192x192.png` - Standard icon (192x192)
- `pwa-512x512.png` - Standard icon (512x512)
- `pwa-maskable-192x192.png` - Maskable icon with safe zone (192x192)
- `pwa-maskable-512x512.png` - Maskable icon with safe zone (512x512)

**Requirements**: ImageMagick must be installed to generate icons.

### Testing PWA Locally

The PWA features are enabled in development mode:

1. Start the dev server: `npm run dev`
2. Open `http://localhost:3000` in your browser
3. Check the browser console for PWA registration messages
4. Use browser DevTools → Application → Service Workers to inspect

### Testing PWA on GitHub Pages

After deploying to GitHub Pages:

1. Visit your GitHub Pages URL (e.g., `https://yourusername.github.io/hoffi-app/`)
2. The service worker will register automatically
3. Check browser DevTools → Application → Manifest to verify PWA configuration
4. Test the install prompt on mobile or desktop

### PWA Manifest

The manifest is auto-generated with these settings:

- **Name**: Hoffi-App Lagerverwaltung
- **Short Name**: Hoffi-App
- **Theme Color**: #1976D2 (Blue)
- **Display Mode**: Standalone
- **Orientation**: Portrait (optimized for mobile)
- **Start URL**: `/hoffi-app/` (GitHub Pages compatible)

## Project Structure

```
hoffi-app/
├── public/
│   ├── favicon.svg                  # App icon (SVG)
│   ├── pwa-192x192.png              # PWA icon 192x192
│   ├── pwa-512x512.png              # PWA icon 512x512
│   ├── pwa-maskable-192x192.png     # PWA maskable icon 192x192
│   └── pwa-maskable-512x512.png     # PWA maskable icon 512x512
├── src/
│   ├── components/
│   │   └── OCRCamera.vue            # Main OCR camera component
│   ├── plugins/
│   │   └── vuetify.js               # Vuetify configuration
│   ├── App.vue                      # Root application component
│   └── main.js                      # Application entry point + PWA registration
├── index.html                       # HTML entry point with PWA meta tags
├── index-original.html              # Original vanilla JS implementation
├── vite.config.js                   # Vite + PWA configuration
├── generate-pwa-icons.sh            # Script to generate PWA icons
├── package.json                     # Dependencies and scripts
├── README.md                        # This file
├── PWA.md                           # Detailed PWA implementation guide
├── PWA-INSTALLATION.md              # German PWA installation guide for users
├── PWA-CHECKLIST.md                 # Complete testing checklist
├── PWA-IMPLEMENTATION-SUMMARY.md    # Implementation summary
├── DEPLOYMENT.md                    # Deployment instructions
└── QUICK-START.md                   # Quick reference guide
```

## Usage

### Basic Workflow

1. **Start Camera**: Click the "Start Kamera" button to activate the device camera
2. **Photo Recognition**: Click "Photo Texterkennung" to capture and analyze a single frame
3. **Video Recognition**: Toggle "Video Texterkennung" to enable continuous OCR every 1.5 seconds
4. **Flashlight**: Use "Blitzlicht an/aus" to toggle the device flashlight (if supported)
5. **Results**: Recognized text appears in the text area, and order numbers are extracted automatically

### Order Number Detection

The application automatically detects order numbers in the format:

```
KD-Auftrag: <order-number>
```

The extracted order number will appear in the "Zuletzt erkannte Nummer" field. The detection algorithm:

- Searches for lines containing "KD-Auftrag:"
- Extracts the first token after the colon that matches the pattern `\d+\D` (digits followed by non-digit)
- Displays the detected order number separately from the full text

## Camera Configuration

The application requests camera access with the following constraints:

- **facingMode**: `environment` (rear camera preferred)
- **width**: `{ ideal: 1280 }` (optimal resolution for OCR)
- **Fallback**: If exact environment mode fails, uses non-exact constraint

Frame capture is optimized to:

- Maximum width of 1024px to reduce processing load
- Maintains aspect ratio when scaling
- Uses off-screen canvas for efficient processing

## OCR Engines

### Native TextDetector API

- Faster performance (near real-time)
- Lower resource usage
- Available in Chrome/Edge browsers
- Automatic detection and fallback
- No initialization delay

### Tesseract.js

- Universal browser support
- German language model (deu)
- Initial load time (~3-5 seconds for language data)
- Works as fallback when native API unavailable
- Progress indicators during initialization

The application automatically selects the best available OCR engine and displays a status message indicating which engine is active.

## Browser Compatibility

### Full Support

- Chrome 87+ (with TextDetector API)
- Edge 87+ (with TextDetector API)
- Chrome for Android
- Safari for iOS (with Tesseract.js fallback)

### Requirements

- **Camera Access**: Requires HTTPS connection (except for localhost)
- **Torch/Flashlight**: Requires browser support for `MediaStreamTrack.applyConstraints()` with torch capability
- **getUserMedia API**: Required for camera access

### Known Limitations

- TextDetector API is experimental and may not be available in all browsers
- Torch control requires specific device hardware and browser support
- Camera permissions must be granted by the user

## Performance Considerations

### Optimization Tips

1. **Live OCR Interval**: Default 1.5 seconds provides balance between responsiveness and CPU usage
2. **Frame Resolution**: Limited to 1024px width to optimize OCR processing
3. **Video Constraints**: 1280px ideal width provides good quality without excessive bandwidth
4. **Tesseract Loading**: Language data loaded on-demand (first OCR only)

### Memory Management

- Off-screen canvas reused for all captures
- Tesseract worker properly terminated on component unmount
- Camera stream tracks stopped when camera is disabled
- Live OCR intervals cleared on disable/unmount

## Troubleshooting

### Camera Not Starting

- Ensure HTTPS connection (or localhost)
- Check browser permissions for camera access
- Verify camera is not in use by another application
- Try refreshing the page and granting permissions again

### OCR Not Working

- Ensure good lighting conditions
- Hold camera steady during capture
- Position text clearly within camera view
- Allow Tesseract.js to fully initialize (wait for "Tesseract bereit" message)

### Flashlight Not Working

- Check if device has flash capability
- Verify browser supports torch constraints
- Some browsers/devices don't expose torch control via web APIs

### Text Not Detected

- Improve lighting conditions
- Increase contrast between text and background
- Ensure text is in focus
- Try different angles or distances
- German language model works best with German text

### PWA Not Installing

- Ensure you're using HTTPS (required for service workers, except on localhost)
- Check that all PWA icons exist in the `public/` directory
- Verify the manifest is being served correctly (DevTools → Application → Manifest)
- Clear browser cache and reload the page
- On iOS, PWA installation only works in Safari (not Chrome or Firefox)

### Service Worker Issues

- Check browser console for service worker registration errors
- Use DevTools → Application → Service Workers to inspect status
- Try unregistering the service worker and reloading
- Ensure the app is served over HTTPS (GitHub Pages provides this automatically)
- Clear site data and cache if experiencing update issues

## Configuration

### Vite Server (vite.config.js)

```javascript
server: {
  port: 3000,
  host: true,  // Allow network access
  // https: true  // Uncomment for HTTPS
}
```

### Vuetify Theme (src/plugins/vuetify.js)

Customizable Material Design theme with default light mode:

- Primary: `#1976D2` (Blue)
- Success: `#4CAF50` (Green)
- Error: `#FF5252` (Red)
- Warning: `#FB8C00` (Orange)

### OCR Configuration

- **Tesseract Language**: German (`deu`)
- **Live OCR Interval**: 1500ms (1.5 seconds)
- **Frame Max Width**: 1024px
- **Video Constraints**: 1280px ideal width

## Migration Notes

This Vue 3 application is a complete rewrite of the original `index-original.html` file with the following improvements:

### Architecture Improvements

- **Component-Based Architecture**: Modular Vue components for better maintainability
- **Reactive State Management**: Vue 3 Composition API for cleaner state handling
- **Modern UI**: Vuetify Material Design components
- **Better UX**: Status messages, loading indicators, and error handling

### Technical Improvements

- **Type Safety**: Better code organization and error prevention
- **Build Optimization**: Vite for fast development and optimized production builds
- **Plugin System**: Modular Vuetify and Vue configuration
- **Auto-Import**: Vuetify components loaded on-demand

### Features Added

- Automatic order number extraction
- Status messages with auto-dismiss
- Loading indicators for OCR processing
- Better error handling and fallbacks
- Responsive Material Design UI

## API Reference

### OCRCamera Component

**Props**: None (self-contained component)

**Emits**: None

**Internal State**:

- `cameraActive`: Boolean - Camera running state
- `ocrProcessing`: Boolean - OCR operation in progress
- `liveOcrEnabled`: Boolean - Continuous OCR mode
- `recognizedText`: String - Full OCR result text
- `orderNumber`: String - Extracted order number
- `statusMessage`: String - User-facing status message
- `statusType`: String - Message type: 'info' | 'success' | 'warning' | 'error'

**Key Methods**:

- `startCamera()`: Initialize camera stream
- `stopCamera()`: Stop camera and cleanup
- `doOCR()`: Perform single OCR operation
- `toggleTorch()`: Toggle device flashlight
- `analyzeText(text)`: Extract order number from OCR result

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Git Branch

- Current development branch: `vue3`
- Main branch: `main`

## License

MIT

## Acknowledgments

- Tesseract.js for OCR capabilities
- Vue.js team for the excellent framework
- Vuetify for Material Design components
- The open-source community
