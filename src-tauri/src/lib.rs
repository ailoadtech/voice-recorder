// Library file for Tauri
// This is required for the mobile targets

mod whisper;
mod file_utils;
mod system_info;

#[cfg(mobile)]
mod mobile;

#[cfg(mobile)]
pub use mobile::*;

pub use whisper::*;
pub use file_utils::*;
pub use system_info::*;
