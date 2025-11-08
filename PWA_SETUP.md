# PWA Setup Guide for PadelBrain

This document explains the Progressive Web App (PWA) implementation for PadelBrain and how to test and deploy it.

## What's Been Configured

### 1. Service Worker (`public/sw.js`)
- **Caching Strategy**: Cache-first for static assets, network-first for API calls
- **Version**: v1.0.1 with runtime cache
- **Precached Assets**:
  - HTML, manifest, icons (64x64, 192x192, 512x512)
  - SVG and PNG favicons
- **Offline Support**: Falls back to cache when network unavailable
- **Auto-Update**: Automatically updates cache when new version deployed

### 2. Web App Manifest (`public/manifest.json`)
- **Display Mode**: Standalone (looks like native app)
- **Theme Colors**: Blue theme (#3B82F6) with light background (#F8FAFC)
- **Icons**: Multiple sizes with maskable support for Android
- **Shortcuts**: Quick actions for "Nuevo Partido" and "Nuevo Entrenamiento"
- **Categories**: Sports, productivity, health

### 3. HTML Configuration (`public/index.html`)
- **PWA Meta Tags**: Full iOS and Android support
- **Apple Touch Icons**: Multiple sizes for iOS home screen
- **Service Worker Registration**: Auto-registers on HTTPS or localhost
- **Splash Screen**: Custom loading screen with PadelBrain branding
- **Update Detection**: Notifies when new version available

### 4. Install Prompt Component (`src/components/common/PWAInstallPrompt.tsx`)
- **Smart Detection**: Only shows when installable and not already installed
- **Session Memory**: Respects user dismissal during session
- **Custom UI**: Branded install prompt in Spanish
- **Platform Support**: Web only (hidden on mobile)

## Testing the PWA

### Local Development

1. **Start the development server:**
   ```bash
   npm run web
   ```

2. **Open in browser:**
   - Navigate to `http://localhost:8081` (or the port shown)
   - Open Chrome DevTools (F12)

3. **Check Service Worker:**
   - Go to Application tab → Service Workers
   - Verify "padelbrain" worker is active
   - Check Console for `[SW]` messages

4. **Check Manifest:**
   - Go to Application tab → Manifest
   - Verify all icons load correctly
   - Check theme colors and display mode

5. **Test Install:**
   - Look for install button in address bar (Chrome/Edge)
   - Or use the custom install prompt that appears
   - Install and verify it opens in standalone mode

6. **Test Offline:**
   - Go to Application tab → Service Workers
   - Check "Offline" mode
   - Refresh the page - should load from cache
   - Navigate between tabs - should work

### Production Build

1. **Build the web version:**
   ```bash
   npm run build:web
   ```

2. **Test production build locally:**
   ```bash
   # Serve the dist folder with a static server
   npx serve dist -s -p 3000
   ```

3. **Verify with Lighthouse:**
   - Open Chrome DevTools
   - Go to Lighthouse tab
   - Run PWA audit
   - Should score 100% on PWA criteria

## PWA Checklist

✅ **Installability**
- [x] Web app manifest present
- [x] Service worker registered
- [x] HTTPS (required for production)
- [x] Icons in multiple sizes
- [x] Start URL defined

✅ **Offline Functionality**
- [x] Service worker caches assets
- [x] Fallback for offline access
- [x] Cache-first strategy for static resources

✅ **App-like Experience**
- [x] Standalone display mode
- [x] Themed splash screen
- [x] Theme color for browser UI
- [x] No address bar in standalone mode

✅ **iOS Support**
- [x] Apple touch icons
- [x] Apple mobile web app capable
- [x] Status bar style configured
- [x] Touch icon for home screen

✅ **Android Support**
- [x] Maskable icons for adaptive icons
- [x] Theme colors
- [x] Shortcuts for quick actions

## Deployment Requirements

### HTTPS Required
Service workers require HTTPS in production. Development on localhost is allowed.

**Options:**
1. **Netlify/Vercel** (Automatic HTTPS):
   ```bash
   # Build first
   npm run build:web

   # Deploy dist folder
   # Netlify: netlify deploy --dir=dist --prod
   # Vercel: vercel --prod
   ```

2. **Firebase Hosting**:
   ```bash
   npm run build:web
   firebase deploy --only hosting
   ```

3. **GitHub Pages** (with custom domain for HTTPS):
   ```bash
   npm run build:web
   # Push dist folder to gh-pages branch
   ```

### Update Process

When you deploy a new version:

1. Update `CACHE_NAME` in `public/sw.js`:
   ```javascript
   const CACHE_NAME = 'padelbrain-v1.0.2'; // Increment version
   ```

2. Build and deploy:
   ```bash
   npm run build:web
   # Deploy to your hosting
   ```

3. Users will automatically get the update on next visit
4. Old caches are automatically cleaned up

## Browser Support

### Full PWA Support
- ✅ Chrome/Edge (Desktop & Mobile)
- ✅ Samsung Internet
- ✅ Firefox (Android)

### Partial Support (Add to Home Screen)
- ⚠️ Safari (iOS) - No install prompt, manual "Add to Home Screen"
- ⚠️ Firefox (Desktop) - No install prompt

### Testing on iOS

1. Open Safari on iPhone/iPad
2. Navigate to your deployed PWA
3. Tap Share button
4. Select "Add to Home Screen"
5. Icon and app will be added to home screen
6. Opens in full-screen mode (no Safari UI)

## Troubleshooting

### Service Worker Not Registering
- Check browser console for errors
- Verify `public/sw.js` exists and is accessible
- Ensure you're on HTTPS or localhost
- Try hard refresh: Ctrl+Shift+R (or Cmd+Shift+R on Mac)

### Icons Not Showing
- Verify icons exist in `public/` folder:
  - `pwa-64x64.png`
  - `pwa-192x192.png`
  - `pwa-512x512.png`
  - `pwa-512x512-maskable.png`
- Check browser console for 404 errors
- Verify manifest.json icon paths are correct

### Install Prompt Not Appearing
- Check if already installed (standalone mode)
- Verify manifest and service worker are valid
- Try in Chrome/Edge (best support)
- Check if dismissed in current session

### Cache Not Updating
- Increment CACHE_NAME in sw.js
- Clear browser cache manually
- Unregister service worker in DevTools
- Use "Update on reload" in DevTools during development

## Performance Optimization

The PWA is configured for optimal performance:

- **Precaching**: Critical assets cached on install
- **Runtime Caching**: Dynamic content cached on first request
- **Network-First for APIs**: Always fresh data when online
- **Cache-First for Assets**: Instant load of static resources
- **Auto-Cleanup**: Old caches removed on activation

## Analytics (Optional)

To track PWA installs, add to `public/index.html`:

```javascript
window.addEventListener('appinstalled', (event) => {
  // Track PWA installation
  console.log('PWA installed', event);
  // Send to analytics: gtag('event', 'pwa_install');
});
```

## Next Steps

1. **Test locally**: `npm run web` and verify all PWA features
2. **Build**: `npm run build:web`
3. **Deploy**: Upload `dist/` folder to your hosting
4. **Verify**: Run Lighthouse audit on deployed site
5. **Monitor**: Check service worker activation in analytics

## Resources

- [Web.dev PWA Guide](https://web.dev/progressive-web-apps/)
- [MDN Service Worker API](https://developer.mozilla.org/en-US/docs/Web/API/Service_Worker_API)
- [Can I Use - Service Workers](https://caniuse.com/serviceworkers)
