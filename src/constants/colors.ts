import { theme } from './theme';

// Legacy color exports for backwards compatibility
// New code should use theme.colors directly
export const colors = {
  primary: theme.colors.primary[500],
  secondary: theme.colors.cyan[500],
  bg: theme.colors.background,
  background: theme.colors.background,
  bgSecondary: theme.colors.gray[100],
  text: theme.colors.text.primary,
  textSecondary: theme.colors.text.secondary,
  textTertiary: theme.colors.text.tertiary,
  card: theme.colors.surface,
  border: theme.colors.border.default,
  error: theme.colors.error[500],
};
