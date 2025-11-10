/**
 * Sentry Error Tracking Service
 *
 * Provides centralized error tracking and logging capabilities using Sentry.
 * Automatically captures exceptions, messages, and breadcrumbs.
 */

import * as Sentry from '@sentry/react-native';
import { Platform } from 'react-native';

const SENTRY_DSN = process.env.SENTRY_DSN || '';
const IS_DEV = __DEV__;

/**
 * Initialize Sentry for error tracking
 *
 * Should be called as early as possible in the app lifecycle
 */
export function initSentry(): void {
  if (!SENTRY_DSN) {
    console.warn(
      'Sentry DSN not configured. Set SENTRY_DSN environment variable to enable error tracking.'
    );
    return;
  }

  Sentry.init({
    dsn: SENTRY_DSN,
    debug: IS_DEV,
    environment: IS_DEV ? 'development' : 'production',
    enabled: !IS_DEV, // Only enable in production
    tracesSampleRate: IS_DEV ? 1.0 : 0.2, // 20% of transactions in production
    beforeSend(event) {
      // Don't send events in development
      if (IS_DEV) {
        console.log('Sentry event (not sent in dev):', event);
        return null;
      }
      return event;
    },
    integrations: [
      Sentry.reactNativeTracingIntegration({
        enableNativeFramesTracking: !__DEV__,
      }),
    ],
  });

  // Set platform context
  Sentry.setContext('platform', {
    os: Platform.OS,
    version: Platform.Version,
  });
}

/**
 * Capture an exception and send to Sentry
 */
export function captureException(error: Error, context?: Record<string, any>): void {
  if (IS_DEV) {
    console.error('[Sentry] Exception:', error, context);
  }

  if (context) {
    Sentry.setContext('error_context', context);
  }

  Sentry.captureException(error);
}

/**
 * Capture a message and send to Sentry
 */
export function captureMessage(
  message: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info'
): void {
  if (IS_DEV) {
    console.log(`[Sentry] Message (${level}):`, message);
  }

  Sentry.captureMessage(message, level);
}

/**
 * Set user information for error tracking
 */
export function setUser(user: { id?: string; email?: string; username?: string }): void {
  Sentry.setUser(user);
}

/**
 * Clear user information
 */
export function clearUser(): void {
  Sentry.setUser(null);
}

/**
 * Add breadcrumb for tracking user actions
 */
export function addBreadcrumb(
  message: string,
  category: string,
  level: 'fatal' | 'error' | 'warning' | 'info' | 'debug' = 'info',
  data?: Record<string, any>
): void {
  Sentry.addBreadcrumb({
    message,
    category,
    level,
    data,
    timestamp: Date.now() / 1000,
  });
}
