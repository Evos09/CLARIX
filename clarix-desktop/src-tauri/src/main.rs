// CLARIX desktop (Tauri v2): wraps the web app in a native window and adds a
// system tray, a global "summon" shortcut, close-to-tray, and notifications.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::{Manager, WindowEvent};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
use tauri_plugin_notification::NotificationExt;
use tauri_plugin_updater::UpdaterExt;

/// Bring the main window to the front (used by the tray and the global shortcut).
fn summon(app: &tauri::AppHandle) {
    if let Some(w) = app.get_webview_window("main") {
        let _ = w.show();
        let _ = w.unminimize();
        let _ = w.set_focus();
    }
}

/// On launch, check GitHub Releases for a newer signed build; if found, download,
/// install, and relaunch. Silent no-op when already up to date or offline.
async fn check_for_updates(app: tauri::AppHandle) {
    let updater = match app.updater() {
        Ok(u) => u,
        Err(_) => return,
    };
    if let Ok(Some(update)) = updater.check().await {
        if update.download_and_install(|_, _| {}, || {}).await.is_ok() {
            app.restart();
        }
    }
}

/// Manual "Check for Updates…" from the tray — same as the launch check, but
/// tells the user the outcome (up to date / installing / failed) via a notification.
async fn check_for_updates_interactive(app: tauri::AppHandle) {
    let notify = |body: &str| {
        let _ = app.notification().builder().title("CLARIX").body(body).show();
    };
    let updater = match app.updater() {
        Ok(u) => u,
        Err(_) => return notify("Update check is unavailable."),
    };
    match updater.check().await {
        Ok(Some(update)) => {
            notify("Update found — downloading…");
            if update.download_and_install(|_, _| {}, || {}).await.is_ok() {
                app.restart();
            } else {
                notify("Update failed to install.");
            }
        }
        Ok(None) => notify("You're on the latest version."),
        Err(_) => notify("Couldn't check for updates right now."),
    }
}

fn main() {
    tauri::Builder::default()
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
        .plugin(
            tauri_plugin_global_shortcut::Builder::new()
                // We register exactly one shortcut (below), so any fired shortcut
                // is the summon shortcut.
                .with_handler(|app, _shortcut, event| {
                    if event.state == ShortcutState::Pressed {
                        summon(app);
                    }
                })
                .build(),
        )
        .setup(|app| {
            // Global shortcut: Ctrl/Cmd+Shift+R summons CLARIX from anywhere.
            let summon_shortcut =
                Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyR);
            app.global_shortcut().register(summon_shortcut)?;

            // Check for updates in the background (GitHub Releases feed).
            tauri::async_runtime::spawn(check_for_updates(app.handle().clone()));

            // System tray with a small menu.
            let open = MenuItem::with_id(app, "open", "Open CLARIX", true, None::<&str>)?;
            let check = MenuItem::with_id(app, "check_update", "Check for Updates…", true, None::<&str>)?;
            let quit = MenuItem::with_id(app, "quit", "Quit", true, None::<&str>)?;
            let menu = Menu::with_items(app, &[&open, &check, &quit])?;

            TrayIconBuilder::new()
                .menu(&menu)
                .tooltip("CLARIX")
                .icon(app.default_window_icon().unwrap().clone())
                .on_menu_event(|app, event| match event.id.as_ref() {
                    "open" => summon(app),
                    "check_update" => {
                        tauri::async_runtime::spawn(check_for_updates_interactive(app.clone()));
                    }
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
