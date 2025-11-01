# PWA Installation Guide - Hoffi-Store

## Was ist eine PWA?

Hoffi-Store ist jetzt eine **Progressive Web App (PWA)**. Das bedeutet, Sie können die App wie eine native App auf Ihrem Smartphone installieren:

- Funktioniert ohne App Store
- Startet wie eine native App vom Home Screen
- Funktioniert auch offline (nach dem ersten Laden)
- Automatische Updates beim nächsten Start
- Nutzt weniger Speicherplatz als native Apps

## Installation auf Android (Chrome/Edge)

1. Öffnen Sie die Hoffi-Store-Webseite in Chrome oder Edge
2. Nach 3 Sekunden erscheint ein Banner mit "App installieren"
3. Tippen Sie auf **"Installieren"**
4. Alternativ: Menü (⋮) → "Zum Startbildschirm hinzufügen" oder "App installieren"
5. Die App wird auf Ihrem Home Screen angezeigt
6. Tippen Sie auf das Icon zum Starten

## Installation auf iOS (Safari)

1. Öffnen Sie die Hoffi-Store-Webseite in Safari
2. Tippen Sie auf das **Teilen-Symbol** (Quadrat mit Pfeil nach oben)
3. Scrollen Sie nach unten und wählen Sie **"Zum Home-Bildschirm"**
4. Geben Sie einen Namen ein (z.B. "Hoffi-Store")
5. Tippen Sie auf **"Hinzufügen"**
6. Die App wird auf Ihrem Home Screen angezeigt
7. Tippen Sie auf das Icon zum Starten

## Installation auf Desktop (Chrome/Edge)

1. Öffnen Sie die Hoffi-Store-Webseite in Chrome oder Edge
2. Suchen Sie nach dem **Install-Symbol** (⊕) in der Adressleiste
3. Klicken Sie darauf und bestätigen Sie mit "Installieren"
4. Die App öffnet sich in einem eigenen Fenster
5. Sie finden die App nun in Ihrer App-Liste/Startmenü

## Vorteile der installierten PWA

### Schneller Zugriff
- App startet direkt vom Home Screen
- Kein Browser-UI (Adressleiste etc.)
- Voller Bildschirm für bessere Übersicht

### Offline-Funktionalität
- App funktioniert ohne Internetverbindung
- Daten werden lokal in IndexedDB gespeichert
- OCR-Engine wird gecacht

### Bessere Performance
- Schnellere Ladezeiten durch Caching
- App-Ressourcen werden lokal gespeichert
- Automatische Updates im Hintergrund

### Native App-Gefühl
- Eigenes Icon auf dem Home Screen
- Vollbildmodus ohne Browser-Chrome
- Systembenachrichtigungen möglich (zukünftig)

## Deinstallation

### Android
1. Halten Sie das App-Icon gedrückt
2. Wählen Sie "Deinstallieren" oder "Entfernen"

### iOS
1. Halten Sie das App-Icon gedrückt
2. Tippen Sie auf "App entfernen"
3. Bestätigen Sie mit "Vom Home-Bildschirm entfernen"

### Desktop
1. Öffnen Sie die installierte App
2. Menü (⋮) → "Hoffi-Store deinstallieren"
3. Bestätigen Sie die Deinstallation

## Technische Details

- **Manifest**: `/manifest.webmanifest` (automatisch generiert)
- **Service Worker**: Workbox-basiert, Auto-Update-Strategie
- **Offline-Cache**: Alle statischen Assets + Tesseract.js
- **Icons**: SVG-basiert (512x512) mit maskable Variante
- **Theme Color**: #1976D2 (Primary Blue)

## Troubleshooting

### "Installieren"-Option wird nicht angezeigt

**Mögliche Ursachen:**
- Die Seite muss über HTTPS geladen werden
- Die App ist bereits installiert
- Browser unterstützt keine PWAs (z.B. Firefox iOS)

**Lösung:**
- Prüfen Sie, ob die URL mit `https://` beginnt
- Versuchen Sie Chrome/Edge statt anderem Browser
- Deinstallieren Sie die App, falls bereits installiert

### App funktioniert offline nicht

**Lösung:**
- Öffnen Sie die App einmal online komplett
- Service Worker muss Assets cachen (dauert beim ersten Laden)
- Prüfen Sie in den Entwicklertools: Application → Service Workers

### Updates werden nicht angezeigt

**Lösung:**
- Schließen Sie die App komplett
- Öffnen Sie die App neu
- Service Worker lädt Updates automatisch beim Start
- Bei Problemen: App deinstallieren und neu installieren

## Support

Bei Problemen mit der PWA-Installation:
1. Prüfen Sie die Browser-Konsole auf Fehler (F12)
2. Löschen Sie den Browser-Cache
3. Versuchen Sie einen anderen Browser
4. Kontaktieren Sie den Administrator
