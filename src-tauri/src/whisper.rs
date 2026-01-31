use once_cell::sync::Mutex;
use serde::{Deserialize, Serialize};
use std::path::PathBuf;
use std::sync::Arc;
use tauri::{AppHandle, Emitter};
use whisper_rs::{WhisperContext as WhisperRsContext, WhisperContextParameters, FullParams, SamplingStrategy};

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(rename_all = "lowercase")]
pub enum ModelVariant {
    Tiny,
    Base,
    Small,
    Medium,
    Large,
}

impl ModelVariant {
    pub fn to_filename(&self) -> String {
        match self {
            ModelVariant::Tiny => "ggml-tiny.bin".to_string(),
            ModelVariant::Base => "ggml-base.bin".to_string(),
            ModelVariant::Small => "ggml-small.bin".to_string(),
            ModelVariant::Medium => "ggml-medium.bin".to_string(),
            ModelVariant::Large => "ggml-large-v3.bin".to_string(),
        }
    }
}

pub struct WhisperContext {
    ctx: WhisperRsContext,
    variant: ModelVariant,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
pub struct TranscriptionProgress {
    pub stage: String,
    pub progress: f32,
}

impl WhisperContext {
    pub fn new(model_path: PathBuf, variant: ModelVariant) -> Result<Self, String> {
        let ctx = WhisperRsContext::new_with_params(
            model_path.to_str().ok_or("Invalid model path")?,
            WhisperContextParameters::default(),
        )
        .map_err(|e| format!("Failed to load Whisper model: {}", e))?;

        Ok(WhisperContext { ctx, variant })
    }

    pub fn transcribe(&self, audio_data: Vec<f32>, app_handle: Option<AppHandle>) -> Result<String, String> {
        // Emit progress: Loading model stage
        if let Some(app) = &app_handle {
            let _ = app.emit("transcription-progress", TranscriptionProgress {
                stage: "loading_model".to_string(),
                progress: 0.0,
            });
        }

        let mut params = FullParams::new(SamplingStrategy::Greedy { best_of: 1 });
        
        // Configure parameters for better transcription
        params.set_n_threads(num_cpus::get() as i32);
        params.set_translate(false);
        params.set_language(Some("en"));
        params.set_print_special(false);
        params.set_print_progress(false);
        params.set_print_realtime(false);
        params.set_print_timestamps(false);

        // Emit progress: Processing audio stage
        if let Some(app) = &app_handle {
            let _ = app.emit("transcription-progress", TranscriptionProgress {
                stage: "processing_audio".to_string(),
                progress: 0.33,
            });
        }

        // Create a state for transcription
        let mut state = self.ctx.create_state()
            .map_err(|e| format!("Failed to create Whisper state: {}", e))?;

        // Run the transcription
        state.full(params, &audio_data)
            .map_err(|e| format!("Transcription failed: {}", e))?;

        // Emit progress: Finalizing stage
        if let Some(app) = &app_handle {
            let _ = app.emit("transcription-progress", TranscriptionProgress {
                stage: "finalizing".to_string(),
                progress: 0.66,
            });
        }

        // Extract the transcribed text
        let num_segments = state.full_n_segments()
            .map_err(|e| format!("Failed to get segment count: {}", e))?;

        let mut result = String::new();
        for i in 0..num_segments {
            let segment = state.full_get_segment_text(i)
                .map_err(|e| format!("Failed to get segment text: {}", e))?;
            result.push_str(&segment);
            result.push(' ');
        }

        // Emit progress: Complete
        if let Some(app) = &app_handle {
            let _ = app.emit("transcription-progress", TranscriptionProgress {
                stage: "complete".to_string(),
                progress: 1.0,
            });
        }

        Ok(result.trim().to_string())
    }

    pub fn variant(&self) -> &ModelVariant {
        &self.variant
    }
}

// Global state to hold the loaded model
lazy_static::lazy_static! {
    static ref WHISPER_MODEL: Arc<Mutex<Option<WhisperContext>>> = Arc::new(Mutex::new(None));
}

#[tauri::command]
pub async fn load_whisper_model(
    path: String,
    variant: ModelVariant,
) -> Result<(), String> {
    let model_path = PathBuf::from(path);
    
    if !model_path.exists() {
        return Err(format!("Model file not found: {:?}", model_path));
    }

    let context = WhisperContext::new(model_path, variant)?;
    
    let mut model = WHISPER_MODEL.lock().unwrap();
    *model = Some(context);
    
    Ok(())
}

#[tauri::command]
pub async fn unload_whisper_model() -> Result<(), String> {
    let mut model = WHISPER_MODEL.lock().unwrap();
    *model = None;
    Ok(())
}

#[tauri::command]
pub async fn transcribe_audio(
    audio_data: Vec<f32>,
    _variant: ModelVariant,
    app_handle: AppHandle,
) -> Result<String, String> {
    let model = WHISPER_MODEL.lock().unwrap();
    
    match model.as_ref() {
        Some(ctx) => ctx.transcribe(audio_data, Some(app_handle)),
        None => Err("No Whisper model loaded".to_string()),
    }
}

#[tauri::command]
pub async fn get_whisper_model_status() -> Result<Option<ModelVariant>, String> {
    let model = WHISPER_MODEL.lock().unwrap();
    Ok(model.as_ref().map(|ctx| ctx.variant().clone()))
}
