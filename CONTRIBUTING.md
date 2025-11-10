# Contributing to PadelBrain

Thank you for your interest in contributing to PadelBrain! This document provides guidelines and instructions for contributing to the project.

## Table of Contents

- [Code of Conduct](#code-of-conduct)
- [Getting Started](#getting-started)
- [Development Workflow](#development-workflow)
- [Coding Standards](#coding-standards)
- [Testing](#testing)
- [Commit Messages](#commit-messages)
- [Pull Requests](#pull-requests)
- [Project Structure](#project-structure)

## Code of Conduct

This project follows a code of conduct. By participating, you are expected to uphold this code:

- Be respectful and inclusive
- Welcome newcomers and help them get started
- Focus on constructive feedback
- Accept responsibility and apologize for mistakes
- Focus on what is best for the community

## Getting Started

### Prerequisites

- Node.js 20.x or higher
- npm or yarn
- Expo CLI
- Git

### Setup

1. **Fork the repository** on GitHub

2. **Clone your fork** locally:
   ```bash
   git clone https://github.com/YOUR-USERNAME/padelbrain.git
   cd padelbrain
   ```

3. **Add upstream remote**:
   ```bash
   git remote add upstream https://github.com/ORIGINAL-OWNER/padelbrain.git
   ```

4. **Install dependencies**:
   ```bash
   npm install --legacy-peer-deps
   ```

5. **Start the development server**:
   ```bash
   npm start
   ```

## Development Workflow

### Branching Strategy

- `main`: Production-ready code
- `develop`: Integration branch for features
- `feature/*`: New features
- `fix/*`: Bug fixes
- `refactor/*`: Code refactoring
- `docs/*`: Documentation updates

### Creating a Feature Branch

```bash
git checkout develop
git pull upstream develop
git checkout -b feature/your-feature-name
```

### Making Changes

1. **Make your changes** following our coding standards
2. **Test your changes** thoroughly
3. **Commit your changes** with meaningful commit messages
4. **Push to your fork**:
   ```bash
   git push origin feature/your-feature-name
   ```

## Coding Standards

### TypeScript

- Use TypeScript for all new code
- Enable strict mode
- Avoid `any` types when possible
- Define interfaces for component props
- Use proper type annotations for function parameters and return types

### Code Style

- **Indentation**: 2 spaces
- **Quotes**: Single quotes for strings
- **Semicolons**: Always use semicolons
- **Line length**: Max 100 characters
- **Naming conventions**:
  - `PascalCase` for components and types
  - `camelCase` for functions and variables
  - `SCREAMING_SNAKE_CASE` for constants

### ESLint and Prettier

Code must pass linting and formatting checks:

```bash
npm run lint        # Check for linting errors
npm run lint:fix    # Auto-fix linting errors
npm run format      # Format code with Prettier
```

Pre-commit hooks will automatically run these checks.

### Path Aliases

Use `@/` prefix for imports:

```typescript
// Good
import { Match } from '@/types';
import { useDataStore } from '@/store/useDataStore';

// Bad
import { Match } from '../../types';
```

### React Best Practices

- Use functional components with hooks
- Prefer `useMemo` and `useCallback` for optimization
- Use `React.memo` for expensive components
- Keep components small and focused (< 300 lines)
- Extract reusable logic into custom hooks

### State Management

- Use Zustand store for global state (`useDataStore`)
- Use local state (`useState`) for component-specific state
- Never mutate state directly - always use immutable updates

## Testing

### Running Tests

```bash
npm test              # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage report
```

### Writing Tests

- Write tests for all new features
- Aim for >60% code coverage
- Test files should be colocated in `__tests__` directories
- Use descriptive test names: `it('should do something when condition')`

Example:

```typescript
describe('ComponentName', () => {
  it('should render correctly', () => {
    const { getByText } = render(<ComponentName />);
    expect(getByText('Expected Text')).toBeTruthy();
  });

  it('should call callback when button is pressed', () => {
    const mockCallback = jest.fn();
    const { getByRole } = render(<ComponentName onPress={mockCallback} />);
    fireEvent.press(getByRole('button'));
    expect(mockCallback).toHaveBeenCalledTimes(1);
  });
});
```

## Commit Messages

Follow [Conventional Commits](https://www.conventionalcommits.org/) specification:

```
type(scope): subject

body (optional)

footer (optional)
```

### Types

- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes (formatting, no logic change)
- `refactor`: Code refactoring
- `test`: Adding or updating tests
- `chore`: Maintenance tasks, dependencies

### Examples

```
feat(match): add partner and position tracking

Added new fields to Match type to track doubles partner and court position (left/right).

Closes #123
```

```
fix(store): resolve race condition in data loading

Added proper async/await handling to prevent concurrent updates.
```

```
docs(readme): update installation instructions
```

## Pull Requests

### Before Submitting

- [ ] Code passes all tests (`npm test`)
- [ ] Code passes linting (`npm run lint`)
- [ ] Code is formatted (`npm run format`)
- [ ] Types are correct (`npm run typecheck`)
- [ ] New features have tests
- [ ] Documentation is updated if needed
- [ ] Commit messages follow conventions

### PR Template

When creating a PR, include:

1. **Description**: What does this PR do?
2. **Motivation**: Why is this change needed?
3. **Changes**: List of main changes
4. **Testing**: How was this tested?
5. **Screenshots**: If UI changes
6. **Breaking Changes**: Any breaking changes?
7. **Related Issues**: Link to related issues

### Review Process

1. Automated checks must pass (CI/CD)
2. At least one approval from maintainer
3. All comments must be resolved
4. Branch must be up-to-date with base branch

## Project Structure

```
padelbrain/
├── src/
│   ├── components/      # Reusable React components
│   │   ├── common/      # Generic UI components
│   │   ├── matches/     # Match-specific components
│   │   ├── trainings/   # Training-specific components
│   │   └── quick-entry/ # Form components
│   ├── screens/         # Top-level screen components
│   ├── hooks/           # Custom React hooks
│   ├── store/           # Zustand state management
│   ├── services/        # Business logic and APIs
│   ├── utils/           # Helper functions
│   ├── types/           # TypeScript type definitions
│   ├── schemas/         # Zod validation schemas
│   ├── constants/       # App constants (colors, layout)
│   └── navigation/      # Navigation configuration
├── public/              # Static assets for web
├── .github/             # GitHub Actions workflows
└── tests/               # Integration and E2E tests
```

## Additional Resources

- [React Native Documentation](https://reactnative.dev/)
- [Expo Documentation](https://docs.expo.dev/)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Zustand Documentation](https://github.com/pmndrs/zustand)
- [Testing Library](https://testing-library.com/docs/react-native-testing-library/intro/)

## Questions?

If you have questions or need help:

1. Check existing issues and discussions
2. Create a new issue with the `question` label
3. Reach out to maintainers

## License

By contributing to PadelBrain, you agree that your contributions will be licensed under the same license as the project.

---

Thank you for contributing to PadelBrain! 🎾
