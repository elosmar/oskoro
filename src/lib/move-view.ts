/**
 * View models for move cards. Pages build them from the data bundle and pass
 * them to presentational components (which never import the bundles).
 */
import { ENERGY_TYPES, ORIENTATIONS, type EnergyType, type Orientation } from "./data/constants";
import type { DataBundle, Move } from "./data/schema";

export interface MoveView {
  code: string;
  name: string;
  japanese: string;
  official: boolean;
  type: EnergyType;
  energy: EnergyType[];
  damage: number | null;
  effect: string | null;
  orientations: { key: Orientation; text: string | null }[];
}

/** Localized names for symbols used inside card text. */
export interface SymbolLabels {
  types: Record<EnergyType, string>;
  orientations: Record<Orientation, { name: string; japanese: string }>;
}

export const toMoveView = (move: Move): MoveView => ({
  code: move.code,
  name: move.name,
  japanese: move.japanese,
  official: move.official,
  type: move.type,
  energy: move.energy,
  damage: move.damage,
  effect: move.effect,
  orientations: ORIENTATIONS.map((key) => ({ key, text: move.orientations[key] ?? null })),
});

export function toSymbolLabels(bundle: DataBundle): SymbolLabels {
  const types = Object.fromEntries(ENERGY_TYPES.map((t) => [t, bundle.types[t].name])) as SymbolLabels["types"];
  return { types, orientations: bundle.orientations };
}

export function movesOf(bundle: DataBundle, pokemonCode: string): MoveView[] {
  const pokemon = bundle.pokemon.find((p) => p.code === pokemonCode);
  if (!pokemon) return [];
  const byCode = new Map(bundle.moves.map((m) => [m.code, m]));
  return pokemon.moveCodes.flatMap((c) => {
    const m = byCode.get(c);
    return m ? [toMoveView(m)] : [];
  });
}
