# Required Assets for Production Release

This document lists all required assets for PadelBrain across all platforms.

## Base Requirements

Create these assets in the `assets/` directory:

### Core Icons
- **icon.png** - 1024x1024px - Universal app icon (high resolution)
- **splash.png** - 2048x2732px - Splash screen for all platforms
- **favicon.png** - 32x32px - Web favicon

### iOS Assets
- **ios-icon.png** - 1024x1024px - iOS App Store icon (no transparency, no rounded corners)
- **apple-touch-icon.png** - 180x180px - iOS home screen icon

### Android Assets
- **android-icon.png** - 1024x1024px - Android Play Store icon
- **adaptive-icon.png** - 1024x1024px - Android adaptive icon foreground (centered, safe area 768x768px)

### Electron Desktop Assets
- **icon.ico** - Multi-resolution Windows icon (16, 32, 48, 64, 128, 256px)
- **icon.icns** - macOS icon bundle (16, 32, 64, 128, 256, 512, 1024px @1x and @2x)
- **icon.png** - 512x512px - Linux icon

## PWA Assets (public/)

Place these in the `public/` directory:

### PWA Icons
- **pwa-64x64.png** - 64x64px
- **pwa-192x192.png** - 192x192px
- **pwa-512x512.png** - 512x512px (also used as maskable icon)
- **favicon.png** - 32x32px

### iOS Splash Screens (optional but recommended)
- **apple-splash-2048-2732.jpg** - iPad Pro 12.9" (2048x2732px)
- **apple-splash-1668-2388.jpg** - iPad Pro 11" (1668x2388px)
- **apple-splash-1536-2048.jpg** - iPad 9.7" (1536x2048px)
- **apple-splash-1125-2436.jpg** - iPhone X/XS (1125x2436px)
- **apple-splash-1242-2688.jpg** - iPhone XS Max (1242x2688px)
- **apple-splash-750-1334.jpg** - iPhone 8 (750x1334px)
- **apple-splash-828-1792.jpg** - iPhone XR (828x1792px)

## Asset Generation Tools

### Recommended Tools:
1. **Icon Generator**: https://icon.kitchen/ (all app icons from one source)
2. **PWA Asset Generator**: `npx pwa-asset-generator` (automated PWA assets)
3. **Electron Icon Maker**: Use `electron-icon-maker` npm package

### Quick Generation Commands:

```bash
# Install asset generators
npm install -g pwa-asset-generator electron-icon-maker

# Generate PWA assets from a single source icon
pwa-asset-generator assets/icon.png public --background "#3B82F6" --padding "10%"

# Generate Electron icons (requires a 1024x1024 PNG)
npx electron-icon-maker --input=assets/icon.png --output=assets

# Manual iOS Splash generation
# Use https://www.appicon.co/ or similar service
```

## Design Guidelines

### Color Scheme
- **Primary**: #3B82F6 (Blue)
- **Background**: #F8FAFC (Light Gray)
- **Accent**: #10B981 (Green)

### Logo Guidelines
- Use solid colors, avoid gradients for best cross-platform compatibility
- Ensure 20% padding for adaptive/maskable icons
- Maintain contrast against both light and dark backgrounds
- Square ratio for all primary icons (1:1)

### Splash Screen
- Use vertical orientation
- Center the logo
- Background color: #3B82F6
- Logo should be white or light colored
- Safe area: Keep important elements within central 60%

## Asset Checklist

Before building for production, verify:

- [ ] All assets are in correct directories
- [ ] Icon resolutions match requirements
- [ ] No transparency in iOS icons
- [ ] Android adaptive icon has proper safe area
- [ ] Splash screen has correct background color
- [ ] PWA icons are optimized (use ImageOptim or similar)
- [ ] Electron icons are multi-resolution
- [ ] All assets are committed to git (except if too large - use Git LFS)

## Current Asset Status

**Status**: ⚠️ Assets need to be created

### Quick Start:
1. Create a 1024x1024px PNG icon in `assets/icon.png`
2. Run: `npm run generate:assets` (if script exists)
3. Or use online tools listed above
4. Verify all assets are in place using the checklist

## File Size Recommendations

- Icons: < 200KB each
- Splash screens: < 500KB each
- Total assets: < 5MB combined

Compress all images using:
- **ImageOptim** (Mac)
- **TinyPNG** (Web)
- **pngquant** (CLI)
