# Repository Guidelines

## Project Structure & Module Organization
- `App.tsx` wires the Safe Area shell, error boundary, and navigation stack; treat it as the entry point for providers.
- Feature code lives in `src/`: shared UI in `src/components/`, screens in `src/screens/`, navigation stacks in `src/navigation/`, Zustand stores in `src/store/`, and domain helpers in `src/services/`, `src/schemas/`, and `src/utils/`.
- Tests sit either under `__tests__/` or beside the feature under test; assets live in `assets/`; platform scaffolding resides in `android/`, `public/`, and `electron/`.

## Build, Test, and Development Commands
- `npm run start` launches Expo Go with hot reload; target specific platforms with `npm run web`, `npm run android`, or `npm run ios`.
- `npm run typecheck` (alias `npm run validate`) runs `tsc` in strict mode; it must pass before merging.
- `npm run prebuild` syncs native projects; run `npm run prebuild:clean` when native config drifts.
- `npm run build:web` creates the production web bundle; chain with `npm run build:electron[:platform]` to package desktop builds.
- `npm run electron:dev` boots the desktop shell wired to the local web server for manual smoke tests.

## Coding Style & Naming Conventions
- Use functional React components, two-space indentation, and explicit TypeScript annotations on complex props or hooks.
- Adopt `PascalCase` for components/screens (`MatchReviewScreen.tsx`), `camelCase` for hooks and helpers (`usePlayerFilters`), and `SCREAMING_SNAKE_CASE` for exported constants.
- Import shared modules through the `@/` alias (`import { colors } from '@/constants/colors'`), and avoid wide relative paths.
- Keep formatting-only changes isolated and run the real lint/format scripts once the placeholders in `package.json` are replaced.

## Testing Guidelines
- Rely on Jest; add `.test.ts` or `.test.tsx` files under `__tests__/` or colocated with the feature (`MatchCard.test.tsx`).
- Cover happy paths plus edge scenarios, especially for Zustand actions and `services/` helpers. Document untested cases in PR descriptions.
- Treat `npm run typecheck` as the baseline regression gate and manually smoke-test across Expo platforms before sign-off.

## Commit & Pull Request Guidelines
- Follow Conventional Commits (`feat: add match filters`, `fix: correct UTF-8 encoding`), keep subjects under 72 characters, and scope when practical.
- PRs should include a concise summary, linked issues, per-platform test notes (`web`, `android`, `electron`), and screenshots or recordings for UI updates.
- Call out any new configuration or environment steps so reviewers can reproduce after `npm install` and the relevant command above.

## Security & Configuration Tips
- Store secrets in environment files (e.g., `.env`) and never commit them; reference required keys in documentation or PR notes.
- Verify that generated native files remain in sync after `npm run prebuild`; commit changes that affect build outputs or configs.*** End Patch
