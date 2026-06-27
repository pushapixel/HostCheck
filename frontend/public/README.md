# HostCheck app icons — "B · Espresso"

Master colors: roof #F0754A · body #F7E7D2 · check/dark #21130C · bg #3A2A22 → #190E09

## Web app (the usual)
1. Copy the whole `icons/` folder to your site's public root (so paths resolve at `/icons/...`).
2. Paste the contents of `HEAD-SNIPPET.html` into your <head>.
That gives you the browser-tab favicon, the iOS "Add to Home Screen" icon, and PWA install icons.

## Files
- icon.svg ............... scalable master, full-bleed square (use to regenerate any size)
- favicon.svg ........... rounded version for browser tabs
- favicon-16/32/48.png .. raster favicons
- apple-touch-icon.png .. 180px, iOS home screen
- icon-192 / icon-512 ... PWA install icons ("any")
- *-maskable.png ........ PWA adaptive icons (extra safe-zone padding) for Android
- icon-1024.png ......... App Store / Xcode asset catalog (drop into AppIcon)
- site.webmanifest ...... PWA manifest (edit name/start_url as needed)

## Native iOS (if you ship to the App Store)
Use icon-1024.png as the single 1024×1024 App Store icon in Xcode's asset catalog — Xcode/iOS generate the rest and round the corners for you. Don't pre-round it.
