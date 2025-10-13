# Production Release Guide for PadelBrain

Complete guide to building and deploying PadelBrain across all platforms.

## Prerequisites

### Required Tools
```bash
# Node.js 18+ and npm
node --version  # Should be 18.x or higher
npm --version

# Expo CLI (global)
npm install -g eas-cli

# EAS Login
eas login

# For Electron builds
npm install -g electron
npm install -g electron-builder
```

### Required Accounts
- **Expo Account**: https://expo.dev (EAS builds)
- **Apple Developer**: $99/year (iOS App Store)
- **Google Play Console**: $25 one-time (Android)

---

## 1. Pre-Release Checklist

### Code Quality
- [ ] Run `npm run typecheck` - No TypeScript errors
- [ ] Test on iOS simulator/device
- [ ] Test on Android emulator/device
- [ ] Test on web browsers (Chrome, Safari, Firefox)
- [ ] Test voice input with microphone permission
- [ ] Verify all data persists correctly (AsyncStorage)

### Configuration
- [ ] Update version in `app.json` and `package.json`
- [ ] Update build numbers in `eas.json` if not using autoIncrement
- [ ] Verify bundle identifiers match (iOS/Android)
- [ ] Check all required assets exist (see ASSETS_REQUIRED.md)

### Assets
- [ ] All icons generated (1024x1024 source)
- [ ] Splash screens created
- [ ] PWA icons in public/ directory
- [ ] Electron icons (.ico, .icns) generated

### Environment
```bash
# Set production environment
export NODE_ENV=production

# Verify no dev dependencies in runtime
npm run validate
```

---

## 2. Mobile Builds (EAS)

### iOS Production Build

#### Step 1: Configure Apple Developer
```bash
# First time setup - follow prompts
eas credentials

# Or configure in eas.json submit section:
# - appleId: Your Apple ID email
# - ascAppId: App Store Connect app ID
# - appleTeamId: Developer Team ID
```

#### Step 2: Build IPA
```bash
# Build for App Store distribution
npm run eas:production:ios

# Or manually:
eas build --platform ios --profile production

# Monitor build at: https://expo.dev
```

#### Step 3: Submit to App Store
```bash
# Automatic submission
npm run eas:submit:ios

# Or manual via App Store Connect:
# 1. Download IPA from EAS
# 2. Upload via Transporter app
# 3. Submit for review in App Store Connect
```

### Android Production Build

#### Step 1: Generate Signing Key (First Time Only)
```bash
# EAS will generate a keystore for you automatically
# Or create your own:
eas credentials

# Store the keystore securely!
# You'll need it for all future updates
```

#### Step 2: Build AAB
```bash
# Build Android App Bundle
npm run eas:production:android

# Or manually:
eas build --platform android --profile production
```

#### Step 3: Submit to Google Play
```bash
# Setup service account first:
# 1. Create service account in Google Cloud Console
# 2. Download JSON key as android-service-account.json
# 3. Add key path to eas.json

# Automatic submission
npm run eas:submit:android

# Or manual via Play Console:
# 1. Download AAB from EAS
# 2. Upload to Play Console → Production
# 3. Complete store listing
# 4. Submit for review
```

### Build Both Platforms
```bash
# Build iOS and Android simultaneously
npm run eas:production:all
```

---

## 3. Web/PWA Deployment

### Build Static Export
```bash
# Build production web bundle
npm run build:production

# Output directory: dist/

# Note: The production build uses "output": "static" in app.json
# For development, use "output": "single" instead
```

### Deploy Options

#### Option A: Netlify (Recommended for PWA)
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
cd dist
netlify deploy --prod

# Configure:
# - Build command: npm run build:production
# - Publish directory: dist
```

#### Option B: Vercel
```bash
npm install -g vercel
cd dist
vercel --prod
```

#### Option C: Firebase Hosting
```bash
npm install -g firebase-tools
firebase init hosting
firebase deploy
```

#### Option D: Static File Server
```bash
# Upload contents of dist/ to any static host:
# - AWS S3 + CloudFront
# - GitHub Pages
# - Cloudflare Pages
# - DigitalOcean Spaces
```

### HTTPS Configuration (Required for Microphone)
```nginx
# nginx example
server {
    listen 443 ssl http2;
    server_name padelbrain.com;

    ssl_certificate /path/to/cert.pem;
    ssl_certificate_key /path/to/key.pem;

    root /var/www/padelbrain/dist;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # PWA Service Worker
    location /sw.js {
        add_header Cache-Control "no-cache";
        proxy_cache_bypass $http_pragma;
    }

    # Assets caching
    location ~* \.(jpg|jpeg|png|gif|ico|css|js)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

---

## 4. Desktop (Electron) Builds

### Install Dependencies
```bash
# Development
npm install

# Verify Electron works
npm run electron:dev
```

### Build for Windows
```bash
# Build NSIS installer + portable EXE
npm run build:electron:win

# Output: dist-electron/PadelBrain-1.0.0-win-x64.exe
#         dist-electron/PadelBrain-1.0.0-win-x64-portable.exe
```

**Requirements:**
- Windows 10+ for building
- Code signing certificate (optional but recommended)

### Build for macOS
```bash
# Build DMG + ZIP
npm run build:electron:mac

# Output: dist-electron/PadelBrain-1.0.0-mac-universal.dmg
#         dist-electron/PadelBrain-1.0.0-mac-universal.zip
```

**Requirements:**
- macOS for building
- Apple Developer ID certificate for notarization
- Xcode Command Line Tools

**Notarization (Required for macOS):**
```bash
# Set credentials
export APPLE_ID="your-apple-id@example.com"
export APPLE_ID_PASSWORD="app-specific-password"
export APPLE_TEAM_ID="YOUR_TEAM_ID"

# electron-builder will auto-notarize if credentials are set
npm run build:electron:mac
```

### Build for Linux
```bash
# Build AppImage, deb, rpm
npm run build:electron:linux

# Output: dist-electron/PadelBrain-1.0.0-linux-x64.AppImage
#         dist-electron/PadelBrain-1.0.0-linux-x64.deb
#         dist-electron/PadelBrain-1.0.0-linux-x64.rpm
```

### Build All Platforms
```bash
# Build for all platforms (requires each OS)
npm run build:electron
```

---

## 5. Release Workflow

### Version Bump
```bash
# Update version numbers
npm version patch  # 1.0.0 → 1.0.1
npm version minor  # 1.0.0 → 1.1.0
npm version major  # 1.0.0 → 2.0.0

# This updates package.json automatically
# Manually update app.json version to match
```

### Git Tagging
```bash
git add .
git commit -m "Release v1.0.0"
git tag v1.0.0
git push origin main --tags
```

### Build Matrix

| Platform | Command | Output | Time |
|----------|---------|--------|------|
| iOS | `npm run eas:production:ios` | .ipa | ~15 min |
| Android | `npm run eas:production:android` | .aab | ~10 min |
| Web/PWA | `npm run build:production` | dist/ | ~2 min |
| Windows | `npm run build:electron:win` | .exe | ~5 min |
| macOS | `npm run build:electron:mac` | .dmg | ~5 min |
| Linux | `npm run build:electron:linux` | .AppImage, .deb, .rpm | ~5 min |

---

## 6. Post-Release Tasks

### App Store Optimization
- [ ] Complete App Store listing (screenshots, description)
- [ ] Complete Play Store listing
- [ ] Set up app previews/videos
- [ ] Configure age ratings
- [ ] Set up support URL and privacy policy

### Monitoring
- [ ] Setup analytics (Google Analytics, Mixpanel, etc.)
- [ ] Configure error tracking (Sentry, BugSnag)
- [ ] Setup crash reporting (Firebase Crashlytics)

### Updates
```bash
# iOS/Android OTA updates via EAS Update
eas update --branch production --message "Bug fixes"

# Desktop auto-updates
# Configure in electron-builder.json → publish section
```

---

## 7. Common Issues & Solutions

### App Config Issues
```bash
# If you get "deploymentTarget needs to be at least 15.1":
# Update app.json plugins section:
# "ios": { "deploymentTarget": "15.1" }

# If you get "static output requires expo-router":
# Change app.json web.output to "single" for development
# Use "static" only for production builds
```

### iOS Build Fails
```bash
# Clear EAS cache
eas build --platform ios --profile production --clear-cache

# Check credentials
eas credentials

# Verify provisioning profile
```

### Android Build Fails
```bash
# Check keystore
eas credentials

# Verify gradle version compatibility
# Update android section in app.json if needed
```

### Web Bundle Too Large
```bash
# Analyze bundle
npx expo export:web --dump-assetmap

# Optimize images
# Use lazy loading for routes
# Enable code splitting
```

### Electron Build Errors
```bash
# Clear cache
rm -rf dist dist-electron node_modules
npm install
npm run build:electron
```

---

## 8. Distribution Checklist

### Before Release
- [ ] Increment version numbers
- [ ] Test on all target platforms
- [ ] Update CHANGELOG.md
- [ ] Create git tag
- [ ] Build all platforms

### iOS App Store
- [ ] Submit build via EAS or Transporter
- [ ] Complete App Store Connect listing
- [ ] Submit for review
- [ ] Monitor review status

### Google Play Store
- [ ] Upload AAB to Play Console
- [ ] Complete store listing
- [ ] Submit for review (production track)
- [ ] Monitor rollout

### Web/PWA
- [ ] Deploy to hosting service
- [ ] Verify HTTPS works
- [ ] Test PWA install on mobile
- [ ] Verify service worker updates

### Desktop
- [ ] Upload installers to GitHub Releases
- [ ] Update download links on website
- [ ] Announce on social media
- [ ] Update documentation

---

## 9. Support & Maintenance

### Update Frequency
- **Critical bugs**: Immediate hotfix
- **Minor bugs**: Weekly patch
- **Features**: Monthly minor release
- **Major updates**: Quarterly

### Testing Matrix
- iOS: Latest 2 versions
- Android: API 23+ (Android 6.0+)
- Web: Chrome, Safari, Firefox (latest 2 versions)
- Desktop: Windows 10+, macOS 11+, Ubuntu 20.04+

---

## Quick Reference

```bash
# Development
npm start                    # Start Expo dev server
npm run web                  # Start web dev server
npm run electron:dev         # Start Electron dev mode

# Production Builds
npm run eas:production:ios       # iOS App Store build
npm run eas:production:android   # Android Play Store build
npm run build:production         # Web/PWA build
npm run build:electron:win       # Windows installer
npm run build:electron:mac       # macOS installer
npm run build:electron:linux     # Linux packages

# Quality Checks
npm run typecheck           # TypeScript validation
npm run validate            # Full validation

# Deployment
npm run eas:submit:ios      # Submit iOS to App Store
npm run eas:submit:android  # Submit Android to Play Store
```

---

## Resources

- **Expo EAS**: https://docs.expo.dev/eas/
- **App Store Connect**: https://appstoreconnect.apple.com
- **Google Play Console**: https://play.google.com/console
- **Electron Builder**: https://www.electron.build/
- **PWA Best Practices**: https://web.dev/progressive-web-apps/

---

**Last Updated**: 2025-10-13
**PadelBrain Version**: 1.0.0
