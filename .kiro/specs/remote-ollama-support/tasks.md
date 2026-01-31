# Implementation Plan: Remote Ollama Support

## Overview

This implementation plan adds remote Ollama server support as an alternative LLM provider. The approach introduces a provider abstraction pattern, refactors the existing OpenAI integration into a provider implementation, creates a new Ollama provider, and updates the LLM service to orchestrate between providers based on configuration.

## Tasks

- [x] 1. Create provider interface and type definitions
  - Create `src/services/llm/types.ts` with LLMProvider interface, EnrichmentType, and error classes
  - Define configuration interfaces for both providers
  - Define request/response types
  - _Requirements: 6.1, 6.5_

- [-] 2. Refactor existing LLMService into OpenAIProvider
  - [x] 2.1 Create OpenAIProvider class implementing LLMProvider interface
    - Move existing OpenAI logic from LLMService to `src/services/llm/providers/OpenAIProvider.ts`
    - Implement all interface methods (enrich, validateConfig, getProviderName, healthCheck)
    - Preserve existing retry logic and error handling
    - _Requirements: 6.2, 8.2_
  
  - [ ]* 2.2 Write property test for OpenAI configuration loading
    - **Property 3: Configuration Loading**
    - **Validates: Requirements 2.1, 2.2**
  
  - [ ]* 2.3 Write unit tests for OpenAI provider
    - Test API key validation
    - Test prompt construction for each enrichment type
    - Test error handling for API failures
    - _Requirements: 7.2, 8.2_

- [ ] 3. Implement OllamaProvider
  - [x] 3.1 Create OllamaProvider class implementing LLMProvider interface
    - Create `src/services/llm/providers/OllamaProvider.ts`
    - Implement configuration loading with defaults (localhost:11434, llama2)
    - Implement validateConfig with URL validation
    - _Requirements: 2.1, 2.2, 2.3, 2.4, 2.5, 6.3_
  
  - [x] 3.2 Implement Ollama API request logic
    - Implement makeRequest method for /api/generate endpoint
    - Build request payload with model, prompt, and stream=false
    - Set Content-Type header to application/json
    - _Requirements: 3.1, 3.2, 3.5_
  
  - [x] 3.3 Implement response parsing and error handling
    - Parse JSON response and extract text from "response" field
    - Handle connection errors with descriptive messages
    - Handle 404 errors for missing models
    - _Requirements: 3.3, 3.4, 5.1, 5.2_
  
  - [ ]* 3.4 Write property test for URL validation
    - **Property 4: URL Validation**
    - **Validates: Requirements 2.5, 7.3**
  
  - [ ]* 3.5 Write property test for request structure
    - **Property 5: Request Structure Completeness**
    - **Validates: Requirements 3.1, 3.2, 3.5**
  
  - [ ]* 3.6 Write property test for response parsing
    - **Property 6: Response Parsing**
    - **Validates: Requirements 3.3**
  
  - [ ]* 3.7 Write unit tests for Ollama provider
    - Test default values (localhost:11434, llama2)
    - Test connection refused error message
    - Test 404 error message
    - _Requirements: 2.3, 2.4, 5.1, 5.2_

- [ ] 4. Implement retry logic with exponential backoff
  - [x] 4.1 Create retry utility function
    - Create `src/services/llm/utils/retry.ts`
    - Implement exponential backoff algorithm
    - Handle timeout errors with up to 3 retries
    - Skip retries for configuration errors
    - _Requirements: 5.3, 5.4_
  
  - [x] 4.2 Integrate retry logic into OllamaProvider
    - Wrap API requests with retry logic
    - Return error with retry count on exhaustion
    - _Requirements: 5.3, 5.4_
  
  - [ ]* 4.3 Write property test for retry logic
    - **Property 10: Retry with Exponential Backoff**
    - **Validates: Requirements 5.3**
  
  - [ ]* 4.4 Write unit test for retry exhaustion
    - Test error message includes retry count
    - Test last error message is preserved
    - _Requirements: 5.4_

- [x] 5. Implement prompt building for all enrichment types
  - [x] 5.1 Create shared prompt templates
    - Create `src/services/llm/prompts.ts` with templates for each enrichment type
    - Implement buildPrompt function that takes enrichment type and text
    - Support custom prompts for "custom" enrichment type
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 4.6, 4.7_
  
  - [x] 5.2 Integrate prompt building into both providers
    - Use shared prompt templates in OpenAIProvider
    - Use shared prompt templates in OllamaProvider
    - _Requirements: 4.7_
  
  - [ ]* 5.3 Write property test for custom prompt support
    - **Property 8: Custom Prompt Support**
    - **Validates: Requirements 4.6**
  
  - [ ]* 5.4 Write property test for prompt construction
    - **Property 9: Prompt Construction**
    - **Validates: Requirements 4.7**
  
  - [ ]* 5.5 Write unit tests for enrichment types
    - Test format enrichment type
    - Test summarize enrichment type
    - Test expand enrichment type
    - Test bullet-points enrichment type
    - Test action-items enrichment type
    - _Requirements: 4.1, 4.2, 4.3, 4.4, 4.5_

- [x] 6. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

- [x] 7. Refactor LLMService into provider orchestrator
  - [x] 7.1 Update LLMService to use provider abstraction
    - Modify `src/services/llm/LLMService.ts` to become orchestrator
    - Implement initializeProvider method with provider selection logic
    - Load LLM_PROVIDER environment variable
    - Default to OpenAI when not set or invalid
    - _Requirements: 1.1, 1.2, 1.3, 1.4, 1.5_
  
  - [x] 7.2 Implement configuration validation at startup
    - Validate required environment variables for selected provider
    - Log warnings for missing or invalid configuration
    - Perform health check for Ollama provider
    - _Requirements: 7.1, 7.2, 7.3, 7.4, 7.5_
  
  - [x] 7.3 Update enrich method to delegate to provider
    - Call provider.enrich() method
    - Add error logging with provider name, model, and error details
    - Return response with provider metadata
    - _Requirements: 5.5, 6.4_
  
  - [ ]* 7.4 Write property test for provider selection
    - **Property 1: Provider Selection Consistency**
    - **Validates: Requirements 1.1, 1.2, 1.3**
  
  - [ ]* 7.5 Write property test for invalid provider rejection
    - **Property 2: Invalid Provider Rejection**
    - **Validates: Requirements 1.5**
  
  - [ ]* 7.6 Write property test for error logging
    - **Property 11: Error Logging**
    - **Validates: Requirements 5.5**
  
  - [ ]* 7.7 Write property test for configuration validation
    - **Property 12: Configuration Validation and Logging**
    - **Validates: Requirements 7.1, 7.4**
  
  - [ ]* 7.8 Write unit tests for LLMService
    - Test default provider selection (no env var)
    - Test OpenAI provider selection
    - Test Ollama provider selection
    - Test invalid provider handling
    - Test OpenAI API key validation
    - Test Ollama health check
    - _Requirements: 1.2, 1.3, 1.4, 1.5, 7.2, 7.5_

- [x] 8. Update API endpoint for backward compatibility
  - [x] 8.1 Verify /api/enrich endpoint works with both providers
    - Test endpoint with OpenAI provider
    - Test endpoint with Ollama provider
    - Ensure response format is consistent
    - _Requirements: 8.3_
  
  - [ ]* 8.2 Write property test for API compatibility
    - **Property 13: API Endpoint Compatibility**
    - **Validates: Requirements 8.3**
  
  - [ ]* 8.3 Write unit tests for backward compatibility
    - Test existing OpenAI configuration still works
    - Test no configuration changes required for existing users
    - _Requirements: 8.1, 8.2_

- [x] 9. Add environment variable documentation
  - [x] 9.1 Create or update .env.example file
    - Document LLM_PROVIDER variable
    - Document OLLAMA_BASE_URL variable
    - Document OLLAMA_MODEL variable
    - Include examples for both providers
    - _Requirements: 1.1, 2.1, 2.2_
  
  - [x] 9.2 Update README.md with Ollama setup instructions
    - Add section on LLM provider configuration
    - Document how to switch between providers
    - Include Ollama server setup instructions
    - Document available Ollama models
    - _Requirements: 2.1, 2.2_

- [x] 10. Final checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- Checkpoints ensure incremental validation
- Property tests validate universal correctness properties with minimum 100 iterations
- Unit tests validate specific examples and edge cases
- The provider abstraction makes it easy to add more LLM providers in the future
