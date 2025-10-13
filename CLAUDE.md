# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

PadelBrain is a React Native (Expo) app for tracking padel training sessions and matches with AI-powered analysis. Built with TypeScript, it runs on iOS, Android, and Web platforms using a single codebase.

## Commands

### Development
```bash
npm start           # Start Expo dev server
npm run android     # Run on Android
npm run ios         # Run on iOS
npm run web         # Run on Web
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

**Storage Layer**: Uses `@react-native-async-storage/async-storage` for persistence
- All data is stored as JSON in AsyncStorage with keys: `'matches'`, `'trainings'`, `'lastSelections'`, etc.
- Wrapper service at `src/services/storage.ts` provides `getItem<T>()`, `setItem<T>()`, `removeItem()`

**Custom Hooks Pattern**: State management via React hooks that encapsulate CRUD operations
- `useMatches()` and `useTrainings()` hooks load data on mount, expose `add()`, `update()`, `remove()`, `reload()` methods
- Hooks maintain local state and sync to AsyncStorage on mutations
- Both hooks expose dual aliases for compatibility: `items`/`matches` and `items`/`trainings`

**No Global State Library**: Each screen independently instantiates hooks. Data is not shared across screens in real-time. Screens must call `reload()` to refresh data.

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
- Keyboard shortcuts on web: keys 1-6 switch tabs
- Supports badges for notifications (e.g., AI unread count)

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

**Component Organization**:
- `src/components/common/`: Reusable UI primitives (Button, Input, Card, Badge, Tooltip)
- `src/components/quick-entry/`: Multi-step form components with voice input, templates, AI analysis
- `src/components/matches/`, `src/components/trainings/`: Domain-specific lists and cards
- `src/components/report/`: PDF export components using expo-print
- `src/screens/`: Top-level screen components (HomeScreen, MatchesScreen, TrainingsScreen, StatsScreen, AIAssistantScreen, ReportsScreen)

**QuickEntryForm Pattern**: Complex form with multiple concerns
- Remembers last selections (coach, location, partners, opponents) via AsyncStorage key `'lastSelections'`
- Templates for common training/match scenarios
- Voice input integration with basic NLP pattern matching
- Wellness ratings (1-5 chips) + Performance sliders (0-100 converted to 1-5)
- Draft saving capability

### Key Features

**Voice Input**: Uses `@react-native-voice/voice` package
- Component: `src/components/quick-entry/VoiceInput.tsx`
- Basic voice-to-text with pattern matching in `QuickEntryForm.processVoiceWithAI()`
- Extracts: score patterns, outcome (won/lost), strengths/weaknesses keywords

**PDF Export**: `src/services/report/exportPdf.ts`
- Uses `expo-print` to generate HTML-based PDFs
- Web: Opens browser print dialog (user can save as PDF)
- Native: Creates PDF file, supports `expo-sharing` for share sheet
- Supports date range filtering for matches and trainings
- HTML template includes responsive table layouts

**AI Service**: Currently placeholder at `src/services/aiService.ts`
- `getAIInsights()` returns mock data
- Intended for future LLM integration for match/training analysis

**Stats Calculation**: Basic win rate and totals in `src/utils/statsCalculator.ts`
- `calcBasicStats()` computes totalMatches, winrate, totalTrainings

## Important Patterns & Conventions

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
- `'matches'`: Match[] array
- `'trainings'`: Training[] array
- `'lastSelections'`: LastSelections object (form field memory)
- Draft keys use format: `'draft-${type}'` (e.g., 'draft-training')

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
Always use the hooks (`useMatches`, `useTrainings`) rather than directly calling storage service. The hooks ensure state and storage stay in sync.

## Build & Deployment Notes

- Expo SDK version: 54.x
- React Native: 0.73.6
- TypeScript: 5.3+ (strict mode enabled)
- No native code modification required (Expo managed workflow)
- Pre-build hook runs `typecheck` to catch errors before builds
