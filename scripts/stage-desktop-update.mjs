// Stage a desktop release for self-updating clients.
//
// WHY THIS EXISTS: the CLARIX repo is private, so GitHub Release assets 404 for
// anyone without repo access — including every installed copy of the app. The
// updater therefore points at https://www.clarixmeetings.com/downloads/, which
// is public. This script takes the artifacts built by the Desktop Release
// workflow and lays them out there, rewriting latest.json's URLs to match.
//
// Usage, after downloading the release assets into one folder:
//   node scripts/stage-desktop-update.mjs <folder>
//
// Required in <folder> (exact names from the release):
//   latest.json
//   CLARIX_<version>_x64-setup.exe        + .sig
//   CLARIX_universal.app.tar.gz           + .sig
// Optional, for the /download page:
//   CLARIX_<version>_universal.dmg
//
// The .sig files are only used to cross-check the signatures already embedded
// in latest.json. A mismatch means the download and the feed disagree, which
// would make every client reject the update — so it is a hard failure here
// rather than a silent one on users' machines.

import { readFileSync, writeFileSync, copyFileSync, existsSync, readdirSync } from "node:fs";
import { join } from "node:path";

const BASE = "https://www.clarixmeetings.com/downloads";
const OUT = "public/downloads";

const src = process.argv[2];
if (!src) {
  console.error("usage: node scripts/stage-desktop-update.mjs <folder-with-release-assets>");
  process.exit(1);
}
if (!existsSync(src)) {
  console.error(`no such folder: ${src}`);
  process.exit(1);
}

const feedPath = join(src, "latest.json");
if (!existsSync(feedPath)) {
  console.error(`latest.json not found in ${src}. Download it from the GitHub Release.`);
  process.exit(1);
}

const feed = JSON.parse(readFileSync(feedPath, "utf8"));
const files = readdirSync(src);
const find = (re) => files.find((f) => re.test(f));

// The updater downloads these exact files; the .dmg and .msi are installer-only.
// Matched by prefix, not exact key: a universal macOS build is published as
// "darwin-universal" by some Tauri versions and as separate "darwin-aarch64" +
// "darwin-x86_64" entries by others, and all of them point at the same
// universal tarball.
const winFile = find(/^CLARIX_.*_x64-setup\.exe$/);
const macFile = find(/^CLARIX_universal\.app\.tar\.gz$/);
const artifactFor = (platform) =>
  platform.startsWith("windows") ? winFile : platform.startsWith("darwin") ? macFile : undefined;

const staged = [];
let failed = false;

for (const [platform, entry] of Object.entries(feed.platforms ?? {})) {
  const file = artifactFor(platform);
  if (!file) {
    console.error(`FAIL ${platform}: latest.json lists this platform but its artifact is missing from ${src}`);
    failed = true;
    continue;
  }

  // Cross-check: the signature in the feed must equal the .sig file shipped
  // alongside the binary. If they drift, clients reject the update.
  const sigPath = join(src, `${file}.sig`);
  if (existsSync(sigPath)) {
    const onDisk = readFileSync(sigPath, "utf8").trim();
    if (onDisk !== (entry.signature ?? "").trim()) {
      console.error(`FAIL ${platform}: ${file}.sig does not match the signature in latest.json`);
      failed = true;
      continue;
    }
  } else {
    console.warn(`warn ${platform}: no ${file}.sig to cross-check against`);
  }

  copyFileSync(join(src, file), join(OUT, file));
  entry.url = `${BASE}/${file}`;
  staged.push(`${platform} -> ${file}`);
}

if (!staged.length) {
  console.error("nothing staged — latest.json listed no usable platforms");
  process.exit(1);
}
if (failed) {
  console.error("\nrefusing to write latest.json while any platform is broken");
  process.exit(1);
}

// The installers the /download page links to keep their stable names, so the
// page never needs a new URL.
const dmg = find(/^CLARIX_.*_universal\.dmg$/);
const exe = winFile;
if (dmg) {
  copyFileSync(join(src, dmg), join(OUT, "CLARIX-macOS.dmg"));
  staged.push(`installer -> CLARIX-macOS.dmg (${dmg})`);
}
if (exe) {
  copyFileSync(join(src, exe), join(OUT, "CLARIX-Windows-Setup.exe"));
  staged.push(`installer -> CLARIX-Windows-Setup.exe (${exe})`);
}

writeFileSync(join(OUT, "latest.json"), `${JSON.stringify(feed, null, 2)}\n`);

console.log(`staged version ${feed.version}:`);
for (const line of staged) console.log(`  ${line}`);
console.log(`\nwrote ${OUT}/latest.json`);
console.log(`\nNext: set WINDOWS_VERSION / MAC_VERSION to "${feed.version}" in lib/downloads.ts, then commit and push.`);
