# Implementation Plan: Local Whisper Support

## Overview

This implementation plan breaks down the local Whisper model support feature into discrete coding tasks. The approach follows a layered architecture: first establishing the Rust backend for Whisper integration, then building the TypeScript service layer, and finally implementing the UI components. Each task builds incrementally, with testing integrated throughout to validate functionality early.

## Tasks

- [ ] 1. Set up Rust backend for Whisper integration
  - [x] 1.1 Add whisper.cpp dependencies to Cargo.toml
    - Add whisper-rs or whisper.cpp bindings
    - Configure build dependencies for native compilation
    - _Requirements: 4.1, 4.4_
  
  - [x] 1.2 Create Whisper context management module in Rust
    - Implement WhisperContext struct for model lifecycle
    - Add load_whisper_model Tauri command
    - Add unload_whisper_model Tauri command
    - Implement thread-safe model instance storage
    - _Requirements: 4.1, 4.6, 10.2_
  
  - [ ]* 1.3 Write property test for model loading
    - **Property 11: Model Loading Before Transcription**
    - **Validates: Requirements 4.1**
  
  - [x] 1.4 Implement audio transcription in Rust
    - Create transcribe_audio Tauri command
    - Convert Float32Array audio data to whisper.cpp format
    - Execute inference with progress callbacks
    - Return transcribed text to TypeScript layer
    - _Requirements: 4.3, 4.4_
  
  - [ ]* 1.5 Write property test for audio length support
    - **Property 12: Audio Length Support**
    - **Validates: Requirements 4.4**

- [ ] 2. Implement file system operations for model management
  - [x] 2.1 Create file utility Tauri commands
    - Implement file_exists command
    - Implement delete_file command
    - Implement calculate_file_checksum command (SHA-256)
    - Implement get_available_disk_space command
    - Implement get_models_directory command (platform-specific app data)
    - _Requirements: 1.3, 1.5, 1.7, 7.4_
  
  - [x] 2.2 Implement model download with progress tracking
    - Create download_model Tauri command
    - Stream download with progress events
    - Validate checksum after download
    - Handle partial downloads and cleanup on failure
    - _Requirements: 1.1, 1.2, 1.3, 1.4_
  
  - [ ]* 2.3 Write property test for download progress
    - **Property 2: Download Progress Reporting**
    - **Validates: Requirements 1.2, 4.2**
  
  - [ ]* 2.4 Write property test for post-download validation
    - **Property 3: Post-Download Validation**
    - **Validates: Requirements 1.3**
  
  - [ ]* 2.5 Write property test for corrupted file cleanup
    - **Property 4: Corrupted File Cleanup**
    - **Validates: Requirements 1.4**

- [x] 3. Build ModelManager TypeScript service
  - [x] 3.1 Create ModelManager class with metadata definitions
    - Define MODEL_METADATA constant with all variants (tiny, base, small, medium, large)
    - Include size, checksum, downloadUrl, accuracy, estimatedSpeed for each
    - Implement getModelMetadata and getAllModelMetadata methods
    - _Requirements: 7.1, 7.2, 7.3, 3.3_
  
  - [x] 3.2 Implement model download orchestration
    - Create downloadModel method with progress callback
    - Invoke Rust download_model command
    - Handle download errors and cleanup
    - Emit progress events to UI
    - _Requirements: 1.1, 1.2, 9.1_
  
  - [x] 3.3 Implement model validation and status checking
    - Create validateModel method using checksum verification
    - Create isModelDownloaded method
    - Create deleteModel method
    - _Requirements: 1.3, 1.4, 1.7_
  
  - [ ]* 3.4 Write property test for consistent storage location
    - **Property 5: Consistent Storage Location**
    - **Validates: Requirements 1.5**
  
  - [ ]* 3.5 Write property test for model deletion
    - **Property 6: Model Deletion Removes Files**
    - **Validates: Requirements 1.7**
  
  - [x] 3.6 Add disk space checking functionality
    - Implement getAvailableDiskSpace method
    - Add helper to check if model fits in available space
    - _Requirements: 7.4, 9.3_

- [ ] 4. Implement LocalWhisperProvider
  - [x] 4.1 Create LocalWhisperProvider class implementing TranscriptionProvider interface
    - Define WhisperModel interface
    - Implement transcribe method
    - Implement isAvailable method
    - Implement getStatus method
    - _Requirements: 2.1, 2.4, 4.3_
  
  - [x] 4.2 Implement model loading and caching logic
    - Create ensureModelLoaded private method
    - Create loadModel method invoking Rust backend
    - Implement model reuse for subsequent transcriptions
    - Add currentModel state tracking
    - _Requirements: 4.1, 4.6_
  
  - [ ]* 4.3 Write property test for model reuse
    - **Property 14: Model Reuse Across Transcriptions**
    - **Validates: Requirements 4.6**
  
  - [x] 4.3 Implement automatic model unloading
    - Create resetUnloadTimer method
    - Set 5-minute timeout for model unloading
    - Create unloadModel method
    - Clear timer on new transcription requests
    - _Requirements: 10.1, 10.2_
  
  - [x] 4.4 Add audio format conversion
    - Create convertAudioBuffer helper method
    - Convert AudioBuffer to Float32Array PCM format
    - Ensure 16kHz sample rate and mono channel
    - _Requirements: 4.4_
  
  - [ ]* 4.5 Write property test for no external network calls
    - **Property 13: No External Network Calls During Local Transcription**
    - **Validates: Requirements 4.5**

- [x] 5. Enhance TranscriptionService with provider routing
  - [x] 5.1 Update TranscriptionService to support multiple providers
    - Add localProvider property
    - Update constructor to initialize both providers
    - Create getActiveProvider method based on settings
    - _Requirements: 2.1, 2.2_
  
  - [x] 5.2 Implement fallback mechanism
    - Wrap provider.transcribe in try-catch
    - Check settings.enableFallback flag
    - Attempt API transcription on local failure
    - Emit fallback notification event
    - Log fallback reason
    - _Requirements: 6.1, 6.2, 6.3, 6.5_
  
  - [ ]* 5.3 Write property test for provider routing
    - **Property 7: Provider Routing Based on Settings**
    - **Validates: Requirements 2.2**
  
  - [ ]* 5.4 Write property test for consistent output format
    - **Property 8: Consistent Output Format**
    - **Validates: Requirements 2.4, 4.3**
  
  - [ ]* 5.5 Write property test for fallback on failure
    - **Property 16: Fallback on Local Transcription Failure**
    - **Validates: Requirements 6.1, 6.2**
  
  - [ ]* 5.6 Write property test for fallback notification
    - **Property 17: Fallback Notification**
    - **Validates: Requirements 6.3**
  
  - [ ]* 5.7 Write property test for fallback logging
    - **Property 18: Fallback Logging**
    - **Validates: Requirements 6.5**

- [x] 6. Create settings persistence layer
  - [x] 6.1 Define TranscriptionSettings interface and storage key
    - Create interface with method, localModelVariant, enableFallback, apiKey
    - Define default settings (method: 'api', enableFallback: true)
    - _Requirements: 8.3_
  
  - [x] 6.2 Implement settings save and load functions
    - Create saveSettings function using localStorage or Tauri store
    - Create loadSettings function with default fallback
    - Create resetSettings function
    - _Requirements: 3.4, 3.5, 8.1, 8.2, 8.4_
  
  - [ ]* 6.3 Write property test for settings persistence round-trip
    - **Property 10: Settings Persistence Round-Trip**
    - **Validates: Requirements 3.4, 3.5, 8.1, 8.2**
  
  - [ ]* 6.4 Write property test for settings reset
    - **Property 20: Settings Reset to Defaults**
    - **Validates: Requirements 8.4**
  
  - [x] 6.5 Add storage directory configuration
    - Extend settings to include modelsStorageDirectory
    - Implement updateStorageDirectory function
    - Validate directory path before saving
    - _Requirements: 8.5_
  
  - [ ]* 6.6 Write property test for storage directory configuration
    - **Property 21: Storage Directory Configuration**
    - **Validates: Requirements 8.5**

- [x] 7. Build model selection UI components
  - [x] 7.1 Create ModelVariantCard component
    - Display variant name, size, accuracy, speed
    - Show download status (downloaded, not downloaded, downloading)
    - Show download progress bar when downloading
    - Add download button for undownloaded models
    - Add select button for downloaded models
    - Highlight selected variant
    - _Requirements: 3.3, 7.1, 7.2, 7.3_
  
  - [ ]* 7.2 Write property test for model metadata display
    - **Property 9: Model Metadata Display Completeness**
    - **Validates: Requirements 3.3, 7.1, 7.2, 7.3**
  
  - [x] 7.3 Create ModelSelection component
    - Add radio group for transcription method (API vs Local)
    - Display model variants when Local is selected
    - Integrate ModelVariantCard for each variant
    - Handle model download initiation
    - Update settings on selection changes
    - Show fallback checkbox
    - _Requirements: 3.1, 3.2, 3.4, 3.6_
  
  - [x] 7.4 Add disk space indicators
    - Query available disk space on component mount
    - Highlight models that won't fit in available space
    - Show warning icon for insufficient space
    - Display available space vs required space
    - _Requirements: 7.4, 9.3_
  
  - [ ]* 7.5 Write property test for disk space highlighting
    - **Property 19: Disk Space Highlighting**
    - **Validates: Requirements 7.4**
  
  - [x] 7.6 Create model comparison view
    - Build side-by-side comparison table
    - Show all variants with key metrics
    - Allow sorting by size, accuracy, speed
    - _Requirements: 7.5_

- [ ] 8. Implement error handling and user feedback
  - [x] 8.1 Create error notification system
    - Build toast/notification component for errors
    - Add error message formatting utilities
    - Include specific error reasons in messages
    - Provide actionable suggestions (e.g., "Free up 500MB of disk space")
    - _Requirements: 9.1, 9.2, 9.3_
  
  - [ ]* 8.2 Write property test for download error messages
    - **Property 22: Download Error Messages Include Details**
    - **Validates: Requirements 9.1**
  
  - [x] 8.3 Add corruption recovery UI
    - Detect corrupted model files on validation failure
    - Show modal offering to re-download
    - Implement re-download action
    - _Requirements: 9.4_
  
  - [ ]* 8.4 Write property test for corruption recovery
    - **Property 23: Corruption Recovery Offer**
    - **Validates: Requirements 9.4**
  
  - [x] 8.5 Implement transcription status display
    - Create status indicator component
    - Show stages: "Loading model", "Processing audio", "Finalizing"
    - Update status based on progress callbacks
    - Add cancel button during processing
    - _Requirements: 9.5, 5.3_
  
  - [ ]* 8.6 Write property test for status updates
    - **Property 24: Transcription Status Updates**
    - **Validates: Requirements 9.5**

- [x] 9. Add resource management and optimization
  - [x] 9.1 Implement memory monitoring
    - Query system memory on app start and periodically
    - Create getSystemMemory utility function
    - Display warning when memory is low (< 4GB available)
    - _Requirements: 10.4, 10.5_
  
  - [ ]* 9.2 Write property test for memory warnings
    - **Property 26: Memory Warning on Low Resources**
    - **Validates: Requirements 10.4**
  
  - [x] 9.3 Add model recommendation logic
    - Create recommendModelVariant function
    - Consider available memory and disk space
    - Suggest smaller variants or API for limited resources
    - Display recommendations in UI
    - _Requirements: 5.5, 10.5_
  
  - [ ]* 9.4 Write property test for resource-based recommendations
    - **Property 15: Resource-Based Model Recommendations**
    - **Validates: Requirements 5.5, 10.5**
  
  - [x] 9.5 Implement transcription request queuing
    - Create request queue in LocalWhisperProvider
    - Process requests sequentially
    - Prevent multiple model instances
    - _Requirements: 10.3_
  
  - [ ]* 9.6 Write property test for concurrent request queuing
    - **Property 25: Concurrent Request Queuing**
    - **Validates: Requirements 10.3**

- [ ] 10. Integration and testing
  - [x] 10.1 Wire LocalWhisperProvider into existing transcription flow
    - Update TranscriptionService initialization in app
    - Connect settings UI to TranscriptionService
    - Ensure hotkey recording flow works with both providers
    - _Requirements: 2.1, 2.2, 4.1_
  
  - [x] 10.2 Add startup model validation
    - Check all downloaded models on app start
    - Validate checksums for existing models
    - Remove corrupted models automatically
    - _Requirements: 1.6_
  
  - [ ]* 10.3 Write integration tests for end-to-end transcription
    - Test complete flow: select model → download → transcribe
    - Test fallback flow: local failure → API success
    - Test settings persistence across app restarts
    - _Requirements: 2.2, 4.1, 4.3, 6.1, 6.2_
  
  - [ ]* 10.4 Write unit tests for edge cases
    - Test empty audio input handling
    - Test missing API key with fallback enabled
    - Test concurrent downloads of same model
    - Test model unloading on app close
    - _Requirements: 6.4, 10.2_

- [x] 11. Checkpoint - Ensure all tests pass
  - Ensure all tests pass, ask the user if questions arise.

## Notes

- Tasks marked with `*` are optional and can be skipped for faster MVP
- Each task references specific requirements for traceability
- The Rust backend (tasks 1-2) must be completed before TypeScript service layer (tasks 3-5)
- UI components (task 7) depend on service layer completion
- Property tests validate universal correctness properties across randomized inputs
- Integration tests (task 10) validate end-to-end workflows
