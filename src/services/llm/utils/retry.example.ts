/**
 * Example usage of retry utility
 * This file demonstrates how to use the retry utility with exponential backoff
 */

import { retryWithBackoff, createRetryWrapper } from './retry';
import { ConfigurationError, ConnectionError } from '../types';

// Example 1: Basic retry with default options
async function exampleBasicRetry() {
  let attempts = 0;
  
  const result = await retryWithBackoff(async () => {
    attempts++;
    console.log(`Attempt ${attempts}`);
    
    if (attempts < 3) {
      throw new Error('Temporary error');
    }
    
    return 'Success!';
  });
  
  console.log('Result:', result);
  // Output:
  // Attempt 1
  // Attempt 2 (after 1s delay)
  // Attempt 3 (after 2s delay)
  // Result: Success!
}

// Example 2: Configuration error (no retry)
async function exampleConfigurationError() {
  try {
    await retryWithBackoff(async () => {
      throw new ConfigurationError('Invalid API key', 'ollama');
    });
  } catch (error) {
    console.log('Error caught immediately:', error.message);
    // Output: Error caught immediately: Invalid API key
    // Note: No retries attempted
  }
}

// Example 3: Timeout error with retries
async function exampleTimeoutError() {
  let attempts = 0;
  
  try {
    await retryWithBackoff(
      async () => {
        attempts++;
        throw new ConnectionError('Request timeout', 'ollama');
      },
      { maxRetries: 3, baseDelay: 1000 }
    );
  } catch (error) {
    console.log('Final error after retries:', error.message);
    console.log('Total attempts:', attempts);
    // Output:
    // Final error after retries: Failed after 3 attempts. Last error: Request timeout
    // Total attempts: 3
  }
}

// Example 4: Using createRetryWrapper
async function exampleRetryWrapper() {
  const fetchData = async (url: string) => {
    console.log('Fetching:', url);
    // Simulate API call
    throw new Error('Network error');
  };
  
  const fetchWithRetry = createRetryWrapper(fetchData, {
    maxRetries: 3,
    baseDelay: 1000,
  });
  
  try {
    await fetchWithRetry('https://api.example.com/data');
  } catch (error) {
    console.log('Failed after retries:', error.message);
  }
}

// Example 5: Custom retry logic
async function exampleCustomRetry() {
  await retryWithBackoff(
    async () => {
      throw new Error('Custom error');
    },
    {
      maxRetries: 5,
      baseDelay: 500,
      maxDelay: 5000,
      shouldRetry: (error) => {
        // Only retry if error message contains "temporary"
        return error.message.includes('temporary');
      },
    }
  );
}

// Example 6: Exponential backoff demonstration
async function exampleExponentialBackoff() {
  let attempts = 0;
  const startTime = Date.now();
  
  try {
    await retryWithBackoff(
      async () => {
        attempts++;
        const elapsed = Date.now() - startTime;
        console.log(`Attempt ${attempts} at ${elapsed}ms`);
        throw new Error('Persistent error');
      },
      { maxRetries: 4, baseDelay: 1000 }
    );
  } catch (error) {
    console.log('Backoff delays:');
    console.log('- Attempt 1: immediate');
    console.log('- Attempt 2: after 1000ms (1s)');
    console.log('- Attempt 3: after 2000ms (2s)');
    console.log('- Attempt 4: after 4000ms (4s)');
  }
}

export {
  exampleBasicRetry,
  exampleConfigurationError,
  exampleTimeoutError,
  exampleRetryWrapper,
  exampleCustomRetry,
  exampleExponentialBackoff,
};
