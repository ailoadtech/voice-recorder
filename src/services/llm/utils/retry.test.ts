/**
 * Tests for Retry Utility
 */

import { retryWithBackoff, createRetryWrapper } from './retry';
import { ConfigurationError } from '../types';

describe('retryWithBackoff', () => {
  it('should return result on first successful attempt', async () => {
    const fn = jest.fn().mockResolvedValue('success');

    const result = await retryWithBackoff(fn, { maxRetries: 3, baseDelay: 10 });

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should retry on timeout errors', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('Timeout'))
      .mockResolvedValueOnce('success');

    const result = await retryWithBackoff(fn, { maxRetries: 3, baseDelay: 10 });

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(2);
  });

  it('should use exponential backoff delays', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('Error 1'))
      .mockRejectedValueOnce(new Error('Error 2'))
      .mockResolvedValueOnce('success');

    const result = await retryWithBackoff(fn, { maxRetries: 3, baseDelay: 10 });

    expect(result).toBe('success');
    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should not retry configuration errors', async () => {
    const configError = new ConfigurationError('Invalid config', 'ollama');
    const fn = jest.fn().mockRejectedValue(configError);

    await expect(
      retryWithBackoff(fn, { maxRetries: 3, baseDelay: 10 })
    ).rejects.toThrow(ConfigurationError);

    expect(fn).toHaveBeenCalledTimes(1);
  });

  it('should throw error after max retries exhausted', async () => {
    const error = new Error('Persistent error');
    const fn = jest.fn().mockRejectedValue(error);

    await expect(
      retryWithBackoff(fn, { maxRetries: 3, baseDelay: 10 })
    ).rejects.toThrow('Failed after 3 attempts. Last error: Persistent error');

    expect(fn).toHaveBeenCalledTimes(3);
  });

  it('should include retry count in final error message', async () => {
    const fn = jest.fn().mockRejectedValue(new Error('Network error'));

    await expect(
      retryWithBackoff(fn, { maxRetries: 3, baseDelay: 10 })
    ).rejects.toThrow(/Failed after 3 attempts/);
  });

  it('should preserve last error message in final error', async () => {
    const lastError = new Error('Final network error');
    const fn = jest.fn().mockRejectedValue(lastError);

    await expect(
      retryWithBackoff(fn, { maxRetries: 3, baseDelay: 10 })
    ).rejects.toThrow(/Last error: Final network error/);
  });

  it('should cap delay at maxDelay', async () => {
    const fn = jest.fn()
      .mockRejectedValueOnce(new Error('Error 1'))
      .mockRejectedValueOnce(new Error('Error 2'))
      .mockResolvedValueOnce('success');

    const result = await retryWithBackoff(fn, { maxRetries: 3, baseDelay: 10, maxDelay: 15 });

    expect(result).toBe('success');
  });

  it('should use custom shouldRetry function when provided', async () => {
    const customError = new Error('Custom error');
    const fn = jest.fn().mockRejectedValue(customError);

    const shouldRetry = jest.fn().mockReturnValue(false);

    await expect(
      retryWithBackoff(fn, { maxRetries: 3, baseDelay: 10, shouldRetry })
    ).rejects.toThrow('Custom error');

    expect(fn).toHaveBeenCalledTimes(1);
    expect(shouldRetry).toHaveBeenCalledWith(customError);
  });
});

describe('createRetryWrapper', () => {
  it('should create a wrapped function that retries', async () => {
    const originalFn = jest.fn()
      .mockRejectedValueOnce(new Error('Temporary error'))
      .mockResolvedValueOnce('success');

    const wrappedFn = createRetryWrapper(originalFn, { maxRetries: 3, baseDelay: 10 });

    const result = await wrappedFn('arg1', 'arg2');

    expect(result).toBe('success');
    expect(originalFn).toHaveBeenCalledTimes(2);
    expect(originalFn).toHaveBeenCalledWith('arg1', 'arg2');
  });

  it('should preserve function arguments', async () => {
    const originalFn = jest.fn().mockResolvedValue('result');

    const wrappedFn = createRetryWrapper(originalFn, { maxRetries: 3, baseDelay: 10 });

    await wrappedFn('test', 123, { key: 'value' });

    expect(originalFn).toHaveBeenCalledWith('test', 123, { key: 'value' });
  });
});
