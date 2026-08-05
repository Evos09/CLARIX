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

// Exactly one match, or none. Point this at a folder holding several releases
// (a Downloads folder collects them) and a "first match wins" lookup would
// quietly stage the wrong version's installer — the kind of mistake that only
// surfaces once someone downloads it.
const find = (re) => {
  const hits = files.filter((f) => re.test(f));
  if (hits.length > 1) {
    console.error(`FAIL ambiguous: ${hits.length} files match ${re} in ${src}:`);
    for (const h of hits) console.error(`  ${h}`);
    console.error("Stage one release at a time — put just this version's assets in their own folder.");
    process.exit(1);
  }
  return hits[0];
};

// Which file each platform needs comes from the feed itself — never guess.
// A real feed carries seven keys (darwin-aarch64, darwin-x86_64, both -app
// variants, windows-x86_64, -msi and -nsis), several pointing at the same
// artifact, and the default windows-x86_64 entry is the MSI, not the NSIS exe.
// Pairing one platform's signature with another's bytes makes every client
// reject the update, so the filename is read straight from entry.url.
const artifactFor = (entry) => decodeURIComponent(String(entry.url ?? "").split("/").pop() ?? "");

const staged = [];
let failed = false;

for (const [platform, entry] of Object.entries(feed.platforms ?? {})) {
  const file = artifactFor(entry);
  if (!file || !existsSync(join(src, file))) {
    console.error(`FAIL ${platform}: needs ${file || "(no url in feed)"}, which is not in ${src}`);
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
const exe = find(/^CLARIX_.*_x64-setup\.exe$/);
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
