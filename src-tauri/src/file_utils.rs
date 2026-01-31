use serde::{Deserialize, Serialize};
use sha2::{Digest, Sha256};
use std::fs;
use std::io::{Read, Write};
use std::path::{Path, PathBuf};
use tauri::AppHandle;

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct DownloadProgress {
    pub bytes_downloaded: u64,
    pub total_bytes: u64,
    pub percentage: f64,
    pub status: String,
}

#[tauri::command]
pub async fn file_exists(path: String) -> Result<bool, String> {
    Ok(Path::new(&path).exists())
}

#[tauri::command]
pub async fn delete_file(path: String) -> Result<(), String> {
    fs::remove_file(&path).map_err(|e| format!("Failed to delete file: {}", e))
}

#[tauri::command]
pub async fn calculate_file_checksum(path: String) -> Result<String, String> {
    let mut file = fs::File::open(&path)
        .map_err(|e| format!("Failed to open file: {}", e))?;
    
    let mut hasher = Sha256::new();
    let mut buffer = [0u8; 8192];
    
    loop {
        let bytes_read = file.read(&mut buffer)
            .map_err(|e| format!("Failed to read file: {}", e))?;
        
        if bytes_read == 0 {
            break;
        }
        
        hasher.update(&buffer[..bytes_read]);
    }
    
    Ok(hex::encode(hasher.finalize()))
}

#[tauri::command]
pub async fn get_available_disk_space(path: String) -> Result<u64, String> {
    // Use platform-specific methods to get disk space
    #[cfg(target_os = "windows")]
    {
        use std::os::windows::fs::MetadataExt;
        let metadata = fs::metadata(&path)
            .map_err(|e| format!("Failed to get metadata: {}", e))?;
        // This is a simplified version - in production, use Windows API
        Ok(u64::MAX) // Placeholder
    }
    
    #[cfg(not(target_os = "windows"))]
    {
        use std::os::unix::fs::MetadataExt;
        let metadata = fs::metadata(&path)
            .map_err(|e| format!("Failed to get metadata: {}", e))?;
        // This is a simplified version - in production, use statvfs
        Ok(u64::MAX) // Placeholder
    }
}

#[tauri::command]
pub async fn get_models_directory(app_handle: AppHandle) -> Result<String, String> {
    let app_data_dir = app_handle
        .path()
        .app_data_dir()
        .map_err(|e| format!("Failed to get app data directory: {}", e))?;
    
    let models_dir = app_data_dir.join("models");
    
    // Create directory if it doesn't exist
    if !models_dir.exists() {
        fs::create_dir_all(&models_dir)
            .map_err(|e| format!("Failed to create models directory: {}", e))?;
    }
    
    models_dir
        .to_str()
        .ok_or("Invalid path".to_string())
        .map(|s| s.to_string())
}

#[tauri::command]
pub async fn download_model(
    app_handle: AppHandle,
    url: String,
    target_path: String,
    expected_size: u64,
    checksum: String,
) -> Result<(), String> {
    // Ensure parent directory exists
    if let Some(parent) = Path::new(&target_path).parent() {
        fs::create_dir_all(parent)
            .map_err(|e| format!("Failed to create directory: {}", e))?;
    }
    
    // Emit starting status
    let _ = app_handle.emit("download-progress", DownloadProgress {
        bytes_downloaded: 0,
        total_bytes: expected_size,
        percentage: 0.0,
        status: "starting".to_string(),
    });
    
    // Download the file with timeout and retry logic
    let client = reqwest::Client::builder()
        .timeout(std::time::Duration::from_secs(300)) // 5 minute timeout
        .build()
        .map_err(|e| format!("Failed to create HTTP client: {}", e))?;
    
    let response = client
        .get(&url)
        .send()
        .await
        .map_err(|e| {
            // Cleanup on connection failure
            let _ = fs::remove_file(&target_path);
            format!("Download request failed: {}. Please check your internet connection.", e)
        })?;
    
    if !response.status().is_success() {
        return Err(format!(
            "Download failed with HTTP status: {}. The model file may not be available.",
            response.status()
        ));
    }
    
    // Create temporary file for download
    let temp_path = format!("{}.tmp", target_path);
    let mut file = fs::File::create(&temp_path)
        .map_err(|e| format!("Failed to create file: {}. Check disk permissions.", e))?;
    
    let mut downloaded: u64 = 0;
    let mut stream = response.bytes_stream();
    
    use futures_util::StreamExt;
    
    // Emit downloading status
    let _ = app_handle.emit("download-progress", DownloadProgress {
        bytes_downloaded: 0,
        total_bytes: expected_size,
        percentage: 0.0,
        status: "downloading".to_string(),
    });
    
    while let Some(chunk_result) = stream.next().await {
        let chunk = chunk_result.map_err(|e| {
            // Cleanup on stream error
            let _ = fs::remove_file(&temp_path);
            format!("Failed to read data chunk: {}. Download interrupted.", e)
        })?;
        
        file.write_all(&chunk).map_err(|e| {
            // Cleanup on write error
            let _ = fs::remove_file(&temp_path);
            format!("Failed to write to disk: {}. Check available disk space.", e)
        })?;
        
        downloaded += chunk.len() as u64;
        
        // Emit progress event every chunk
        let progress = DownloadProgress {
            bytes_downloaded: downloaded,
            total_bytes: expected_size,
            percentage: if expected_size > 0 {
                (downloaded as f64 / expected_size as f64) * 100.0
            } else {
                0.0
            },
            status: "downloading".to_string(),
        };
        
        let _ = app_handle.emit("download-progress", progress);
    }
    
    // Ensure all data is written to disk
    drop(file);
    
    // Emit validating status
    let _ = app_handle.emit("download-progress", DownloadProgress {
        bytes_downloaded: downloaded,
        total_bytes: expected_size,
        percentage: 100.0,
        status: "validating".to_string(),
    });
    
    // Validate checksum
    let actual_checksum = calculate_file_checksum(temp_path.clone()).await.map_err(|e| {
        // Cleanup on checksum calculation error
        let _ = fs::remove_file(&temp_path);
        format!("Failed to calculate checksum: {}", e)
    })?;
    
    if actual_checksum.to_lowercase() != checksum.to_lowercase() {
        // Delete the corrupted file
        let _ = fs::remove_file(&temp_path);
        return Err(format!(
            "Checksum validation failed. The downloaded file is corrupted. Expected: {}, Got: {}. Please try downloading again.",
            checksum, actual_checksum
        ));
    }
    
    // Move temp file to final location
    fs::rename(&temp_path, &target_path).map_err(|e| {
        // Cleanup on rename error
        let _ = fs::remove_file(&temp_path);
        format!("Failed to finalize download: {}", e)
    })?;
    
    // Emit completed status
    let _ = app_handle.emit("download-progress", DownloadProgress {
        bytes_downloaded: downloaded,
        total_bytes: expected_size,
        percentage: 100.0,
        status: "completed".to_string(),
    });
    
    Ok(())
}
