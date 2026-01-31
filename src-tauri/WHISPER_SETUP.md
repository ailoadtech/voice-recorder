# Whisper.cpp Dependencies Configuration

## Overview
This document describes the whisper.cpp dependencies added to the Rust backend for local Whisper model support.

## Dependencies Added

### whisper-rs v0.15
- **Purpose**: Rust bindings to whisper.cpp for local speech-to-text transcription
- **Features Enabled**:
  - `metal`: Hardware acceleration support for Apple Silicon (M1/M2/M3) via Metal API
  - `raw-api`: Access to lower-level whisper.cpp APIs for advanced control

### Supporting Dependencies
The following dependencies were already present and support the Whisper integration:
- `tokio`: Async runtime for non-blocking model operations
- `reqwest`: HTTP client for downloading model files
- `sha2` + `hex`: Checksum validation for downloaded models
- `once_cell` + `lazy_static`: Thread-safe singleton pattern for model context
- `num_cpus`: Optimal thread count detection for inference
- `futures-util`: Stream processing for download progress

## Build Configuration

### Native Compilation
- whisper-rs automatically handles native compilation through its build system (whisper-rs-sys)
- The C++ whisper.cpp library is compiled during the first `cargo build`
- Build time: ~5-10 minutes on first build (compiles whisper.cpp from source)

### Platform-Specific Features
- **macOS (Apple Silicon)**: Uses Metal for GPU acceleration
- **Windows**: CPU-based inference (can be extended with CUDA/OpenBLAS)
- **Linux**: CPU-based inference (can be extended with CUDA/OpenBLAS/Vulkan)

## Available Hardware Acceleration Features

The following features can be enabled for different platforms:
- `metal`: Apple Metal API (macOS)
- `cuda`: NVIDIA CUDA (requires CUDA toolkit)
- `hipblas`: AMD ROCm (requires ROCm)
- `openblas`: OpenBLAS CPU optimization
- `vulkan`: Vulkan compute (cross-platform GPU)
- `openmp`: OpenMP parallelization

## Next Steps

1. Implement Whisper context management module (Task 1.2)
2. Create Tauri commands for model loading/unloading
3. Implement audio transcription with progress callbacks
4. Add model file management utilities

## References

- whisper-rs crate: https://lib.rs/crates/whisper-rs
- whisper.cpp: https://github.com/ggerganov/whisper.cpp
- GGML format: https://github.com/ggerganov/ggml
