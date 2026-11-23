/**
 * Counters persist in sessionStorage (cleared when the tab closes) so a reload
 * or a mobile tab discard doesn't lose the match. Every access is guarded: if
 * storage is unavailable the app keeps working in memory.
 */
import { isGameState, type GameState } from "./game-reducer";

const PREFIX = "oskoro:game:";

export const gameKey = (setupQuery: string) => `${PREFIX}${setupQuery}`;

export function loadGame(key: string, storage?: Storage): GameState | null {
  try {
    const raw = (storage ?? window.sessionStorage).getItem(key);
    if (!raw) return null;
    const parsed: unknown = JSON.parse(raw);
    return isGameState(parsed) ? parsed : null;
  } catch {
    return null;
  }
}

export function saveGame(key: string, state: GameState, storage?: Storage): void {
  try {
    const s = storage ?? window.sessionStorage;
    // Only one match per tab: drop counters of previous setups.
    for (let i = s.length - 1; i >= 0; i--) {
      const k = s.key(i);
      if (k?.startsWith(PREFIX) && k !== key) s.removeItem(k);
    }
    s.setItem(key, JSON.stringify(state));
  } catch {
    // Storage full, blocked or unavailable: stay in memory.
  }
}
