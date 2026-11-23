/**
 * Team rules: 1 Pokémon and exactly 4 different moves of that Pokémon.
 */
export const TEAM_SIZE = 4;

/** Adds or removes a move. Ignores additions past TEAM_SIZE or foreign moves. */
export function toggleMove(selected: readonly string[], code: string, allowed: readonly string[]): string[] {
  if (selected.includes(code)) return selected.filter((c) => c !== code);
  if (!allowed.includes(code) || selected.length >= TEAM_SIZE) return [...selected];
  return [...selected, code];
}

export function isValidTeam(moves: readonly string[], allowed: readonly string[]): boolean {
  return (
    moves.length === TEAM_SIZE &&
    new Set(moves).size === TEAM_SIZE &&
    moves.every((m) => allowed.includes(m))
  );
}

/** Keeps only known, unique moves, up to TEAM_SIZE (for untrusted URL input). */
export function sanitizeMoves(moves: readonly string[], allowed: readonly string[]): string[] {
  return [...new Set(moves)].filter((m) => allowed.includes(m)).slice(0, TEAM_SIZE);
}
