/**
 * Input Validation Utilities
 * 
 * Provides validation functions for audio input, API responses,
 * configuration, and graceful degradation handling.
 */

/**
 * Audio validation result
 */
export interface AudioValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * API response validation result
 */
export interface ApiValidationResult<T = any> {
  valid: boolean;
  data?: T;
  errors: string[];
}

/**
 * Configuration validation result
 */
export interface ConfigValidationResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
}

/**
 * Validates audio blob for recording
 */
export function validateAudioBlob(blob: Blob | null): AudioValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!blob) {
    errors.push('Audio blob is null or undefined');
    return { valid: false, errors, warnings };
  }

  // Check blob size
  if (blob.size === 0) {
    errors.push('Audio blob is empty (0 bytes)');
  } else if (blob.size < 100) {
    warnings.push('Audio blob is very small, may not contain valid audio');
  }

  // Check blob type
  if (!blob.type) {
    warnings.push('Audio blob has no MIME type specified');
  } else if (!blob.type.startsWith('audio/') && !blob.type.startsWith('video/')) {
    errors.push(`Invalid MIME type: ${blob.type}. Expected audio/* or video/*`);
  }

  // Size limits (max 25MB for most APIs)
  const maxSize = 25 * 1024 * 1024; // 25MB
  if (blob.size > maxSize) {
    errors.push(`Audio blob too large: ${(blob.size / 1024 / 1024).toFixed(2)}MB (max 25MB)`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates audio duration
 */
export function validateAudioDuration(duration: number | null): AudioValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (duration === null || duration === undefined) {
    errors.push('Audio duration is null or undefined');
    return { valid: false, errors, warnings };
  }

  if (duration < 0) {
    errors.push('Audio duration cannot be negative');
  } else if (duration === 0) {
    errors.push('Audio duration is zero');
  } else if (duration < 1000) {
    warnings.push('Audio duration is very short (< 1 second)');
  }

  // Max duration (most APIs have limits)
  const maxDuration = 10 * 60 * 1000; // 10 minutes
  if (duration > maxDuration) {
    warnings.push(`Audio duration is very long: ${(duration / 1000 / 60).toFixed(1)} minutes`);
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates transcription API response
 */
export function validateTranscriptionResponse(response: any): ApiValidationResult {
  const errors: string[] = [];

  if (!response) {
    errors.push('Response is null or undefined');
    return { valid: false, errors };
  }

  if (typeof response !== 'object') {
    errors.push('Response is not an object');
    return { valid: false, errors };
  }

  // Check for required fields
  if (!response.text && response.text !== '') {
    errors.push('Response missing required field: text');
  }

  if (typeof response.text !== 'string') {
    errors.push('Response field "text" must be a string');
  }

  // Optional fields validation
  if (response.language && typeof response.language !== 'string') {
    errors.push('Response field "language" must be a string');
  }

  if (response.duration !== undefined && typeof response.duration !== 'number') {
    errors.push('Response field "duration" must be a number');
  }

  return {
    valid: errors.length === 0,
    data: errors.length === 0 ? response : undefined,
    errors,
  };
}

/**
 * Validates LLM enrichment API response
 */
export function validateEnrichmentResponse(response: any): ApiValidationResult {
  const errors: string[] = [];

  if (!response) {
    errors.push('Response is null or undefined');
    return { valid: false, errors };
  }

  if (typeof response !== 'object') {
    errors.push('Response is not an object');
    return { valid: false, errors };
  }

  // Check for required fields
  if (!response.enrichedText && response.enrichedText !== '') {
    errors.push('Response missing required field: enrichedText');
  }

  if (typeof response.enrichedText !== 'string') {
    errors.push('Response field "enrichedText" must be a string');
  }

  if (!response.originalText && response.originalText !== '') {
    errors.push('Response missing required field: originalText');
  }

  if (!response.enrichmentType) {
    errors.push('Response missing required field: enrichmentType');
  }

  return {
    valid: errors.length === 0,
    data: errors.length === 0 ? response : undefined,
    errors,
  };
}

/**
 * Validates API key format
 */
export function validateApiKey(key: string | undefined, provider: string): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!key) {
    errors.push(`${provider} API key is missing`);
    return { valid: false, errors, warnings };
  }

  if (typeof key !== 'string') {
    errors.push(`${provider} API key must be a string`);
    return { valid: false, errors, warnings };
  }

  if (key.trim().length === 0) {
    errors.push(`${provider} API key is empty`);
    return { valid: false, errors, warnings };
  }

  // Provider-specific validation
  if (provider === 'OpenAI') {
    if (!key.startsWith('sk-')) {
      warnings.push('OpenAI API key should start with "sk-"');
    }
    if (key.length < 20) {
      warnings.push('OpenAI API key seems too short');
    }
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates environment configuration
 */
export function validateEnvironmentConfig(config: Record<string, any>): ConfigValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  // Check required API keys
  const openAiValidation = validateApiKey(config.OPENAI_API_KEY, 'OpenAI');
  errors.push(...openAiValidation.errors);
  warnings.push(...openAiValidation.warnings);

  // Check optional configurations
  if (config.WHISPER_MODEL && typeof config.WHISPER_MODEL !== 'string') {
    errors.push('WHISPER_MODEL must be a string');
  }

  if (config.GPT_MODEL && typeof config.GPT_MODEL !== 'string') {
    errors.push('GPT_MODEL must be a string');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}

/**
 * Validates text input for enrichment
 */
export function validateTextInput(text: string | null | undefined): ApiValidationResult {
  const errors: string[] = [];

  if (!text) {
    errors.push('Text input is null or undefined');
    return { valid: false, errors };
  }

  if (typeof text !== 'string') {
    errors.push('Text input must be a string');
    return { valid: false, errors };
  }

  if (text.trim().length === 0) {
    errors.push('Text input is empty');
    return { valid: false, errors };
  }

  // Check length limits (most LLMs have token limits)
  const maxLength = 100000; // ~25k tokens for GPT-4
  if (text.length > maxLength) {
    errors.push(`Text input too long: ${text.length} characters (max ${maxLength})`);
  }

  return {
    valid: errors.length === 0,
    data: text,
    errors,
  };
}

/**
 * Graceful degradation handler
 */
export interface DegradationOptions {
  fallbackValue?: any;
  logError?: boolean;
  throwError?: boolean;
}

/**
 * Handles graceful degradation when validation fails
 */
export function handleValidationFailure<T>(
  validationResult: ApiValidationResult<T> | AudioValidationResult | ConfigValidationResult,
  context: string,
  options: DegradationOptions = {}
): T | null {
  const { fallbackValue = null, logError = true, throwError = false } = options;

  if (validationResult.valid) {
    return 'data' in validationResult ? validationResult.data || null : null;
  }

  // Log errors
  if (logError) {
    console.error(`Validation failed in ${context}:`, validationResult.errors);
    if ('warnings' in validationResult && validationResult.warnings.length > 0) {
      console.warn(`Validation warnings in ${context}:`, validationResult.warnings);
    }
  }

  // Throw error if requested
  if (throwError) {
    throw new Error(`Validation failed in ${context}: ${validationResult.errors.join(', ')}`);
  }

  // Return fallback value
  return fallbackValue;
}

/**
 * Validates MediaStream for recording
 */
export function validateMediaStream(stream: MediaStream | null): AudioValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!stream) {
    errors.push('MediaStream is null or undefined');
    return { valid: false, errors, warnings };
  }

  // Check for audio tracks
  const audioTracks = stream.getAudioTracks();
  if (audioTracks.length === 0) {
    errors.push('MediaStream has no audio tracks');
  }

  // Check track states
  audioTracks.forEach((track, index) => {
    if (track.readyState !== 'live') {
      warnings.push(`Audio track ${index} is not live (state: ${track.readyState})`);
    }
    if (!track.enabled) {
      warnings.push(`Audio track ${index} is disabled`);
    }
    if (track.muted) {
      warnings.push(`Audio track ${index} is muted`);
    }
  });

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
