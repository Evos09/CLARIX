// Desktop app download links for the public /download page.
//
// Both installers are hosted as static files in /public/downloads and served
// straight from the site. Windows is built locally (npm run build:windows in
// clarix-desktop, then copy the NSIS .exe here). macOS can't be built on
// Windows — it comes from the GitHub Actions macOS runner: push a `desktop-v*`
// tag, then download the .dmg from the draft release it creates and drop it in
// /public/downloads.
//
// Keep the version constants in step with the files actually sitting in
// /public/downloads. The page shows them, so a stale number is a visible lie.

export const WINDOWS_DOWNLOAD_URL = "/downloads/CLARIX-Windows-Setup.exe";
export const WINDOWS_VERSION = "1.0.6";

// macOS universal .dmg built by GitHub Actions (macos runner) and hosted here.
// Deliberately BEHIND Windows: the macOS leg of the 1.0.6 build failed
// (`tauri build --target universal-apple-darwin`, exit 1), so the newest .dmg
// that exists is still 1.0.5. Windows shipped anyway because fail-fast is off.
// Do not raise this until a macOS build actually succeeds — the page shows this
// number, and claiming a version nobody can download is a visible lie.
export const MAC_DOWNLOAD_URL = "/downloads/CLARIX-macOS.dmg";
export const MAC_VERSION = "1.0.5";

export const WINDOWS_LIVE = true;

/**
 * macOS is DORMANT — deliberately not offered on the site.
 *
 * The build works (confirmed on real hardware) and CI still produces it, but it
 * is unsigned, so installing means clicking past a Gatekeeper warning to run an
 * app that listens to your meetings. That is the worst possible moment to ask
 * someone for trust. Silencing it needs Apple notarization, which needs a
 * $99/yr Apple Developer account we don't have yet.
 *
 * The .dmg stays hosted but unlinked. NOTE: as of 1.0.6 the feed no longer
 * carries darwin entries — the macOS build failed, so that job never wrote any.
 * A Mac still on 1.0.5 simply gets "no update available", which is correct;
 * there is nothing newer for it. The entries return with the next macOS build
 * that succeeds.
 *
 * To bring it back: buy the Apple Developer account, add the APPLE_* secrets
 * listed in clarix-desktop/README.md, cut a release, then flip this to true.
 */
export const MAC_LIVE = false;

/**
 * The floating overlay shipped in 1.0.1. Builds older than that genuinely do
 * not have it — say so on the page rather than advertising a feature the build
 * cannot deliver.
 */
export const OVERLAY_MIN_VERSION = "1.0.1";
export const WINDOWS_HAS_OVERLAY = WINDOWS_VERSION >= OVERLAY_MIN_VERSION;
export const MAC_HAS_OVERLAY = MAC_VERSION >= OVERLAY_MIN_VERSION;
