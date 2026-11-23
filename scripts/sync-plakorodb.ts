/**
 * Fetches only the text sources of PlakoroDB at a pinned commit.
 *
 * The upstream repo is ~716 MB (card PNGs), so we use a partial, sparse clone
 * that downloads just `database*\/text`. The result lives in `vendor/PlakoroDB`
 * (git-ignored). Production builds never need it: they use the committed JSON.
 *
 * Usage: npm run data:sync
 */
import { execFileSync } from "node:child_process";
import { existsSync, rmSync } from "node:fs";
import path from "node:path";
import { PLAKORODB_COMMIT, PLAKORODB_REPO } from "./plakorodb";

const target = path.resolve(process.cwd(), "vendor/PlakoroDB");

function git(args: string[], cwd?: string) {
  execFileSync("git", args, { cwd, stdio: "inherit" });
}

if (existsSync(target)) rmSync(target, { recursive: true, force: true });

git([
  "clone",
  "--filter=blob:none",
  "--no-checkout",
  "--sparse",
  PLAKORODB_REPO,
  target,
]);
// Only Markdown: `text/korocards` holds .koro files with embedded images.
git(
  [
    "sparse-checkout",
    "set",
    "--no-cone",
    "/database*/text/*.md",
    "/database*/text/wazacards/**/*.md",
  ],
  target,
);
git(["checkout", "--quiet", PLAKORODB_COMMIT], target);

console.log(`PlakoroDB synced at ${PLAKORODB_COMMIT.slice(0, 7)} -> ${target}`);
