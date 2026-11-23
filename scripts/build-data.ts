/**
 * Converts the PlakoroDB Markdown (vendor/PlakoroDB) into validated JSON
 * bundles at src/data/<lang>.json. Run `npm run data:sync` first.
 *
 * Usage: npm run data:build
 */
import { globSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import path from "node:path";
import { buildBundle, type Sources } from "../src/lib/data/parse";
import { DataBundleSchema, LANGS, type Lang } from "../src/lib/data/schema";
import { PLAKORODB_COMMIT, PLAKORODB_REPO } from "./plakorodb";

const root = path.resolve(process.cwd(), "vendor/PlakoroDB");
const outDir = path.resolve(process.cwd(), "src/data");

const dirFor = (lang: Lang) => path.join(root, lang === "en" ? "database" : `database_${lang}`, "text");

function readSources(lang: Lang): Sources {
  const dir = dirFor(lang);
  const wazaDir = path.join(dir, "wazacards");
  return {
    characards: readFileSync(path.join(dir, "characards.md"), "utf8"),
    symbols: readFileSync(path.join(dir, "symbols.md"), "utf8"),
    wazacards: globSync("**/*.md", { cwd: wazaDir })
      .sort()
      .map((p) => ({ path: p.split(path.sep).join("/"), content: readFileSync(path.join(wazaDir, p), "utf8") })),
  };
}

const en = readSources("en");
mkdirSync(outDir, { recursive: true });

for (const lang of LANGS) {
  const bundle = buildBundle({
    lang,
    en,
    local: lang === "en" ? null : readSources(lang),
    source: { repo: PLAKORODB_REPO, commit: PLAKORODB_COMMIT, license: "CC BY-NC 4.0" },
  });
  const parsed = DataBundleSchema.parse(bundle);
  writeFileSync(path.join(outDir, `${lang}.json`), JSON.stringify(parsed, null, 2) + "\n");
  console.log(`${lang}: ${parsed.pokemon.length} pokémon, ${parsed.moves.length} moves`);
}
