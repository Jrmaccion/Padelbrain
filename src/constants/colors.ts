import { theme } from './theme';

// Legacy color exports for backwards compatibility
// New code should use theme.colors directly
export const colors = {
  primary: theme.colors.primary[500],
  secondary: theme.colors.cyan[500],
  bg: theme.colors.background,
  text: theme.colors.text.primary,
  card: theme.colors.surface,
  border: theme.colors.border.default,
};
