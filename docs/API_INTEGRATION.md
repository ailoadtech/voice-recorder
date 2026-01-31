# API Integration Guide

## Overview

This document provides detailed information about the external API integrations used in the Voice Intelligence Desktop App.

## Table of Contents

1. [OpenAI Whisper API](#openai-whisper-api)
2. [OpenAI GPT-4 API](#openai-gpt-4-api)
3. [Authentication](#authentication)
4. [Error Handling](#error-handling)
5. [Rate Limiting](#rate-limiting)
6. [Best Practices](#best-practices)

## OpenAI Whisper API

### Purpose

Convert audio recordings to text transcriptions with high accuracy across multiple languages.

### Endpoint

```
POST https://api.openai.com/v1/audio/transcriptions
```

### Authentication

```http
Authorization: Bearer YOUR_API_KEY
```

### Request Format

**Content-Type:** `multipart/form-data`

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `file` | File | Yes | Audio file (mp3, mp4, mpeg, mpga, m4a, wav, webm) |
| `model` | String | Yes | Model ID (use "whisper-1") |
| `language` | String | No | ISO-639-1 language code (e.g., "en", "es") |
| `prompt` | String | No | Optional text to guide the model's style |
| `response_format` | String | No | Format of output (json, text, srt, vtt) |
| `temperature` | Number | No | Sampling temperature (0-1) |

### Example Request

```typescript
const formData = new FormData();
formData.append('file', audioBlob, 'recording.webm');
formData.append('model', 'whisper-1');
formData.append('language', 'en');

const response = await fetch('https://api.openai.com/v1/audio/transcriptions', {
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
  },
  body: formData,
});

const result = await response.json();
```

### Response Format

**Success (200 OK):**

```json
{
  "text": "This is the transcribed text from the audio file."
}
```

**With Segments (verbose_json format):**

```json
{
  "task": "transcribe",
  "language": "english",
  "duration": 12.5,
  "text": "This is the transcribed text.",
  "segments": [
    {
      "id": 0,
      "seek": 0,
      "start": 0.0,
      "end": 3.5,
      "text": "This is the transcribed",
      "tokens": [50364, 50365, ...],
      "temperature": 0.0,
      "avg_logprob": -0.3,
      "compression_ratio": 1.2,
      "no_speech_prob": 0.01
    }
  ]
}
```

### Error Responses

**400 Bad Request:**
```json
{
  "error": {
    "message": "Invalid file format",
    "type": "invalid_request_error",
    "param": "file",
    "code": null
  }
}
```

**401 Unauthorized:**
```json
{
  "error": {
    "message": "Incorrect API key provided",
    "type": "invalid_request_error",
    "param": null,
    "code": "invalid_api_key"
  }
}
```

**429 Rate Limit:**
```json
{
  "error": {
    "message": "Rate limit exceeded",
    "type": "rate_limit_error",
    "param": null,
    "code": "rate_limit_exceeded"
  }
}
```

### Limitations

- **Max File Size:** 25 MB
- **Supported Formats:** mp3, mp4, mpeg, mpga, m4a, wav, webm
- **Rate Limit:** 50 requests per minute (free tier)
- **Max Audio Length:** ~2 hours

### Implementation

**Location:** `src/services/transcription/TranscriptionService.ts`

**Key Methods:**
- `transcribe(audioBlob: Blob, options?: TranscriptionOptions): Promise<TranscriptionResult>`
- `getStatus(): TranscriptionStatus`
- `cancel(): void`

**Error Handling:**
```typescript
try {
  const result = await transcriptionService.transcribe(audioBlob);
  console.log('Transcription:', result.text);
} catch (error) {
  if (error.code === 'RATE_LIMIT') {
    // Handle rate limit
  } else if (error.code === 'AUTHENTICATION_ERROR') {
    // Handle auth error
  }
}
```

## OpenAI GPT-4 API

### Purpose

Enrich transcribed text with AI-powered processing (formatting, summarization, expansion, etc.).

### Endpoint

```
POST https://api.openai.com/v1/chat/completions
```

### Authentication

```http
Authorization: Bearer YOUR_API_KEY
Content-Type: application/json
```

### Request Format

**Parameters:**

| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `model` | String | Yes | Model ID (e.g., "gpt-4", "gpt-3.5-turbo") |
| `messages` | Array | Yes | Array of message objects |
| `temperature` | Number | No | Sampling temperature (0-2, default: 1) |
| `max_tokens` | Number | No | Maximum tokens to generate |
| `top_p` | Number | No | Nucleus sampling parameter (0-1) |
| `frequency_penalty` | Number | No | Penalize frequent tokens (-2 to 2) |
| `presence_penalty` | Number | No | Penalize new topics (-2 to 2) |
| `stop` | Array | No | Stop sequences |

### Message Format

```typescript
interface Message {
  role: 'system' | 'user' | 'assistant';
  content: string;
}
```

### Example Request

```typescript
const requestBody = {
  model: 'gpt-4',
  messages: [
    {
      role: 'system',
      content: 'You are a helpful assistant that formats text.'
    },
    {
      role: 'user',
      content: 'Format this text: [user input]'
    }
  ],
  temperature: 0.7,
  max_tokens: 2000
};

const response = await fetch('https://api.openai.com/v1/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${apiKey}`,
  },
  body: JSON.stringify(requestBody),
});

const result = await response.json();
```

### Response Format

**Success (200 OK):**

```json
{
  "id": "chatcmpl-123",
  "object": "chat.completion",
  "created": 1677652288,
  "model": "gpt-4",
  "choices": [
    {
      "index": 0,
      "message": {
        "role": "assistant",
        "content": "This is the AI-generated response."
      },
      "finish_reason": "stop"
    }
  ],
  "usage": {
    "prompt_tokens": 56,
    "completion_tokens": 31,
    "total_tokens": 87
  }
}
```

### Error Responses

**400 Bad Request:**
```json
{
  "error": {
    "message": "Invalid request format",
    "type": "invalid_request_error",
    "param": "messages",
    "code": null
  }
}
```

**401 Unauthorized:**
```json
{
  "error": {
    "message": "Invalid API key",
    "type": "invalid_request_error",
    "param": null,
    "code": "invalid_api_key"
  }
}
```

**429 Rate Limit:**
```json
{
  "error": {
    "message": "Rate limit exceeded",
    "type": "rate_limit_error",
    "param": null,
    "code": "rate_limit_exceeded"
  }
}
```

**500 Server Error:**
```json
{
  "error": {
    "message": "The server had an error processing your request",
    "type": "server_error",
    "param": null,
    "code": null
  }
}
```

### Limitations

- **Max Tokens:** 8,192 (GPT-4), 4,096 (GPT-3.5-turbo)
- **Rate Limit:** 10,000 requests per minute (paid tier)
- **Context Window:** Includes both input and output tokens
- **Cost:** Varies by model and token usage

### Token Estimation

Rough estimate: ~4 characters per token

```typescript
function estimateTokens(text: string): number {
  return Math.ceil(text.length / 4);
}
```

### Implementation

**Location:** `src/services/llm/LLMService.ts`

**Key Methods:**
- `enrich(text: string, options: EnrichmentOptions): Promise<EnrichmentResult>`
- `getStatus(): LLMStatus`
- `cancel(): void`
- `isAvailable(): Promise<boolean>`

**Enrichment Types:**

1. **Format:** Clean up and format text
2. **Summarize:** Create concise summary
3. **Expand:** Add detail and context
4. **Bullet Points:** Convert to list format
5. **Action Items:** Extract actionable tasks
6. **Custom:** User-defined prompts

**Example Usage:**

```typescript
const llmService = new LLMService();

const result = await llmService.enrich(transcribedText, {
  type: 'summarize',
  temperature: 0.7,
  maxTokens: 500
});

console.log('Enriched:', result.enrichedText);
```

## Authentication

### API Key Setup

1. **Obtain API Key:**
   - Visit https://platform.openai.com/api-keys
   - Create new API key
   - Copy key securely

2. **Configure Environment:**
   ```bash
   # .env.local
   OPENAI_API_KEY=sk-...your-key-here...
   ```

3. **Verify Configuration:**
   ```typescript
   import { getGPTApiKey } from '@/lib/env';
   
   const apiKey = getGPTApiKey();
   if (!apiKey) {
     console.error('API key not configured');
   }
   ```

### Security Best Practices

- **Never commit API keys** to version control
- **Use environment variables** for all sensitive data
- **Rotate keys regularly** (every 90 days)
- **Monitor API usage** for unusual activity
- **Set usage limits** in OpenAI dashboard
- **Use separate keys** for development and production

## Error Handling

### Error Types

```typescript
interface APIError {
  name: 'TranscriptionError' | 'LLMError';
  code: 'API_ERROR' | 'NETWORK_ERROR' | 'RATE_LIMIT' | 
        'AUTHENTICATION_ERROR' | 'INVALID_INPUT' | 'UNKNOWN_ERROR';
  message: string;
  statusCode?: number;
  retryable: boolean;
}
```

### Retry Strategy

**Exponential Backoff:**

```typescript
async function retryWithBackoff<T>(
  fn: () => Promise<T>,
  maxRetries: number = 3
): Promise<T> {
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (error) {
      if (!error.retryable || attempt === maxRetries) {
        throw error;
      }
      
      const delay = 1000 * Math.pow(2, attempt - 1);
      await sleep(delay);
    }
  }
}
```

### Error Recovery

1. **Network Errors:** Retry with exponential backoff
2. **Rate Limits:** Wait and retry after delay
3. **Auth Errors:** Prompt user to check API key
4. **Invalid Input:** Show validation error to user
5. **Server Errors:** Retry with backoff

## Rate Limiting

### OpenAI Rate Limits

**Whisper API:**
- Free Tier: 50 requests/minute
- Paid Tier: Higher limits based on usage tier

**GPT-4 API:**
- Tier 1: 500 requests/minute
- Tier 2: 5,000 requests/minute
- Tier 3: 10,000 requests/minute

### Handling Rate Limits

**Detection:**
```typescript
if (response.status === 429) {
  const retryAfter = response.headers.get('Retry-After');
  // Wait and retry
}
```

**Prevention:**
- Implement request queuing
- Add delays between requests
- Cache responses when possible
- Batch requests when appropriate

## Best Practices

### 1. Request Optimization

**Audio Files:**
- Compress audio before upload
- Use appropriate format (webm recommended)
- Trim silence from recordings
- Limit file size to < 10MB when possible

**Text Prompts:**
- Keep prompts concise
- Use clear instructions
- Provide context when needed
- Avoid redundant information

### 2. Response Handling

**Validation:**
```typescript
function validateResponse(response: any): boolean {
  return response && 
         response.text && 
         typeof response.text === 'string' &&
         response.text.length > 0;
}
```

**Error Logging:**
```typescript
function logAPIError(error: APIError): void {
  console.error('API Error:', {
    code: error.code,
    message: error.message,
    statusCode: error.statusCode,
    timestamp: new Date().toISOString()
  });
}
```

### 3. Cost Management

**Monitor Usage:**
- Track API calls per day/month
- Monitor token usage
- Set budget alerts in OpenAI dashboard
- Implement usage caps in application

**Optimize Costs:**
- Use GPT-3.5-turbo for simple tasks
- Cache frequent requests
- Implement client-side validation
- Batch similar requests

### 4. Testing

**Mock API Responses:**
```typescript
// For testing
const mockTranscriptionService = {
  transcribe: jest.fn().mockResolvedValue({
    text: 'Mock transcription',
    language: 'en',
    duration: 10
  })
};
```

**Integration Tests:**
- Test with real API in CI/CD
- Use test API keys
- Verify error handling
- Check rate limit handling

## Troubleshooting

### Common Issues

**1. Authentication Errors**
- Verify API key is correct
- Check key hasn't expired
- Ensure key has proper permissions

**2. Rate Limit Errors**
- Implement exponential backoff
- Add request queuing
- Upgrade API tier if needed

**3. Network Errors**
- Check internet connection
- Verify API endpoint is accessible
- Check for firewall/proxy issues

**4. Invalid Audio Format**
- Convert to supported format
- Check file size < 25MB
- Verify audio is not corrupted

### Debug Mode

Enable detailed logging:

```typescript
// .env.local
DEBUG_API_CALLS=true
```

```typescript
if (process.env.DEBUG_API_CALLS === 'true') {
  console.log('API Request:', {
    endpoint,
    method,
    headers,
    body
  });
}
```

## Conclusion

This guide provides comprehensive information for integrating with OpenAI's APIs. Follow the best practices and error handling strategies to build a robust and reliable application.

For more information, visit:
- [OpenAI API Documentation](https://platform.openai.com/docs)
- [OpenAI API Reference](https://platform.openai.com/docs/api-reference)
- [OpenAI Community Forum](https://community.openai.com/)
