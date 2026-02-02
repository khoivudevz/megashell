use portable_pty::{CommandBuilder, NativePtySystem, PtySize, PtySystem};
use serde::{ Serialize};
use std::{
    collections::HashMap,
    io::{Read, Write},
    sync::{Arc, Mutex},
    thread,
};
use tauri::{Emitter, Manager};

// State to hold the PTY pair
struct PtyState {
    // Map sessionId -> PtyPair
    pty_pairs: Arc<Mutex<HashMap<String, portable_pty::PtyPair>>>,
    // Map sessionId -> Writer
    writers: Arc<Mutex<HashMap<String, Box<dyn Write + Send>>>>,
}

impl PtyState {
    fn new() -> Self {
        Self {
            pty_pairs: Arc::new(Mutex::new(HashMap::new())),
            writers: Arc::new(Mutex::new(HashMap::new())),
        }
    }
}

#[derive(Clone, Serialize)]
struct TermData {
    id: String,
    data: String,
}

#[tauri::command]
fn pty_spawn(
    state: tauri::State<'_, PtyState>,
    app_handle: tauri::AppHandle,
    id: String,
    cols: u16,
    rows: u16,
) -> Result<(), String> {
    let pty_system = NativePtySystem::default();

    let pair = pty_system
        .openpty(PtySize {
            rows,
            cols,
            pixel_width: 0,
            pixel_height: 0,
        })
        .map_err(|e| e.to_string())?;

    let cmd = CommandBuilder::new("powershell");
    let mut child = pair.slave.spawn_command(cmd).map_err(|e| e.to_string())?;

    let mut reader = pair.master.try_clone_reader().map_err(|e| e.to_string())?;
    let writer = pair.master.take_writer().map_err(|e| e.to_string())?;

    // Store state
    state.pty_pairs.lock().unwrap().insert(id.clone(), pair);
    state.writers.lock().unwrap().insert(id.clone(), writer);

    // Spawn thread to read from PTY and emit to frontend
    let id_clone = id.clone();
    thread::spawn(move || {
        let mut buf = [0u8; 1024];
        loop {
            match reader.read(&mut buf) {
                Ok(n) if n > 0 => {
                    let data = String::from_utf8_lossy(&buf[..n]).to_string();
                    let _ = app_handle.emit(
                        &format!("term-data:{}", id_clone),
                        TermData {
                            id: id_clone.clone(),
                            data,
                        },
                    );
                }
                Ok(_) => break, // EOF
                Err(_) => break,
            }
        }
        // Child cleanup could go here
        let _ = child.wait();
    });

    Ok(())
}

#[tauri::command]
fn pty_write(state: tauri::State<'_, PtyState>, id: String, data: String) -> Result<(), String> {
    let mut writers = state.writers.lock().unwrap();
    if let Some(writer) = writers.get_mut(&id) {
        write!(writer, "{}", data).map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn pty_resize(
    state: tauri::State<'_, PtyState>,
    id: String,
    cols: u16,
    rows: u16,
) -> Result<(), String> {
    let pairs = state.pty_pairs.lock().unwrap();
    if let Some(pair) = pairs.get(&id) {
        pair.master
            .resize(PtySize {
                rows,
                cols,
                pixel_width: 0,
                pixel_height: 0,
            })
            .map_err(|e| e.to_string())?;
    }
    Ok(())
}

#[tauri::command]
fn pty_kill(state: tauri::State<'_, PtyState>, id: String) -> Result<(), String> {
    state.pty_pairs.lock().unwrap().remove(&id);
    state.writers.lock().unwrap().remove(&id);
    Ok(())
}

#[cfg_attr(mobile, tauri::mobile_entry_point)]
pub fn run() {
    tauri::Builder::default()
        .manage(PtyState::new())
        .plugin(tauri_plugin_shell::init())
        .plugin(tauri_plugin_opener::init())
        .setup(|app| {
            if let Some(icon) = app.default_window_icon() {
                let quit_i = tauri::menu::MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
                let show_i = tauri::menu::MenuItem::with_id(app, "show", "Show/Hide", true, None::<&str>)?;
                let menu = tauri::menu::Menu::with_items(app, &[&show_i, &quit_i])?;

                let _tray = tauri::tray::TrayIconBuilder::new()
                    .icon(icon.clone())
                    .menu(&menu)
                    .show_menu_on_left_click(false)
                    .on_menu_event(|app, event| match event.id.as_ref() {
                        "quit" => {
                            app.exit(0);
                        }
                        "show" => {
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        _ => {}
                    })
                    .on_tray_icon_event(|tray, event| match event {
                        tauri::tray::TrayIconEvent::Click {
                            button: tauri::tray::MouseButton::Left,
                            ..
                        } => {
                            let app = tray.app_handle();
                            if let Some(window) = app.get_webview_window("main") {
                                let _ = window.show();
                                let _ = window.set_focus();
                            }
                        }
                        _ => {}
                    })
                    .build(app)?;
            }
            Ok(())
        })
        .on_window_event(|window, event| match event {
            tauri::WindowEvent::CloseRequested { api, .. } => {
                window.hide().unwrap();
                api.prevent_close();
            }
            _ => {}
        })
        .invoke_handler(tauri::generate_handler![
            pty_spawn, pty_write, pty_resize, pty_kill
        ])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
