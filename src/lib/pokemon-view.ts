/** View models for Pokémon tiles, built by pages from the data bundle. */
import type { CardSet, EnergyType } from "./data/constants";
import type { DataBundle } from "./data/schema";
import { format } from "./format";

export interface PokemonTile {
  code: string;
  name: string;
  type: { key: EnergyType; label: string };
  weakness: { key: EnergyType; label: string };
  moveCountLabel: string;
}

export interface PokemonGroup {
  id: string;
  title: string;
  tiles: PokemonTile[];
}

const POKEMON_SETS = ["ST", "EB01", "EB02"] as const;

export function toPokemonGroups(
  bundle: DataBundle,
  texts: { sets: Record<CardSet, string>; moveCount: string },
): PokemonGroup[] {
  return POKEMON_SETS.map((set) => ({
    id: set,
    title: texts.sets[set],
    tiles: bundle.pokemon
      .filter((p) => p.set === set)
      .map((p) => ({
        code: p.code,
        name: p.name,
        type: { key: p.type, label: bundle.types[p.type].name },
        weakness: { key: p.weakness, label: bundle.types[p.weakness].name },
        moveCountLabel: format(texts.moveCount, { count: p.moveCodes.length }),
      })),
  }));
}
