# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PadelBrain is a React Native (Expo) app for tracking padel training sessions and matches. Built with TypeScript, it runs on iOS, Android, and Web platforms using a single codebase.

## Commands

### Development
```bash
npm start           # Start Expo dev server
npm run android     # Run on Android
npm run ios         # Run on iOS
npm run web         # Run on Web
```

### Electron (Desktop)
```bash
npm run build:web             # Build web bundle
npm run electron:dev          # Run Electron in development mode
npm run build:electron        # Build desktop app for current platform
npm run build:electron:win    # Build for Windows
npm run build:electron:mac    # Build for macOS
npm run build:electron:linux  # Build for Linux
```

### PWA (Progressive Web App)
```bash
npm run verify:pwa            # Verify PWA setup is complete
npm run web                   # Test PWA locally (with service worker on localhost)
npm run build:web             # Build PWA for production deployment
```

### Type Checking & Validation
```bash
npm run typecheck   # Run TypeScript compiler (no emit)
npm run validate    # Alias for typecheck
npm run prebuild    # Runs typecheck (pre-build hook)
```

### Linting & Formatting
Note: ESLint and Prettier are not yet configured. The lint/format scripts are placeholders that exit with success.

### Testing
Note: Jest is not yet configured. Test scripts are placeholders.

## Architecture

### Data Flow & State Management

**Zustand Global Store**: Uses Zustand with AsyncStorage persistence (`src/store/useDataStore.ts`)
- Single source of truth for all matches and trainings data
- Automatic persistence via Zustand's `persist` middleware with AsyncStorage backend
- Only data arrays are persisted, not loading/error states
- Legacy AsyncStorage migration: On first load, migrates old `'matches'` and `'trainings'` keys to Zustand store

**useDataStore Hook**: Central store exposing state and actions
- State: `matches`, `trainings`, `isLoadingMatches`, `isLoadingTrainings`, `matchesError`, `trainingsError`
- Match actions: `loadMatches()`, `addMatch()`, `updateMatch(id, partial)`, `removeMatch(id)`
- Training actions: `loadTrainings()`, `addTraining()`, `updateTraining(id, partial)`, `removeTraining(id)`
- Utility: `clearErrors()`, `reset()`
- All mutations are async and include error handling

**Convenience Hooks**: `useMatches()` and `useTrainings()` (in `src/hooks/`)
- Thin wrappers around Zustand store for backward compatibility
- Auto-load data on mount
- Expose methods: `add()`, `update()`, `remove()`, `load()`/`reload()`
- Provide dual aliases: `items`/`matches` and `items`/`trainings`

**Legacy Storage Service**: `src/services/storage.ts` still used for:
- Form state persistence (`'lastSelections'`)
- Draft saving (`'draft-${type}'`)
- Other non-Zustand data

### Type System

Core types in `src/types/index.ts`:
- `Rating1to5`: Literal type for 1-5 ratings
- `BaseItem`: Shared fields (id, date, location, notes, wellness ratings)
- `Match`: Extends BaseItem with tournament details, opponents, results, partner, position, analysis
- `Training`: Extends BaseItem with coach, goals, trainingPartners, postReview

Recent additions:
- `Match.partner` and `Match.position` ('right' | 'left') for doubles tracking
- `Training.trainingPartners` (string array) for multiple training companions
- `Training.postReview.physical` rating added

### Navigation & Responsive Design

**AppNavigator** (`src/navigation/AppNavigator.tsx`):
- Custom tab-based navigation (no React Navigation dependency)
- Three layout modes based on device width:
  - Mobile (<768px): Bottom tab bar with icons and labels
  - Tablet/Desktop (768-1100px): Side rail navigation with brand and tooltips
  - Wide Desktop (≥1100px): Top horizontal bar navigation
- Keyboard shortcuts on web: keys 1-5 switch tabs
- Supports badges for notifications (e.g., stats alerts)

**Responsive Utilities** (`src/constants/layout.ts`):
- `useResponsive()` hook provides `deviceType`, `isMobile`, `isTablet`, `isDesktop`
- `layout` object provides responsive values: `getPaddingHorizontal()`, `getMaxWidth()`, `getGridColumns()`, `getGap()`
- Breakpoints: mobile (0), tablet (768), desktop (1024), wide (1440)

### Component Architecture

**Path Aliases**: Use `@/*` for imports (mapped via babel-plugin-module-resolver and tsconfig paths)
```typescript
import { Match } from '@/types';
import { getItem } from '@/services/storage';
```

**Babel Configuration**: Custom setup in `babel.config.js`
- Path alias resolution: `@/` → `./src/`
- Custom plugin (`babel-plugin-replace-import-meta.js`) to neutralize `import.meta` for Vite-friendly libraries:
  - `import.meta.env.MODE` → `process.env.NODE_ENV`
  - `import.meta.env` → `process.env`
  - `import.meta` → `{}`
- Preset: `babel-preset-expo`

**Component Organization**:
- `src/components/common/`: Reusable UI primitives (Button, Input, Card, Badge, Tooltip)
- `src/components/quick-entry/`: Multi-step form components with voice input and templates
- `src/components/matches/`, `src/components/trainings/`: Domain-specific lists and cards
- `src/components/report/`: PDF export components using expo-print
- `src/screens/`: Top-level screen components (HomeScreen, MatchesScreen, TrainingsScreen, StatsScreen, ReportsScreen)

**QuickEntryForm Pattern**: Complex form with multiple concerns
- Remembers last selections (coach, location, partners, opponents) via AsyncStorage key `'lastSelections'`
- Templates for common training/match scenarios (quick templates for common drills/analysis patterns)
- Voice input integration with basic NLP pattern matching
- Wellness ratings (1-5 chips) + Performance sliders (0-100 converted to 1-5)
- Draft saving capability
- Uses `QuickPeopleSelector` component for coach/partner/opponent selection with autocomplete
- Supports multiple training partners (array) vs single partner for matches

### Key Features

**Progressive Web App (PWA)**: Full PWA implementation for installable web app
- Service Worker: `public/sw.js` with cache-first strategy for offline support
- Web Manifest: `public/manifest.json` with app metadata, icons, and shortcuts
- Install Prompt: `src/components/common/PWAInstallPrompt.tsx` custom install UI
- Offline Caching: Precaches critical assets, runtime caching for dynamic content
- Auto-Updates: Version-based cache invalidation
- iOS Support: Apple touch icons and splash screens configured
- Android Support: Maskable icons for adaptive icon support
- See `PWA_SETUP.md` for detailed configuration and deployment guide

**Voice Input**: Uses `@react-native-voice/voice` package
- Component: `src/components/quick-entry/VoiceInput.tsx`
- Basic voice-to-text with simple pattern matching in `QuickEntryForm.processVoiceInput()`
- Extracts: score patterns, outcome (won/lost), strengths/weaknesses keywords from common Spanish terms
- No AI/LLM integration - uses only regex and keyword matching

**PDF Export**: `src/services/report/exportPdf.ts`
- Uses `expo-print` to generate HTML-based PDFs
- Web: Opens browser print dialog (user can save as PDF)
- Native: Creates PDF file, supports `expo-sharing` for share sheet
- Supports date range filtering for matches and trainings
- HTML template includes responsive table layouts

**Stats Calculation**: Basic win rate and totals in `src/utils/statsCalculator.ts`
- `calcBasicStats()` computes totalMatches, winrate, totalTrainings

## Important Patterns & Conventions

### Coding Style
- Use functional React components with hooks
- Two-space indentation
- Explicit TypeScript annotations on complex props and hook return types
- `PascalCase` for components/screens (e.g., `MatchReviewScreen.tsx`)
- `camelCase` for hooks and helpers (e.g., `usePlayerFilters`)
- `SCREAMING_SNAKE_CASE` for exported constants
- Import via `@/` path alias (avoid long relative paths)

### Hook Update Pattern
Both `useMatches()` and `useTrainings()` now expose an `update()` method:
```typescript
await update(id, { location: 'New location', notes: 'Updated notes' });
```
This allows partial updates without fetching the full item first.

### Form Field Naming
- Use consistent field names matching the TypeScript types
- Optional fields should use `undefined`, not empty strings, when not set
- Rating conversions: Performance sliders (0-100) → divide by 20 and round for Rating1to5

### Responsive Component Pattern
```typescript
const { deviceType, layout } = useResponsive();
const columns = layout.getGridColumns(); // 1, 2, or 3
```

### Storage Keys Convention
- `'padelbrain-storage'`: Zustand store (contains matches and trainings arrays)
- `'lastSelections'`: LastSelections object (form field memory)
- Draft keys use format: `'draft-${type}'` (e.g., 'draft-training')
- Legacy keys `'matches'` and `'trainings'` are auto-migrated to Zustand on first load

## Common Tasks

### Adding New Match/Training Fields
1. Update type in `src/types/index.ts`
2. Update form in `src/components/quick-entry/QuickEntryForm.tsx` (add state, input, submit logic)
3. Update display cards in `src/components/matches/MatchCard.tsx` or `src/components/trainings/TrainingCard.tsx`
4. If needed for PDF export, update HTML template in `src/services/report/exportPdf.ts`

### Creating New Screens
1. Create file in `src/screens/`
2. Add route to `AppNavigator.tsx` tabs array
3. Add case in `renderScreen()` switch statement
4. Update TypeScript `Route` type union

### Working with Storage
- For matches/trainings data: Use `useMatches()` or `useTrainings()` hooks (or access `useDataStore` directly)
- For form state/drafts: Use the legacy `storage.ts` service (`getItem`, `setItem`, `removeItem`)
- The Zustand store automatically handles persistence - no manual save/load needed for match/training data

## Build & Deployment Notes

- Expo SDK version: 54.x
- React Native: 0.81.4
- React: 19.1.0
- TypeScript: 5.3+ (strict mode enabled)
- Zustand: 5.0.8 (global state management)
- No native code modification required (Expo managed workflow)
- Electron: 33.4.1 for desktop builds
- Uses `patch-package` for post-install patches (run via postinstall hook)

### Platform-Specific Configuration (app.json)
- **iOS**: Deployment target 15.1, requires microphone and speech recognition permissions for voice input
- **Android**: Min SDK 24, Target/Compile SDK 35, requires RECORD_AUDIO and INTERNET permissions
- **Web**: Metro bundler, single output mode, PWA-ready with manifest config

### Commit Conventions
- Follow Conventional Commits format: `feat:`, `fix:`, `refactor:`, etc.
- Keep subject lines under 72 characters
- Use scopes when practical (e.g., `feat(voice): add Spanish keyword matching`)

### EAS Build (for native apps)
```bash
npm run eas:preview:ios         # Preview build for iOS
npm run eas:preview:android     # Preview build for Android
npm run eas:production:ios      # Production build for iOS
npm run eas:production:android  # Production build for Android
npm run eas:production:all      # Production build for all platforms
npm run eas:submit:ios          # Submit iOS app
npm run eas:submit:android      # Submit Android app
```
