/**
 * Retry Utility with Exponential Backoff
 * Provides retry logic for LLM provider requests with exponential backoff
 */

import { ConfigurationError } from '../types';

/**
 * Retry options
 */
export interface RetryOptions {
  maxRetries: number;
  baseDelay: number;
  maxDelay?: number;
  shouldRetry?: (error: Error) => boolean;
}

/**
 * Default retry options
 */
const DEFAULT_RETRY_OPTIONS: RetryOptions = {
  maxRetries: 3,
  baseDelay: 1000, // 1 second
  maxDelay: 10000, // 10 seconds
};

/**
 * Determines if an error should be retried
 * Configuration errors should not be retried
 */
function shouldRetryError(error: Error): boolean {
  // Don't retry configuration errors
  if (error instanceof ConfigurationError) {
    return false;
  }

  // Don't retry if error name indicates a configuration issue
  if (error.name === 'ConfigurationError') {
    return false;
  }

  // Retry all other errors (timeout, connection, API errors)
  return true;
}

/**
 * Calculates the delay for the next retry attempt using exponential backoff
 * @param attempt - The current attempt number (0-indexed)
 * @param baseDelay - The base delay in milliseconds
 * @param maxDelay - The maximum delay in milliseconds
 * @returns The delay in milliseconds
 */
function calculateBackoffDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number = 10000
): number {
  // Exponential backoff: baseDelay * 2^attempt
  const delay = baseDelay * Math.pow(2, attempt);
  
  // Cap at maxDelay
  return Math.min(delay, maxDelay);
}

/**
 * Retries a function with exponential backoff
 * @param fn - The async function to retry
 * @param options - Retry options
 * @returns Promise resolving to the function result
 * @throws Error if all retry attempts fail
 */
export async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  options: Partial<RetryOptions> = {}
): Promise<T> {
  const opts: RetryOptions = {
    ...DEFAULT_RETRY_OPTIONS,
    ...options,
  };

  let lastError: Error | undefined;
  const shouldRetry = opts.shouldRetry || shouldRetryError;

  for (let attempt = 0; attempt < opts.maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error as Error;

      // Check if we should retry this error
      if (!shouldRetry(lastError)) {
        throw lastError;
      }

      // If this is the last attempt, don't wait
      if (attempt === opts.maxRetries - 1) {
        break;
      }

      // Calculate delay with exponential backoff
      const delay = calculateBackoffDelay(
        attempt,
        opts.baseDelay,
        opts.maxDelay
      );

      // Wait before retrying
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }

  // All retries exhausted
  throw new Error(
    `Failed after ${opts.maxRetries} attempts. Last error: ${lastError?.message || 'Unknown error'}`
  );
}

/**
 * Creates a retry wrapper for a function with specific retry options
 * @param fn - The async function to wrap
 * @param options - Retry options
 * @returns A wrapped function that retries on failure
 */
export function createRetryWrapper<T extends (...args: any[]) => Promise<any>>(
  fn: T,
  options: Partial<RetryOptions> = {}
): T {
  return (async (...args: Parameters<T>): Promise<ReturnType<T>> => {
    return retryWithBackoff(() => fn(...args), options);
  }) as T;
}
