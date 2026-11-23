/**
 * Data for "Mi mesa". The setup only exists in the URL (client side), so the
 * page ships every Pokémon's moves for the current language (~10 KB gzipped).
 */
import type { EnergyType } from "./data/constants";
import type { DataBundle } from "./data/schema";
import { toMoveView, type MoveView } from "./move-view";

export interface TablePokemon {
  code: string;
  name: string;
  type: EnergyType;
  typeLabel: string;
  moveCodes: string[];
}

export interface TableData {
  pokemon: TablePokemon[];
  moves: Record<string, MoveView>;
}

export function toTableData(bundle: DataBundle): TableData {
  return {
    pokemon: bundle.pokemon.map((p) => ({
      code: p.code,
      name: p.name,
      type: p.type,
      typeLabel: bundle.types[p.type].name,
      moveCodes: p.moveCodes,
    })),
    moves: Object.fromEntries(bundle.moves.map((m) => [m.code, toMoveView(m)])),
  };
}
