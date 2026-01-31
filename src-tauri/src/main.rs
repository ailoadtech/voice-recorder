// Prevents additional console window on Windows in release
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::{
    AppHandle, CustomMenuItem, Manager, SystemTray, SystemTrayEvent, SystemTrayMenu,
    SystemTrayMenuItem, WindowEvent,
};
use tauri_plugin_global_shortcut::{GlobalShortcutExt, Shortcut};
use tauri_plugin_autostart::MacosLauncher;

// Commands that can be invoked from the frontend
#[tauri::command]
fn toggle_recording(app_handle: AppHandle) -> Result<(), String> {
    // Emit event to frontend to toggle recording
    app_handle
        .emit("toggle-recording", ())
        .map_err(|e| e.to_string())?;
    
    // Show window if hidden
    if let Some(window) = app_handle.get_webview_window("main") {
        window.show().map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())?;
    }
    
    Ok(())
}

#[tauri::command]
fn minimize_to_tray(app_handle: AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window("main") {
        window.hide().map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn show_window(app_handle: AppHandle) -> Result<(), String> {
    if let Some(window) = app_handle.get_webview_window("main") {
        window.show().map_err(|e| e.to_string())?;
        window.set_focus().map_err(|e| e.to_string())?;
    }
    Ok(())
}

fn create_system_tray() -> SystemTray {
    let show = CustomMenuItem::new("show".to_string(), "Show");
    let record = CustomMenuItem::new("record".to_string(), "Start Recording");
    let autostart = CustomMenuItem::new("autostart".to_string(), "Start on Boot");
    let quit = CustomMenuItem::new("quit".to_string(), "Quit");
    
    let tray_menu = SystemTrayMenu::new()
        .add_item(show)
        .add_item(record)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(autostart)
        .add_native_item(SystemTrayMenuItem::Separator)
        .add_item(quit);
    
    SystemTray::new().with_menu(tray_menu)
}

fn handle_system_tray_event(app: &AppHandle, event: SystemTrayEvent) {
    match event {
        SystemTrayEvent::LeftClick { .. } => {
            // Show window on left click
            if let Some(window) = app.get_webview_window("main") {
                let _ = window.show();
                let _ = window.set_focus();
            }
        }
        SystemTrayEvent::MenuItemClick { id, .. } => {
            match id.as_str() {
                "show" => {
                    if let Some(window) = app.get_webview_window("main") {
                        let _ = window.show();
                        let _ = window.set_focus();
                    }
                }
                "record" => {
                    let _ = toggle_recording(app.clone());
                }
                "autostart" => {
                    // Toggle autostart
                    // This would need to check current state and toggle
                    // For now, just log
                    println!("Autostart toggle requested");
                }
                "quit" => {
                    std::process::exit(0);
                }
                _ => {}
            }
        }
        _ => {}
    }
}

fn setup_global_shortcut(app: &AppHandle) -> Result<(), Box<dyn std::error::Error>> {
    // Register global shortcut for recording
    let shortcut = "CommandOrControl+Shift+Space".parse::<Shortcut>()?;
    let app_handle = app.clone();
    
    app.global_shortcut().on_shortcut(shortcut, move || {
        let _ = toggle_recording(app_handle.clone());
    })?;
    
    app.global_shortcut().register(shortcut)?;
    
    Ok(())
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_global_shortcut::Builder::new().build())
        .plugin(tauri_plugin_autostart::init(MacosLauncher::LaunchAgent, Some(vec!["--minimized"])))
        .plugin(tauri_plugin_shell::init())
        .system_tray(create_system_tray())
        .on_system_tray_event(handle_system_tray_event)
        .setup(|app| {
            // Setup global shortcut
            if let Err(e) = setup_global_shortcut(&app.handle()) {
                eprintln!("Failed to setup global shortcut: {}", e);
            }
            
            // Handle window close event (minimize to tray instead of closing)
            if let Some(window) = app.get_webview_window("main") {
                window.on_window_event(move |event| {
                    if let WindowEvent::CloseRequested { api, .. } = event {
                        // Prevent window from closing, hide it instead
                        api.prevent_close();
                        let _ = window.hide();
                    }
                });
            }
            
            Ok(())
        })
        .invoke_handler(tauri::generate_handler![
            toggle_recording,
            minimize_to_tray,
            show_window,
            voice_intelligence_lib::load_whisper_model,
            voice_intelligence_lib::unload_whisper_model,
            voice_intelligence_lib::transcribe_audio,
            voice_intelligence_lib::get_whisper_model_status,
            voice_intelligence_lib::file_exists,
            voice_intelligence_lib::delete_file,
            voice_intelligence_lib::calculate_file_checksum,
            voice_intelligence_lib::get_available_disk_space,
            voice_intelligence_lib::get_models_directory,
            voice_intelligence_lib::download_model,
            voice_intelligence_lib::get_system_memory,
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
