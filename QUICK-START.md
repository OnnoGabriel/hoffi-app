# Quick Start Guide - Hoffi-App PWA

## For Developers

### First Time Setup

```bash
# Clone and install
git clone <repository-url>
cd hoffi-app
npm install

# Generate PWA icons
./generate-pwa-icons.sh

# Start development
npm run dev
```

Visit: http://localhost:3000

### Deploy to GitHub Pages

```bash
# Build and deploy
npm run build
git subtree push --prefix dist origin gh-pages
```

Visit: https://yourusername.github.io/hoffi-app/

## For End Users

### Install on Mobile

**Android (Chrome):**
1. Open app in Chrome
2. Tap "Install" banner
3. Open from home screen

**iOS (Safari):**
1. Open app in Safari
2. Tap Share → "Add to Home Screen"
3. Open from home screen

### Install on Desktop

**Chrome/Edge:**
1. Click install icon (⊕) in address bar
2. Click "Install"
3. Open from app list

## Key Features

✅ **Works Offline** - After first load  
✅ **Auto-Updates** - No manual updates needed  
✅ **Fast Loading** - Cached for instant access  
✅ **Camera OCR** - Text recognition from camera  
✅ **Installable** - Like a native app  

## Troubleshooting

**Install option not showing?**
- Use HTTPS (GitHub Pages provides this)
- Try Chrome or Edge browser
- Check if already installed

**Not working offline?**
- Open app once while online
- Wait for full load
- Check service worker in DevTools

**Updates not appearing?**
- Close app completely
- Reopen app
- Updates download automatically

## Documentation

- **Full README:** [README.md](README.md)
- **PWA Details:** [PWA.md](PWA.md)
- **Deployment:** [DEPLOYMENT.md](DEPLOYMENT.md)
- **German Guide:** [PWA-INSTALLATION.md](PWA-INSTALLATION.md)

## Support

Check browser console (F12) for errors or contact administrator.
