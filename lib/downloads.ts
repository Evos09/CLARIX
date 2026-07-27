// Desktop app download links for the public /download page.
//
// Windows is hosted as a static file in /public/downloads (served straight from
// the site). macOS can't be built on Windows — it comes from the GitHub Actions
// macOS runner (push a `desktop-v*` tag). Once that build exists, drop the .dmg
// into /public/downloads and set MAC_DOWNLOAD_URL below.

export const WINDOWS_DOWNLOAD_URL = "/downloads/CLARIX-Windows-Setup.exe";

// macOS universal .dmg built by GitHub Actions (macos runner) and hosted here.
export const MAC_DOWNLOAD_URL = "/downloads/CLARIX-macOS.dmg";

export const WINDOWS_LIVE = WINDOWS_DOWNLOAD_URL.length > 0;
export const MAC_LIVE = MAC_DOWNLOAD_URL.length > 0;
