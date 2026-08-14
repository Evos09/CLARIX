// Bump the desktop app's version everywhere it is written down, in one step.
//
// WHY THIS EXISTS: the version lives in four places, and the fourth is not a
// file you edit — it is Cargo.lock, which only changes when cargo runs. Both
// 1.0.5 and 1.0.6 shipped a tag whose build died instantly because Cargo.toml
// had been bumped by hand and the lockfile still held the old version. Tauri
// refuses that mismatch, and it kills every leg of the build matrix, so the
// symptom is "the tag produced no release at all" — which looks nothing like a
// version problem and cost a full round trip both times.
//
// Usage:
//   node scripts/bump-desktop-version.mjs 1.0.7
//
// Does NOT commit, tag, or push. It prints those commands; releasing is a
// deliberate act and should stay one.

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { execFileSync } from "node:child_process";

const TAURI_CONF = "clarix-desktop/src-tauri/tauri.conf.json";
const CARGO_TOML = "clarix-desktop/src-tauri/Cargo.toml";
const CARGO_LOCK = "clarix-desktop/src-tauri/Cargo.lock";
const PKG_JSON = "clarix-desktop/package.json";
const DOWNLOADS = "lib/downloads.ts";
const CRATE = "clarix-desktop";

const target = process.argv[2];

function die(msg) {
  console.error(`FAIL  ${msg}`);
  process.exit(1);
}

if (!target) die("usage: node scripts/bump-desktop-version.mjs <version>   e.g. 1.0.7");
if (!/^\d+\.\d+\.\d+$/.test(target)) {
  die(`"${target}" is not a bare semver version (expected e.g. 1.0.7)`);
}
for (const f of [TAURI_CONF, CARGO_TOML, PKG_JSON, DOWNLOADS]) {
  if (!existsSync(f)) die(`missing ${f} — run this from the repo root`);
}

/** Replace, insisting on exactly one match. A silent no-op is the whole bug. */
function replaceOnce(text, re, next, label) {
  const all = new RegExp(re.source, re.flags.includes("g") ? re.flags : re.flags + "g");
  const hits = text.match(all);
  if (!hits) die(`no match for ${label} — the file's shape changed, fix this script`);
  if (hits.length > 1) die(`${hits.length} matches for ${label} — too ambiguous to edit safely`);
  return text.replace(re, next);
}

// 1. tauri.conf.json — the top-level "version", anchored to the start of a line
//    so a nested "version" key elsewhere in the file can never be hit.
{
  const text = readFileSync(TAURI_CONF, "utf8");
  const out = replaceOnce(
    text,
    /^(\s*"version"\s*:\s*")\d+\.\d+\.\d+(")/m,
    `$1${target}$2`,
    `top-level "version" in ${TAURI_CONF}`,
  );
  writeFileSync(TAURI_CONF, out, "utf8");
}

// 2. Cargo.toml — the [package] version ONLY. This file also carries
//    `version = "2"` for tauri and friends; bumping one of those would be a
//    silent dependency change, so the edit is scoped to the [package] block.
{
  const text = readFileSync(CARGO_TOML, "utf8");
  const pkgStart = text.indexOf("[package]");
  if (pkgStart === -1) die(`no [package] section in ${CARGO_TOML}`);
  const nextSection = text.indexOf("\n[", pkgStart + 1);
  const end = nextSection === -1 ? text.length : nextSection;
  const newPkg = replaceOnce(
    text.slice(pkgStart, end),
    /^(version\s*=\s*")\d+\.\d+\.\d+(")/m,
    `$1${target}$2`,
    `[package] version in ${CARGO_TOML}`,
  );
  writeFileSync(CARGO_TOML, text.slice(0, pkgStart) + newPkg + text.slice(end), "utf8");
}

// 3. clarix-desktop/package.json — cosmetic (Tauri takes the version from
//    tauri.conf.json), but it drifted to 1.0.5 while everything else moved to
//    1.0.6, and a version that disagrees with itself is a trap for the next
//    person reading it.
{
  const text = readFileSync(PKG_JSON, "utf8");
  const out = replaceOnce(
    text,
    /^(\s*"version"\s*:\s*")\d+\.\d+\.\d+(")/m,
    `$1${target}$2`,
    `"version" in ${PKG_JSON}`,
  );
  writeFileSync(PKG_JSON, out, "utf8");
}

// 4. lib/downloads.ts — by constant name, so OVERLAY_MIN_VERSION (a floor, not
//    a release number) is never dragged along.
{
  let text = readFileSync(DOWNLOADS, "utf8");
  for (const name of ["WINDOWS_VERSION", "MAC_VERSION"]) {
    text = replaceOnce(
      text,
      new RegExp(`(export const ${name}\\s*=\\s*")\\d+\\.\\d+\\.\\d+(")`),
      `$1${target}$2`,
      `${name} in ${DOWNLOADS}`,
    );
  }
  writeFileSync(DOWNLOADS, text, "utf8");
}

console.log(`updated  ${TAURI_CONF}`);
console.log(`updated  ${CARGO_TOML}`);
console.log(`updated  ${PKG_JSON}`);
console.log(`updated  ${DOWNLOADS}`);

// 5. Cargo.lock — the one that actually broke the last two releases. It is
//    generated, so cargo has to run. `cargo check` is the cheapest command that
//    rewrites it.
console.log("\nsyncing Cargo.lock (cargo check)…");
try {
  execFileSync("cargo", ["check", "--quiet"], {
    cwd: "clarix-desktop/src-tauri",
    stdio: "inherit",
  });
} catch {
  die("cargo check failed — Cargo.lock was NOT synced. Do not tag until this passes.");
}

// Verify every location agrees. Trusting the edits is how this went wrong twice.
const confText = readFileSync(TAURI_CONF, "utf8");
const tomlText = readFileSync(CARGO_TOML, "utf8");
const lockText = readFileSync(CARGO_LOCK, "utf8");
const dlText = readFileSync(DOWNLOADS, "utf8");

const found = {
  "tauri.conf.json": JSON.parse(confText).version,
  "Cargo.toml": tomlText
    .slice(tomlText.indexOf("[package]"))
    .match(/^version\s*=\s*"(\d+\.\d+\.\d+)"/m)?.[1],
  "Cargo.lock": lockText.match(
    new RegExp(`name = "${CRATE}"\\s*\\nversion = "(\\d+\\.\\d+\\.\\d+)"`),
  )?.[1],
  "package.json": JSON.parse(readFileSync(PKG_JSON, "utf8")).version,
  WINDOWS_VERSION: dlText.match(/export const WINDOWS_VERSION\s*=\s*"(\d+\.\d+\.\d+)"/)?.[1],
  MAC_VERSION: dlText.match(/export const MAC_VERSION\s*=\s*"(\d+\.\d+\.\d+)"/)?.[1],
};

console.log("\nversion check:");
let bad = false;
for (const [where, v] of Object.entries(found)) {
  const ok = v === target;
  if (!ok) bad = true;
  console.log(`  ${ok ? "ok  " : "BAD "} ${where.padEnd(16)} ${v ?? "(not found)"}`);
}
if (bad) die(`not every location reads ${target} — do not tag this.`);

console.log(`\nAll six agree on ${target}. Next:\n`);
console.log(`  git add ${TAURI_CONF} ${CARGO_TOML} ${CARGO_LOCK} ${PKG_JSON} ${DOWNLOADS}`);
console.log(`  git commit -m "chore(desktop): ${target}"`);
console.log(`  git push origin main`);
console.log(`  git tag desktop-v${target} && git push origin desktop-v${target}`);
console.log(`\nThe tag is what builds it. Once the workflow publishes the draft`);
console.log(`release, stage the artifacts to the site:`);
console.log(`  node scripts/stage-desktop-update.mjs <folder-with-release-assets>`);
