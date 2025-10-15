# Repository Guidelines

## Project Structure & Module Organization
PadelBrain is an Expo + TypeScript app. `App.tsx` wires the Safe Area layout, error boundary, and navigation stack. Source lives in `src/`: `components/` for reusable UI, `screens/` for route-level views, `navigation/` for stacks and tabs, `store/` for Zustand state, and domain helpers in `services/`, `schemas/`, and `utils/`. Tests sit in `__tests__/`; assets in `assets/`; platform scaffolding in `public/`, `android/`, and `electron/`.

## Build, Test & Development Commands
- `npm run start` launches Expo Go with hot reload; use `npm run web`, `npm run android`, or `npm run ios` for platform-specific entry points.
- `npm run typecheck` (aliased by `npm run validate`) runs the TypeScript compiler in strict mode; keep it green before committing.
- `npm run prebuild` generates native projects; `npm run prebuild:clean` forces a fresh sync when native config drifts.
- `npm run build:web` exports the web bundle; pair it with `npm run build:electron[:platform]` for desktop packages.
- `npm run electron:dev` boots the desktop shell against the local web build.

## Coding Style & Naming Conventions
Write modern functional React components with two-space indentation and TypeScript annotations. Use `PascalCase` for components/screens (`MatchReviewScreen.tsx`), `camelCase` for functions/hooks (`usePlayerFilters`), and `SCREAMING_SNAKE_CASE` for exported constants. Import shared modules through the `@/` alias (`import { colors } from '@/constants/colors'`). Run real lint/format scripts locally once the placeholders in `package.json` are replaced, and keep formatting changes isolated.

## Testing Guidelines
Jest is scaffolded but minimal; add `.test.ts`/`.test.tsx` files under `__tests__/` or colocated with the feature. Mirror feature names (`MatchCard.test.tsx`) and assert happy paths plus edge cases, especially for Zustand actions and `services/` helpers. Until full tests land, treat `npm run typecheck` and manual smoke tests across Expo platforms as the regression gate, and note any gaps in the PR description.

## Commit & Pull Request Guidelines
Commits follow Conventional Commits (`feat: añadir método update() a hooks`, `fix: corregir emojis UTF-8`). Keep subjects under 72 characters, present-tense, and scoped when practical. For PRs, include a concise summary, linked issues, per-platform test notes (`web`, `android`, `electron`), and screenshots for UI updates. Call out new config or environment steps so reviewers can reproduce after `npm install` and the relevant script above.
