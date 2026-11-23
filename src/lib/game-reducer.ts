/**
 * "Mi mesa" state for ONE player. Effects are never resolved automatically:
 * the player adjusts the numbers by hand after reading the card.
 */
export const START_HP = 120;

export interface GameState {
  turn: number;
  hp: number;
  /** Move used this turn (marked by the player). */
  usedMove: string | null;
  /** Move used on your previous turn: can't be used now. */
  blockedMove: string | null;
}

export type GameAction =
  | { type: "adjustHp"; delta: number }
  | { type: "toggleUsedMove"; code: string }
  | { type: "endTurn" }
  | { type: "reset" };

export const initialGameState: GameState = {
  turn: 1,
  hp: START_HP,
  usedMove: null,
  blockedMove: null,
};

export function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case "adjustHp":
      return { ...state, hp: Math.max(0, state.hp + action.delta) };
    case "toggleUsedMove":
      if (action.code === state.blockedMove) return state;
      return { ...state, usedMove: state.usedMove === action.code ? null : action.code };
    case "endTurn":
      return { ...state, turn: state.turn + 1, blockedMove: state.usedMove, usedMove: null };
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
    isCodeOrNull(v.blockedMove)
  );
}
