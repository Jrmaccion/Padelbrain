/**
 * Centralized Logging Service
 *
 * Provides structured logging with multiple levels and automatic
 * integration with Sentry for error tracking in production.
 */

import { captureException, captureMessage, addBreadcrumb } from './sentry';

export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

export interface LogContext {
  [key: string]: any;
}

/**
 * Logger class for structured application logging
 */
class Logger {
  private isDev: boolean;

  constructor() {
    this.isDev = __DEV__;
  }

  /**
   * Log debug information (dev only)
   */
  debug(message: string, context?: LogContext): void {
    if (this.isDev) {
      console.log(`[DEBUG] ${message}`, context || '');
    }

    addBreadcrumb(message, 'debug', 'debug', context);
  }

  /**
   * Log informational messages
   */
  info(message: string, context?: LogContext): void {
    if (this.isDev) {
      console.log(`[INFO] ${message}`, context || '');
    }

    addBreadcrumb(message, 'info', 'info', context);
  }

  /**
   * Log warning messages
   */
  warn(message: string, context?: LogContext): void {
    if (this.isDev) {
      console.warn(`[WARN] ${message}`, context || '');
    }

    addBreadcrumb(message, 'warning', 'warning', context);
    captureMessage(message, 'warning');
  }

  /**
   * Log error messages and exceptions
   */
  error(message: string, error?: Error, context?: LogContext): void {
    if (this.isDev) {
      console.error(`[ERROR] ${message}`, error, context || '');
    }

    addBreadcrumb(message, 'error', 'error', context);

    if (error) {
      captureException(error, { message, ...context });
    } else {
      captureMessage(message, 'error');
    }
  }

  /**
   * Log fatal errors that require immediate attention
   */
  fatal(message: string, error: Error, context?: LogContext): void {
    console.error(`[FATAL] ${message}`, error, context || '');

    addBreadcrumb(message, 'fatal', 'fatal', context);
    captureException(error, { message, ...context });
  }

  /**
   * Log user actions for tracking
   */
  logAction(action: string, details?: LogContext): void {
    this.debug(`User Action: ${action}`, details);
    addBreadcrumb(action, 'user_action', 'info', details);
  }

  /**
   * Log navigation events
   */
  logNavigation(screen: string, params?: LogContext): void {
    this.debug(`Navigation: ${screen}`, params);
    addBreadcrumb(`Navigated to ${screen}`, 'navigation', 'info', params);
  }

  /**
   * Log data operations (CRUD)
   */
  logDataOperation(
    operation: 'create' | 'read' | 'update' | 'delete',
    type: string,
    id?: string
  ): void {
    this.debug(`Data Operation: ${operation} ${type}`, { id });
    addBreadcrumb(`${operation} ${type}`, 'data', 'info', { id });
  }

  /**
   * Log API calls (if/when added to the app)
   */
  logApiCall(method: string, endpoint: string, status?: number): void {
    this.debug(`API Call: ${method} ${endpoint}`, { status });
    addBreadcrumb(`${method} ${endpoint}`, 'http', 'info', { status });
  }

  /**
   * Log performance metrics
   */
  logPerformance(metric: string, duration: number): void {
    this.debug(`Performance: ${metric} took ${duration}ms`);
    addBreadcrumb(`Performance: ${metric}`, 'performance', 'info', { duration });
  }
}

/**
 * Singleton logger instance
 */
export const logger = new Logger();

/**
 * Convenience exports for common logging patterns
 */
export const log = {
  debug: (msg: string, ctx?: LogContext) => logger.debug(msg, ctx),
  info: (msg: string, ctx?: LogContext) => logger.info(msg, ctx),
  warn: (msg: string, ctx?: LogContext) => logger.warn(msg, ctx),
  error: (msg: string, error?: Error, ctx?: LogContext) => logger.error(msg, error, ctx),
  fatal: (msg: string, error: Error, ctx?: LogContext) => logger.fatal(msg, error, ctx),
  action: (action: string, details?: LogContext) => logger.logAction(action, details),
  navigation: (screen: string, params?: LogContext) => logger.logNavigation(screen, params),
  data: (op: 'create' | 'read' | 'update' | 'delete', type: string, id?: string) =>
    logger.logDataOperation(op, type, id),
};
