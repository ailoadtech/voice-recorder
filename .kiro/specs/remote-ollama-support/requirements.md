# Requirements Document

## Introduction

This document specifies the requirements for adding remote Ollama server support to the Voice Intelligence Desktop App. The feature enables users to choose between OpenAI's GPT API and a remote Ollama server as their LLM provider for text enrichment, providing flexibility in deployment options and model selection.

## Glossary

- **LLM_Service**: The service component responsible for text enrichment using language models
- **Ollama_Server**: A remote server running the Ollama API for local LLM inference
- **OpenAI_Provider**: The existing LLM provider using OpenAI's GPT API
- **Ollama_Provider**: The new LLM provider using Ollama's API
- **Enrichment_Type**: The type of text processing requested (format, summarize, expand, bullet-points, action-items, custom)
- **Provider_Configuration**: Settings that specify which LLM provider to use and its connection parameters
- **Transcription**: The text output from voice-to-text conversion that requires enrichment

## Requirements

### Requirement 1: Provider Selection

**User Story:** As a user, I want to choose between OpenAI and Ollama as my LLM provider, so that I can use the service that best fits my needs and infrastructure.

#### Acceptance Criteria

1. WHEN the application starts, THE LLM_Service SHALL load the provider configuration from environment variables
2. WHERE the LLM_PROVIDER environment variable is set to "openai", THE LLM_Service SHALL use the OpenAI_Provider
3. WHERE the LLM_PROVIDER environment variable is set to "ollama", THE LLM_Service SHALL use the Ollama_Provider
4. IF the LLM_PROVIDER environment variable is not set, THEN THE LLM_Service SHALL default to the OpenAI_Provider
5. WHEN an invalid provider name is specified, THE LLM_Service SHALL return an error and log the invalid configuration

### Requirement 2: Ollama Server Configuration

**User Story:** As a user, I want to configure my Ollama server connection details, so that the application can communicate with my remote Ollama instance.

#### Acceptance Criteria

1. WHERE the Ollama_Provider is selected, THE LLM_Service SHALL read the OLLAMA_BASE_URL environment variable for the server address
2. WHERE the Ollama_Provider is selected, THE LLM_Service SHALL read the OLLAMA_MODEL environment variable for the model name
3. IF the OLLAMA_BASE_URL is not set, THEN THE Ollama_Provider SHALL default to "http://localhost:11434"
4. IF the OLLAMA_MODEL is not set, THEN THE Ollama_Provider SHALL default to "llama2"
5. WHEN the Ollama_Provider is initialized, THE system SHALL validate that the base URL is a valid HTTP/HTTPS URL

### Requirement 3: Ollama API Integration

**User Story:** As a developer, I want the system to correctly communicate with the Ollama API, so that text enrichment works seamlessly with Ollama models.

#### Acceptance Criteria

1. WHEN an enrichment request is made, THE Ollama_Provider SHALL send requests to the /api/generate endpoint
2. WHEN constructing the request payload, THE Ollama_Provider SHALL include the model name, prompt, and stream parameter set to false
3. WHEN receiving a response, THE Ollama_Provider SHALL parse the JSON response and extract the generated text from the "response" field
4. WHEN the Ollama server returns an error, THE Ollama_Provider SHALL parse the error message and return a descriptive error
5. THE Ollama_Provider SHALL set appropriate HTTP headers including "Content-Type: application/json"

### Requirement 4: Enrichment Type Support

**User Story:** As a user, I want all enrichment types to work with Ollama, so that I have feature parity regardless of which provider I choose.

#### Acceptance Criteria

1. WHEN using the Ollama_Provider, THE system SHALL support the "format" enrichment type
2. WHEN using the Ollama_Provider, THE system SHALL support the "summarize" enrichment type
3. WHEN using the Ollama_Provider, THE system SHALL support the "expand" enrichment type
4. WHEN using the Ollama_Provider, THE system SHALL support the "bullet-points" enrichment type
5. WHEN using the Ollama_Provider, THE system SHALL support the "action-items" enrichment type
6. WHEN using the Ollama_Provider, THE system SHALL support the "custom" enrichment type with user-provided prompts
7. FOR ALL enrichment types, THE Ollama_Provider SHALL construct appropriate prompts that match the enrichment intent

### Requirement 5: Error Handling and Resilience

**User Story:** As a user, I want clear error messages when the Ollama server is unavailable, so that I can troubleshoot connection issues.

#### Acceptance Criteria

1. WHEN the Ollama server is unreachable, THE Ollama_Provider SHALL return an error indicating the connection failure
2. WHEN the Ollama server returns a 404 error, THE Ollama_Provider SHALL return an error indicating the endpoint or model was not found
3. WHEN the Ollama server returns a timeout, THE Ollama_Provider SHALL retry the request up to 3 times with exponential backoff
4. WHEN all retry attempts fail, THE Ollama_Provider SHALL return an error with the retry count and last error message
5. WHEN an enrichment request fails, THE system SHALL log the error details including provider type, model name, and error message

### Requirement 6: Provider Abstraction

**User Story:** As a developer, I want a clean abstraction between LLM providers, so that adding new providers in the future is straightforward.

#### Acceptance Criteria

1. THE system SHALL define a common interface for all LLM providers
2. THE OpenAI_Provider SHALL implement the common LLM provider interface
3. THE Ollama_Provider SHALL implement the common LLM provider interface
4. WHEN the LLM_Service receives an enrichment request, THE system SHALL delegate to the configured provider without provider-specific logic in the service layer
5. THE common interface SHALL include methods for enrichment, error handling, and status checking

### Requirement 7: Configuration Validation

**User Story:** As a user, I want the application to validate my configuration at startup, so that I know immediately if my settings are incorrect.

#### Acceptance Criteria

1. WHEN the application starts, THE system SHALL validate all required environment variables for the selected provider
2. WHERE the OpenAI_Provider is selected, THE system SHALL verify that OPENAI_API_KEY is set
3. WHERE the Ollama_Provider is selected, THE system SHALL verify that OLLAMA_BASE_URL is a valid URL format
4. WHEN configuration validation fails, THE system SHALL log a warning message with details about the missing or invalid configuration
5. WHEN the Ollama_Provider is selected, THE system SHALL attempt a health check request to the Ollama server during initialization

### Requirement 8: Backward Compatibility

**User Story:** As an existing user, I want the application to continue working with OpenAI without any configuration changes, so that my workflow is not disrupted.

#### Acceptance Criteria

1. WHEN no LLM_PROVIDER environment variable is set, THE system SHALL use the OpenAI_Provider as the default
2. WHEN existing OpenAI environment variables are present, THE system SHALL continue to function without requiring new configuration
3. THE existing /api/enrich endpoint SHALL continue to work with both providers without API changes
4. THE existing enrichment types SHALL produce equivalent results regardless of the provider used
