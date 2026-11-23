import { describe, expect, it } from "vitest";
import { gameReducer, initialGameState as s0, isGameState, type GameState } from "./game-reducer";
import { gameKey, loadGame, saveGame } from "./session-store";

const run = (...actions: Parameters<typeof gameReducer>[1][]) => actions.reduce(gameReducer, s0);

describe("gameReducer", () => {
  it("starts at 120 HP and 3 Enekoro", () => {
    expect(s0).toMatchObject({ hp: 120, enekoro: 3, turn: 1, starter: null });
  });

  it("gives 2 Enekoro to the starter on turn 1 only", () => {
    expect(run({ type: "setStarter", starter: "me" }).enekoro).toBe(2);
    expect(run({ type: "setStarter", starter: "rival" }).enekoro).toBe(3);
    const later = run({ type: "endTurn" }, { type: "setStarter", starter: "me" });
    expect(later.starter).toBeNull();
  });

  it("never goes below 0 HP or 0 Enekoro", () => {
    expect(run({ type: "adjustHp", delta: -200 }).hp).toBe(0);
    expect(run({ type: "adjustEnekoro", delta: -5 }).enekoro).toBe(0);
  });

  it("blocks the move used in the previous turn", () => {
    const s = run({ type: "toggleUsedMove", code: "A" }, { type: "endTurn" });
    expect(s).toMatchObject({ turn: 2, blockedMove: "A", usedMove: null, enekoro: 3 });
    expect(gameReducer(s, { type: "toggleUsedMove", code: "A" }).usedMove).toBeNull();
    expect(gameReducer(s, { type: "toggleUsedMove", code: "B" }).usedMove).toBe("B");
  });

  it("unblocks after a turn without using it", () => {
    const s = run({ type: "toggleUsedMove", code: "A" }, { type: "endTurn" }, { type: "endTurn" });
    expect(s.blockedMove).toBeNull();
  });

  it("resets the Enekoro modifier at the end of the turn", () => {
    const s = run({ type: "adjustEnekoro", delta: 2 }, { type: "endTurn" });
    expect(s.enekoro).toBe(3);
  });

  it("toggles the used move", () => {
    expect(run({ type: "toggleUsedMove", code: "A" }, { type: "toggleUsedMove", code: "A" }).usedMove).toBeNull();
  });
});

describe("isGameState", () => {
  it("rejects malformed data", () => {
    expect(isGameState(s0)).toBe(true);
    expect(isGameState({ ...s0, hp: -1 })).toBe(false);
    expect(isGameState({ ...s0, starter: "x" })).toBe(false);
    expect(isGameState("nope")).toBe(false);
  });
});

class MemoryStorage implements Storage {
  private data = new Map<string, string>();
  get length() {
    return this.data.size;
  }
  clear() {
    this.data.clear();
  }
  getItem(k: string) {
    return this.data.get(k) ?? null;
  }
  key(i: number) {
    return [...this.data.keys()][i] ?? null;
  }
  removeItem(k: string) {
    this.data.delete(k);
  }
  setItem(k: string, v: string) {
    this.data.set(k, v);
  }
}

describe("session store", () => {
  it("round-trips and keeps only the current match", () => {
    const storage = new MemoryStorage();
    const state: GameState = { ...s0, hp: 90 };
    saveGame(gameKey("old"), s0, storage);
    saveGame(gameKey("new"), state, storage);
    expect(loadGame(gameKey("new"), storage)).toEqual(state);
    expect(loadGame(gameKey("old"), storage)).toBeNull();
  });

  it("ignores corrupt data and failing storage", () => {
    const storage = new MemoryStorage();
    storage.setItem(gameKey("x"), "{not json");
    expect(loadGame(gameKey("x"), storage)).toBeNull();

    const broken = { getItem: () => { throw new Error("blocked"); } } as unknown as Storage;
    expect(loadGame("k", broken)).toBeNull();
    expect(() => saveGame("k", s0, broken)).not.toThrow();
  });
});
