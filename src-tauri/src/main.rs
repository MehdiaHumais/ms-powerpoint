#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use std::sync::Mutex;

static OPEN_FILE: Mutex<Option<String>> = Mutex::new(None);

#[tauri::command]
fn initial_file() -> Option<String> {
    OPEN_FILE.lock().ok().and_then(|g| g.clone())
}

fn main() {
    if let Some(arg) = std::env::args().nth(1) {
        if arg.to_lowercase().ends_with(".britslide") {
            if let Ok(mut g) = OPEN_FILE.lock() {
                *g = Some(arg);
            }
        }
    }

    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![initial_file])
        .run(tauri::generate_context!())
        .expect("error while running BritSlide");
}
