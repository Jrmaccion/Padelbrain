import AsyncStorage from '@react-native-async-storage/async-storage';
import { logger } from './logger';

/**
 * Retry configuration for storage operations
 */
const RETRY_CONFIG = {
  maxRetries: 3,
  baseDelay: 100, // milliseconds
  maxDelay: 1000,
};

/**
 * Sleep helper for retry delays
 */
const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

/**
 * Retry wrapper with exponential backoff
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  operation: string,
  key: string
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= RETRY_CONFIG.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      if (attempt < RETRY_CONFIG.maxRetries) {
        const delay = Math.min(
          RETRY_CONFIG.baseDelay * Math.pow(2, attempt),
          RETRY_CONFIG.maxDelay
        );
        logger.warn(
          `${operation} failed for key "${key}", retrying in ${delay}ms (attempt ${attempt + 1}/${RETRY_CONFIG.maxRetries})`,
          { key, attempt, delay }
        );
        await sleep(delay);
      }
    }
  }

  // All retries exhausted
  throw lastError;
}

export async function setItem<T>(key: string, value: T): Promise<void> {
  try {
    await withRetry(
      async () => {
        const jsonValue = JSON.stringify(value);
        await AsyncStorage.setItem(key, jsonValue);
      },
      'setItem',
      key
    );
  } catch (error) {
    logger.error('Error saving data after retries', error as Error, { key });
    throw new Error(`Failed to save data for key "${key}": ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function getItem<T>(key: string): Promise<T | null> {
  try {
    return await withRetry(
      async () => {
        const jsonValue = await AsyncStorage.getItem(key);
        if (jsonValue === null) return null;

        try {
          return JSON.parse(jsonValue) as T;
        } catch (parseError) {
          if (parseError instanceof SyntaxError) {
            // Corrupted data - clear it to prevent future issues
            logger.warn(`Corrupted data for key "${key}", clearing...`, { key });
            await AsyncStorage.removeItem(key).catch(() => {});
            throw new Error(`Corrupted data for key "${key}"`);
          }
          throw parseError;
        }
      },
      'getItem',
      key
    );
  } catch (error) {
    logger.error('Error reading data after retries', error as Error, { key });
    throw new Error(`Failed to read data for key "${key}": ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

export async function removeItem(key: string): Promise<void> {
  try {
    await withRetry(async () => {
      await AsyncStorage.removeItem(key);
    }, 'removeItem', key);
  } catch (error) {
    logger.error('Error removing data after retries', error as Error, { key });
    throw new Error(`Failed to remove data for key "${key}": ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}