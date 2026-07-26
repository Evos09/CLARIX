// Chrome extension listing config.
//
// The extension isn't on the Chrome Web Store yet. Until it's approved, the
// public /extension page shows a "Coming soon" state instead of a live
// "Add to Chrome" button — so we never link users to a listing that 404s.
//
// TO GO LIVE: paste the approved Chrome Web Store URL below. Everything else
// (the button, the page copy) flips to the live state automatically.
export const CHROME_STORE_URL = "";

export const EXTENSION_LIVE = CHROME_STORE_URL.length > 0;
