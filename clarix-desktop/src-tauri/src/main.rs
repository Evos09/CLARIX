// CLARIX desktop (Tauri v2): a decorated dashboard window plus a separate
// floating, transparent, always-on-top overlay window (shown from the dashboard
// or the global shortcut). Adds a system tray, close-to-tray, and notifications.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::{Manager, WindowEvent};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};

/// Bring the dashboard window to the front (tray "Open CLARIX"). The overlay is
/// a separate always-on-top window, toggled by the global shortcut instead.
fn summon(app: &tauri::AppHandle) {
    if let Some(w) = app.get_webview_window("main") {
        let _ = w.show();
        let _ = w.unminimize();
        let _ = w.set_focus();
    }
}

/// Toggle the always-on-top overlay spotlight (the global-shortcut target).
/// Visible -> hide; hidden -> show and focus, so one keystroke flips it.
fn toggle_overlay(app: &tauri::AppHandle) {
    if let Some(w) = app.get_webview_window("overlay") {
        if w.is_visible().unwrap_or(false) {
            let _ = w.hide();
        } else {
            let _ = w.show();
            let _ = w.set_focus();
        }
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                // We register exactly one shortcut (below), so any fired shortcut
                // is the overlay toggle.
                .with_handler(|app, _shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        toggle_overlay(app);
                    }
                })
                .build(),
        )
        .setup(|app| {
            // Global shortcut: Ctrl/Cmd+Shift+R toggles the overlay from
            // anywhere. The tray's "Open CLARIX" re-summons it if it's hidden.
            let overlay_shortcut =
                Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyR);
            app.global_shortcut().register(overlay_shortcut)?;

            // System tray with a small menu.
            let open = MenuItem::with_id(app, "open", "Open CLARIX", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&open, &quit])?;

            TrayIconBuilder::new()
                .menu(&menu)
                .tooltip("CLARIX")
                .icon(app.default_window_icon().unwrap().clone())
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "open" => summon(app),
                    "quit" => app.exit(0),
                    _ => {}
                })
                .build(app)?;
            Ok(())
        })
        // Closing the window hides it to the tray instead of quitting the app.
        // Use the tray's Quit item (or the OS) to fully exit.
        .on_window_event(|window, event| {
            if let WindowEvent::CloseRequested { api, .. } = event {
                let _ = window.hide();
                api.prevent_close();
            }
        })
        .run(tauri::generate_context!())
        .expect("error while running CLARIX");
}
