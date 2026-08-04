// CLARIX desktop (Tauri v2): a decorated dashboard window plus a separate
// floating, transparent, always-on-top overlay window (shown from the dashboard
// or the global shortcut). Adds a system tray, close-to-tray, and notifications.
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]

use tauri::menu::{Menu, MenuItem};
use tauri::tray::TrayIconBuilder;
use tauri::{Manager, WindowEvent};
use tauri_plugin_global_shortcut::{Code, GlobalShortcutExt, Modifiers, Shortcut, ShortcutState};
use tauri_plugin_notification::NotificationExt;
use tauri_plugin_updater::UpdaterExt;

/// How often a running CLARIX re-checks for a new version.
const UPDATE_CHECK_INTERVAL: std::time::Duration = std::time::Duration::from_secs(6 * 60 * 60);

/// Look for a newer release and, when `install` is set, apply it.
///
/// Updates are only *installed* at launch, never while the app is already
/// running. CLARIX records meetings, and both platforms have to replace the
/// running binary to update — on Windows the installer terminates the app. A
/// surprise relaunch mid-meeting would lose the recording, so a running
/// instance only notifies and the update lands on the next start.
///
/// Every failure here is logged and swallowed on purpose: the network being
/// down, or GitHub being slow, must never stop CLARIX from opening.
async fn check_for_update(app: tauri::AppHandle, install: bool) {
    let updater = match app.updater() {
        Ok(u) => u,
        Err(e) => {
            eprintln!("CLARIX: updater unavailable ({e})");
            return;
        }
    };

    let update = match updater.check().await {
        Ok(Some(u)) => u,
        Ok(None) => return, // already current
        Err(e) => {
            eprintln!("CLARIX: update check failed ({e})");
            return;
        }
    };

    let version = update.version.clone();

    if !install {
        let _ = app
            .notification()
            .builder()
            .title("CLARIX update ready")
            .body(format!("Version {version} installs the next time you open CLARIX."))
            .show();
        return;
    }

    if let Err(e) = update.download_and_install(|_, _| {}, || {}).await {
        // A failed update is not a broken app — it just keeps running the
        // version it already has, and tries again next launch.
        eprintln!("CLARIX: could not install update {version} ({e})");
        return;
    }

    // macOS swaps the bundle in place and needs an explicit relaunch. The
    // Windows installer restarts the app itself, so this is a no-op there.
    app.restart();
}

/// WebView2 asks the user for microphone access the first time a page calls
/// getUserMedia, and that prompt is easy to miss on a transparent, borderless
/// overlay — so recording appeared to hang. We answer it ourselves: the app's
/// own consent step already gates recording, so once the user has agreed there,
/// the mic should just open. Only MICROPHONE is auto-allowed; every other
/// permission (camera, geolocation, notifications…) is left to the default UI.
#[cfg(target_os = "windows")]
fn allow_microphone(window: &tauri::WebviewWindow) {
    use webview2_com::Microsoft::Web::WebView2::Win32::{
        ICoreWebView2, ICoreWebView2PermissionRequestedEventArgs, COREWEBVIEW2_PERMISSION_KIND,
        COREWEBVIEW2_PERMISSION_KIND_MICROPHONE, COREWEBVIEW2_PERMISSION_STATE_ALLOW,
    };
    use webview2_com::PermissionRequestedEventHandler;

    let _ = window.with_webview(|webview| unsafe {
        let core = match webview.controller().CoreWebView2() {
            Ok(c) => c,
            Err(_) => return,
        };
        let mut token = 0i64;
        let _ = core.add_PermissionRequested(
            &PermissionRequestedEventHandler::create(Box::new(
                |_sender: Option<ICoreWebView2>,
                 args: Option<ICoreWebView2PermissionRequestedEventArgs>| {
                    if let Some(args) = args {
                        let mut kind = COREWEBVIEW2_PERMISSION_KIND(0);
                        args.PermissionKind(&mut kind)?;
                        if kind == COREWEBVIEW2_PERMISSION_KIND_MICROPHONE {
                            args.SetState(COREWEBVIEW2_PERMISSION_STATE_ALLOW)?;
                        }
                    }
                    Ok(())
                },
            )),
            &mut token,
        );
    });
}

#[cfg(not(target_os = "windows"))]
fn allow_microphone(_window: &tauri::WebviewWindow) {}

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
        // Must be registered first. Closing CLARIX only hides it to the tray,
        // so a "closed" app is usually still running — and launching it again
        // started a second process that raced the first for the global
        // shortcut and died during setup, which looked like the app flashing
        // and vanishing. Now a second launch just surfaces the first.
        .plugin(tauri_plugin_single_instance::init(|app, _argv, _cwd| {
            summon(app);
        }))
        .plugin(tauri_plugin_notification::init())
        .plugin(tauri_plugin_updater::Builder::new().build())
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
            // Self-update. The first pass installs (nothing can be recording
            // yet at launch); later passes only notify, so a long-running tray
            // instance still learns about releases without being restarted out
            // from under a meeting.
            let updater_handle = app.handle().clone();
            tauri::async_runtime::spawn(async move {
                check_for_update(updater_handle.clone(), true).await;
                loop {
                    tokio::time::sleep(UPDATE_CHECK_INTERVAL).await;
                    check_for_update(updater_handle.clone(), false).await;
                }
            });

            // Global shortcut: Ctrl/Cmd+Shift+R toggles the overlay from
            // anywhere. The tray's "Open CLARIX" re-summons it if it's hidden.
            let overlay_shortcut =
                Shortcut::new(Some(Modifiers::CONTROL | Modifiers::SHIFT), Code::KeyR);
            // Never fatal. Any other app holding Ctrl+Shift+R makes this fail,
            // and `?` here meant the whole app refused to start over a
            // convenience binding. Losing the hotkey is survivable; losing the
            // app is not — the tray and the dashboard button still work.
            if let Err(e) = app.global_shortcut().register(overlay_shortcut) {
                eprintln!(
                    "CLARIX: could not register Ctrl+Shift+R ({e}). \
                     The overlay is still reachable from the tray and the dashboard."
                );
            }

            // Answer WebView2's mic prompt in both windows (the overlay records;
            // the dashboard has the in-app recorder too).
            for label in ["main", "overlay"] {
                if let Some(w) = app.get_webview_window(label) {
                    allow_microphone(&w);
                }
            }

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
