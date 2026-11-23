/**
 * Pure parsers that turn PlakoroDB Markdown into the app's data model.
 *
 * Row labels are translated in every language ("Name" -> "Nombre"), so every
 * table is read BY ROW POSITION, never by label.
 */
import {
  ENERGY_TYPES,
  ORIENTATIONS,
  type CardSet,
  type DataBundle,
  type EnergyType,
  type Lang,
  type Move,
  type Orientation,
  type Pokemon,
} from "./schema";

export interface Sources {
  characards: string;
  symbols: string;
  /** Path relative to `text/wazacards`, e.g. "ST/04-001_pikachu.md". */
  wazacards: { path: string; content: string }[];
}

export interface RawMove {
  name: string;
  japanese: string;
  type: string;
  code: string;
  energy: string;
  damage: string;
  effect: string;
  orientations: string[]; // standing, handstand, back, down, sideways
}

export interface RawCharacard {
  name: string;
  type: string;
  code: string;
  weakness: string;
  hp: string;
}

// Wazacard table: 13 data rows + 1 separator = 14 lines.
const WAZACARD_ROWS = 13;
// Characard table: Name, Type, Code, Weakness, HP.
const CHARACARD_ROWS = 5;

export function splitRow(line: string): string[] {
  return line
    .trim()
    .replace(/^\|/, "")
    .replace(/\|$/, "")
    .split("|")
    .map((cell) => cell.trim());
}

const isSeparator = (cells: string[]) => cells.every((c) => /^:?-+:?$/.test(c));

/** Returns every Markdown table as a list of rows (separator rows removed). */
export function parseTables(md: string): string[][][] {
  const tables: string[][][] = [];
  let current: string[][] | null = null;
  for (const line of md.split(/\r?\n/)) {
    if (line.trim().startsWith("|")) {
      const cells = splitRow(line);
      current ??= [];
      if (!isSeparator(cells)) current.push(cells);
    } else if (current) {
      tables.push(current);
      current = null;
    }
  }
  if (current) tables.push(current);
  return tables;
}

const value = (rows: string[][], i: number) => rows[i]?.[1] ?? "";

export function parseWazacards(md: string): RawMove[] {
  return parseTables(md)
    .filter((t) => t.length === WAZACARD_ROWS)
    .map((t) => ({
      name: value(t, 0),
      japanese: value(t, 1),
      type: value(t, 2),
      code: value(t, 3),
      // row 4 is the Pokémon name; ownership comes from the file path instead
      energy: value(t, 5),
      damage: value(t, 6),
      effect: value(t, 7),
      orientations: [8, 9, 10, 11, 12].map((i) => value(t, i)),
    }));
}

export function parseCharacards(md: string): RawCharacard[] {
  return parseTables(md)
    .filter((t) => t.length === CHARACARD_ROWS)
    .map((t) => ({
      name: value(t, 0),
      type: value(t, 1),
      code: value(t, 2),
      weakness: value(t, 3),
      hp: value(t, 4),
    }))
    .filter((c) => c.code !== ""); // skip the template
}

export interface Symbols {
  types: Record<EnergyType, { name: string; japanese: string }>;
  orientations: Record<Orientation, { name: string; japanese: string }>;
}

export function parseSymbols(md: string): Symbols {
  const tables = parseTables(md);
  // tables[n][0] is the header row
  const typeRows = tables[0]?.slice(1) ?? [];
  const orientationRows = tables[1]?.slice(1) ?? [];

  const types = {} as Symbols["types"];
  for (const [name, japanese, letter] of typeRows) {
    const key = letter?.replace(/[{}]/g, "") as EnergyType;
    if (ENERGY_TYPES.includes(key)) types[key] = { name, japanese };
  }

  const orientations = {} as Symbols["orientations"];
  orientationRows.forEach(([name, , japanese], i) => {
    const key = ORIENTATIONS[i];
    if (key) orientations[key] = { name, japanese };
  });

  return { types, orientations };
}

const FAN_NAME = /\s*\?\s*$/;

export function parseEnergy(raw: string): EnergyType[] {
  const tokens = [...raw.matchAll(/\{([A-Z])\}/g)].map((m) => m[1]);
  return tokens.map((t) => {
    if (!ENERGY_TYPES.includes(t as EnergyType)) throw new Error(`Unknown energy token {${t}}`);
    return t as EnergyType;
  });
}

export function parseDamage(raw: string): number | null {
  if (raw === "") return null;
  const n = Number(raw);
  if (!Number.isInteger(n)) throw new Error(`Invalid damage "${raw}"`);
  return n;
}

/** "ST/04-001_pikachu.md" -> { set: "ST", pokemonCode: "STC04-001" } */
export function pokemonFromPath(p: string): { set: Exclude<CardSet, "PR">; pokemonCode: string } {
  const m = p.match(/^(ST|EB01|EB02)\/(\d{2}-\d{3})_/);
  if (!m) throw new Error(`Unexpected wazacard path "${p}"`);
  const set = m[1] as "ST" | "EB01" | "EB02";
  return { set, pokemonCode: `${set === "ST" ? "STC" : "EBC"}${m[2]}` };
}

/** Uses the localized value, falling back to English when it is empty. */
const pick = (local: string | undefined, en: string) => (local && local !== "" ? local : en);

export interface BuildOptions {
  lang: Lang;
  en: Sources;
  local: Sources | null; // null for English itself
  source: DataBundle["source"];
}

export function buildBundle({ lang, en, local, source }: BuildOptions): DataBundle {
  const enSymbols = parseSymbols(en.symbols);
  const localSymbols = local ? parseSymbols(local.symbols) : enSymbols;

  // English type names are the stable key ("Electric" -> "L").
  const typeByEnName = new Map<string, EnergyType>(
    ENERGY_TYPES.map((t) => [enSymbols.types[t].name, t]),
  );
  const toType = (enName: string): EnergyType => {
    const t = typeByEnName.get(enName);
    if (!t) throw new Error(`Unknown type name "${enName}"`);
    return t;
  };

  const types = {} as DataBundle["types"];
  for (const t of ENERGY_TYPES) {
    types[t] = {
      name: pick(localSymbols.types[t]?.name, enSymbols.types[t].name),
      japanese: enSymbols.types[t].japanese,
    };
  }
  const orientations = {} as DataBundle["orientations"];
  for (const o of ORIENTATIONS) {
    orientations[o] = {
      name: pick(localSymbols.orientations[o]?.name, enSymbols.orientations[o].name),
      japanese: enSymbols.orientations[o].japanese,
    };
  }

  // Localized moves indexed by code.
  const localMoves = new Map<string, RawMove>();
  for (const file of local?.wazacards ?? []) {
    for (const m of parseWazacards(file.content)) localMoves.set(m.code, m);
  }

  const moves: Move[] = [];
  const moveCodesByPokemon = new Map<string, string[]>();

  for (const file of en.wazacards) {
    const { set, pokemonCode } = pokemonFromPath(file.path);
    for (const e of parseWazacards(file.content)) {
      const l = localMoves.get(e.code);
      const rawName = pick(l?.name, e.name);
      const effect = pick(l?.effect, e.effect);
      const orientationsText: Move["orientations"] = {};
      ORIENTATIONS.forEach((o, i) => {
        const text = pick(l?.orientations[i], e.orientations[i]);
        if (text !== "") orientationsText[o] = text;
      });

      moves.push({
        code: e.code,
        set: e.code.startsWith("PRW") ? "PR" : set,
        pokemonCode,
        name: rawName.replace(FAN_NAME, ""),
        official: !FAN_NAME.test(rawName),
        japanese: e.japanese,
        type: toType(e.type),
        energy: parseEnergy(e.energy),
        damage: parseDamage(e.damage),
        effect: effect === "" ? null : effect,
        orientations: orientationsText,
      });
      moveCodesByPokemon.set(pokemonCode, [...(moveCodesByPokemon.get(pokemonCode) ?? []), e.code]);
    }
  }

  const localCharas = new Map(
    (local ? parseCharacards(local.characards) : []).map((c) => [c.code, c]),
  );

  const pokemon: Pokemon[] = parseCharacards(en.characards).map((c) => {
    const set = c.code.startsWith("STC") ? "ST" : (`EB${c.code.slice(3, 5)}` as "EB01" | "EB02");
    return {
      code: c.code,
      name: pick(localCharas.get(c.code)?.name, c.name),
      type: toType(c.type),
      weakness: toType(c.weakness),
      hp: Number(c.hp),
      set,
      moveCodes: moveCodesByPokemon.get(c.code) ?? [],
    };
  });

  return { lang, source, types, orientations, pokemon, moves };
}
