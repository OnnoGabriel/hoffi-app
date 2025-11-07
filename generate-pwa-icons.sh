#!/bin/bash

# Script to generate PWA icons from favicon.svg
# Requires ImageMagick (convert command)

cd "$(dirname "$0")"

if ! command -v convert &> /dev/null; then
    echo "ImageMagick is not installed. Please install it first:"
    echo "  Ubuntu/Debian: sudo apt-get install imagemagick"
    echo "  macOS: brew install imagemagick"
    echo "  Fedora: sudo dnf install imagemagick"
    exit 1
fi

echo "Generating PWA icons from favicon.svg..."

# Generate standard icons
convert -background none public/favicon.svg -resize 192x192 public/pwa-192x192.png
convert -background none public/favicon.svg -resize 512x512 public/pwa-512x512.png

# Generate maskable icons (with padding for safe zone)
convert -background none public/favicon.svg -resize 154x154 -gravity center -extent 192x192 -background "#1976D2" -flatten public/pwa-maskable-192x192.png
convert -background none public/favicon.svg -resize 410x410 -gravity center -extent 512x512 -background "#1976D2" -flatten public/pwa-maskable-512x512.png

echo "✓ PWA icons generated successfully!"
echo "  - pwa-192x192.png"
echo "  - pwa-512x512.png"
echo "  - pwa-maskable-192x192.png"
echo "  - pwa-maskable-512x512.png"
