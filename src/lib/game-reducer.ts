/**
 * "Mi mesa" state for ONE player. Effects are never resolved automatically:
 * the player adjusts the numbers by hand after reading the card.
 */
/** Max HP on every Characard today; healing can't go beyond it (FAQ Basic Rules 27). */
export const START_HP = 120;

export interface GameState {
  turn: number;
  hp: number;
  /** Move used this turn (marked by the player). */
  usedMove: string | null;
  /** Move used on your previous turn: can't be used now. */
  blockedMove: string | null;
  /** Rival move marked this turn (to read its effect). */
  rivalMove: string | null;
  /** Rival moves seen so far this match, in the order they were first marked. */
  rivalSeen: string[];
  /** True if marking `rivalMove` added it to `rivalSeen` (so unmarking undoes it). */
  rivalMoveIsNew: boolean;
}

export type GameAction =
  | { type: "adjustHp"; delta: number }
  | { type: "toggleUsedMove"; code: string }
  | { type: "toggleRivalMove"; code: string }
  | { type: "endTurn" }
  | { type: "reset" };

export const initialGameState: GameState = {
  turn: 1,
  hp: START_HP,
  usedMove: null,
  blockedMove: null,
  rivalMove: null,
  rivalSeen: [],
  rivalMoveIsNew: false,
};

/** Undoes the current rival mark; a move first seen by that mark is forgotten (misclick). */
function clearRivalMark(state: GameState): GameState {
  const rivalSeen =
    state.rivalMoveIsNew && state.rivalMove ? state.rivalSeen.filter((c) => c !== state.rivalMove) : state.rivalSeen;
  return { ...state, rivalMove: null, rivalSeen, rivalMoveIsNew: false };
}

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "adjustHp":
      return { ...state, hp: Math.min(START_HP, Math.max(0, state.hp + action.delta)) };
    case "toggleUsedMove":
      if (action.code === state.blockedMove) return state;
      return { ...state, usedMove: state.usedMove === action.code ? null : action.code };
    case "toggleRivalMove": {
      const cleared = clearRivalMark(state);
      if (state.rivalMove === action.code) return cleared;
      const isNew = !cleared.rivalSeen.includes(action.code);
      return {
        ...cleared,
        rivalMove: action.code,
        rivalSeen: isNew ? [...cleared.rivalSeen, action.code] : cleared.rivalSeen,
        rivalMoveIsNew: isNew,
      };
    }
    case "endTurn":
      // Rules: you can't pass, every turn uses exactly 1 move.
      if (!state.usedMove) return state;
      // New rolls next turn: the rival mark is cleared, but what was seen stays.
      return {
        ...state,
        turn: state.turn + 1,
        blockedMove: state.usedMove,
        usedMove: null,
        rivalMove: null,
        rivalMoveIsNew: false,
      };
    case "reset":
      return initialGameState;
  }
}

/** Accepts only well-formed saved states (sessionStorage is untrusted). */
export function isGameState(value: unknown): value is GameState {
  if (!value || typeof value !== "object") return false;
  const v = value as Record<string, unknown>;
  const isNat = (n: unknown) => typeof n === "number" && Number.isInteger(n) && n >= 0;
  const isCodeOrNull = (c: unknown) => c === null || typeof c === "string";
  return (
    isNat(v.turn) &&
    (v.turn as number) >= 1 &&
    isNat(v.hp) &&
    isCodeOrNull(v.usedMove) &&
    isCodeOrNull(v.blockedMove) &&
    isCodeOrNull(v.rivalMove) &&
    Array.isArray(v.rivalSeen) &&
    v.rivalSeen.every((c) => typeof c === "string") &&
    typeof v.rivalMoveIsNew === "boolean"
  );
}
