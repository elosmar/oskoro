/**
 * Renders scripts/icon.svg to the PNG icons used by the manifest and metadata.
 * Dev-only and macOS-only (uses Google Chrome headless + `sips`). The output is
 * committed, so builds don't need it.
 *
 * Usage: npm run icons
 */
import { execFileSync } from "node:child_process";
import { copyFileSync, mkdirSync, mkdtempSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import path from "node:path";

const CHROME = "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome";
const root = process.cwd();
const svg = path.join(root, "scripts/icon.svg");
const tmp = mkdtempSync(path.join(tmpdir(), "oskoro-icons-"));
const page = path.join(tmp, "icon.html");
const master = path.join(tmp, "icon-512.png");

writeFileSync(page, `<!doctype html><body style="margin:0"><img src="file://${svg}" width="512" height="512">`);
execFileSync(CHROME, [
  "--headless=new",
  "--disable-gpu",
  "--hide-scrollbars",
  "--window-size=512,512",
  `--screenshot=${master}`,
  `file://${page}`,
]);

const outputs: [string, number][] = [
  ["public/icons/icon-512.png", 512],
  ["public/icons/icon-192.png", 192],
  ["src/app/icon.png", 192],
  ["src/app/apple-icon.png", 180],
];

mkdirSync(path.join(root, "public/icons"), { recursive: true });
for (const [out, size] of outputs) {
  const target = path.join(root, out);
  copyFileSync(master, target);
  if (size !== 512) execFileSync("sips", ["-z", String(size), String(size), target], { stdio: "ignore" });
  console.log(`${out} (${size}px)`);
}
