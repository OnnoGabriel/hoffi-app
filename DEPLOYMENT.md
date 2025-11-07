# Deployment Guide

Quick reference for deploying Hoffi-App with PWA support.

## Prerequisites

- Node.js 16+ installed
- Git repository configured
- GitHub Pages enabled on your repository

## Local Development

### First Time Setup

```bash
# Install dependencies
npm install

# Generate PWA icons (requires ImageMagick)
./generate-pwa-icons.sh

# Start development server
npm run dev
```

The app will be available at `http://localhost:3000`

### Development with PWA

PWA features are enabled in development mode:
- Service worker registers automatically
- Manifest is available at `/manifest.webmanifest`
- Check DevTools → Application to inspect PWA

### HTTPS for Mobile Testing

Camera access requires HTTPS on mobile devices:

1. Uncomment `https: true` in `vite.config.js`
2. Generate SSL certificates (see vite.config.js comments)
3. Access via `https://your-local-ip:3000`

## Building for Production

```bash
# Build the application
npm run build
```

This generates:
- Optimized production files in `dist/`
- Service worker (`dist/sw.js`)
- Web app manifest (`dist/manifest.webmanifest`)
- All PWA icons

### Preview Production Build

```bash
npm run preview
```

Opens the production build at `http://localhost:4173`

## Deploying to GitHub Pages

### Initial Setup

1. Ensure `base: "/hoffi-app/"` in `vite.config.js` matches your repo name
2. Create `gh-pages` branch if it doesn't exist:

```bash
git checkout -b gh-pages
git push origin gh-pages
git checkout main  # or your main branch
```

### Deploy

```bash
# Build and deploy in one command
npm run build && git subtree push --prefix dist origin gh-pages
```

### Alternative: Manual Deploy

```bash
# Build the app
npm run build

# Deploy dist folder to gh-pages branch
git subtree push --prefix dist origin gh-pages
```

### Verify Deployment

1. Go to your repository settings → Pages
2. Ensure source is set to `gh-pages` branch, `/ (root)` folder
3. Visit `https://yourusername.github.io/hoffi-app/`
4. Check browser console for PWA registration

## Post-Deployment Verification

### Check PWA Installation

1. Open the deployed URL in Chrome/Edge
2. Look for install icon (⊕) in address bar
3. On mobile, check for "Add to Home Screen" prompt

### Verify Service Worker

1. Open DevTools → Application → Service Workers
2. Verify service worker is registered and activated
3. Check "Offline" checkbox and reload to test offline mode

### Verify Manifest

1. Open DevTools → Application → Manifest
2. Verify all icons are loaded correctly
3. Check theme color and display mode

### Test on Mobile

1. Open URL on mobile device (iOS Safari or Android Chrome)
2. Add to home screen
3. Open installed app
4. Verify camera and OCR functionality

## Troubleshooting

### Build Fails

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
npm run build
```

### PWA Icons Missing

```bash
# Regenerate icons
./generate-pwa-icons.sh

# Or manually copy icons to public/
cp path/to/icons/*.png public/
```

### Service Worker Not Registering

1. Ensure HTTPS (GitHub Pages provides this)
2. Clear browser cache
3. Check browser console for errors
4. Verify `dist/sw.js` exists after build

### GitHub Pages Not Updating

1. Wait 2-5 minutes for GitHub Pages to rebuild
2. Clear browser cache
3. Check GitHub Actions for build status
4. Force refresh with Ctrl+Shift+R

### Base URL Issues

If app doesn't load on GitHub Pages:

1. Verify `base` in `vite.config.js` matches repo name
2. Check manifest `scope` and `start_url` match base
3. Rebuild and redeploy

## Environment-Specific Configuration

### Local Development

- Base URL: `/`
- HTTPS: Optional (required for mobile camera)
- Service Worker: Enabled for testing

### GitHub Pages

- Base URL: `/hoffi-app/` (or your repo name)
- HTTPS: Automatic
- Service Worker: Fully functional

## Updating the App

### Regular Updates

```bash
# Make your changes
git add .
git commit -m "Your changes"
git push origin main

# Build and deploy
npm run build
git subtree push --prefix dist origin gh-pages
```

### PWA Auto-Update

The service worker is configured with `registerType: "autoUpdate"`:

1. Users with installed app will download updates in background
2. Updates activate on next app launch
3. No user action required

### Force Update

To force users to update immediately:

1. Change `registerType` to `"prompt"` in `vite.config.js`
2. Implement update UI in your app
3. Call `updateSW()` when user confirms

## Performance Optimization

### Reduce Bundle Size

The build shows chunk size warnings. To optimize:

```javascript
// In vite.config.js
build: {
  rollupOptions: {
    output: {
      manualChunks: {
        'vendor': ['vue', 'vuetify'],
        'ocr': ['tesseract.js']
      }
    }
  }
}
```

### Optimize Images

```bash
# Install image optimization
npm install -D vite-plugin-imagemin

# Configure in vite.config.js
```

## Monitoring

### Check PWA Score

Use Lighthouse in Chrome DevTools:

1. Open DevTools → Lighthouse
2. Select "Progressive Web App"
3. Run audit
4. Aim for 100% PWA score

### Analytics

To add analytics to your PWA:

1. Add Google Analytics or similar
2. Track install events
3. Monitor offline usage
4. Track service worker updates

## Backup and Recovery

### Backup Before Deploy

```bash
# Tag current version
git tag -a v1.0.0 -m "Release 1.0.0"
git push origin v1.0.0
```

### Rollback

```bash
# Checkout previous version
git checkout v1.0.0

# Rebuild and deploy
npm run build
git subtree push --prefix dist origin gh-pages --force
```

## Resources

- [Vite Documentation](https://vitejs.dev/)
- [vite-plugin-pwa](https://vite-pwa-org.netlify.app/)
- [GitHub Pages Documentation](https://docs.github.com/en/pages)
- [PWA Checklist](https://web.dev/pwa-checklist/)
