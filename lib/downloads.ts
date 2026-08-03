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
export const WINDOWS_VERSION = "1.0.2";

// macOS universal .dmg built by GitHub Actions (macos runner) and hosted here.
export const MAC_DOWNLOAD_URL = "/downloads/CLARIX-macOS.dmg";
export const MAC_VERSION = "1.0.2";

export const WINDOWS_LIVE = WINDOWS_DOWNLOAD_URL.length > 0;
export const MAC_LIVE = MAC_DOWNLOAD_URL.length > 0;

/**
 * The floating overlay shipped in 1.0.1. The hosted macOS build is still 1.0.0,
 * so it genuinely does not have it — say so on the page rather than advertising
 * a feature that build cannot do.
 */
export const OVERLAY_MIN_VERSION = "1.0.1";
export const WINDOWS_HAS_OVERLAY = WINDOWS_VERSION >= OVERLAY_MIN_VERSION;
export const MAC_HAS_OVERLAY = MAC_VERSION >= OVERLAY_MIN_VERSION;
