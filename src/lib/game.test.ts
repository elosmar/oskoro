import { describe, expect, it } from "vitest";
import { gameReducer, initialGameState as s0, isGameState, type GameState } from "./game-reducer";
import { gameKey, loadGame, saveGame } from "./session-store";

const run = (...actions: Parameters<typeof gameReducer>[1][]) => actions.reduce(gameReducer, s0);

describe("gameReducer", () => {
  it("starts at turn 1 with 120 HP", () => {
    expect(s0).toEqual({
      turn: 1,
      hp: 120,
      usedMove: null,
      blockedMove: null,
      rivalMove: null,
      rivalSeen: [],
      rivalMoveIsNew: false,
    });
  });

  it("never heals beyond the Characard max HP (120)", () => {
    expect(run({ type: "adjustHp", delta: 20 }).hp).toBe(120);
    expect(run({ type: "adjustHp", delta: -10 }, { type: "adjustHp", delta: 20 }).hp).toBe(120);
  });

  it("never goes below 0 HP", () => {
    expect(run({ type: "adjustHp", delta: -200 }).hp).toBe(0);
    expect(run({ type: "adjustHp", delta: -20 }, { type: "adjustHp", delta: 10 }).hp).toBe(110);
  });

  it("blocks the move used in the previous turn", () => {
    const s = run({ type: "toggleUsedMove", code: "A" }, { type: "endTurn" });
    expect(s).toMatchObject({ turn: 2, blockedMove: "A", usedMove: null });
    expect(gameReducer(s, { type: "toggleUsedMove", code: "A" }).usedMove).toBeNull();
    expect(gameReducer(s, { type: "toggleUsedMove", code: "B" }).usedMove).toBe("B");
  });

  it("unblocks after a turn using another move", () => {
    const s = run(
      { type: "toggleUsedMove", code: "A" },
      { type: "endTurn" },
      { type: "toggleUsedMove", code: "B" },
      { type: "endTurn" },
    );
    expect(s.blockedMove).toBe("B");
    expect(gameReducer(s, { type: "toggleUsedMove", code: "A" }).usedMove).toBe("A");
  });

  it("can't end a turn without marking the used move (no passing)", () => {
    expect(run({ type: "endTurn" })).toBe(s0);
  });

  it("toggles the used move", () => {
    expect(run({ type: "toggleUsedMove", code: "A" }, { type: "toggleUsedMove", code: "A" }).usedMove).toBeNull();
  });
});

describe("rival moves", () => {
  it("remembers rival moves across turns, in first-seen order", () => {
    const s = run(
      { type: "toggleRivalMove", code: "R2" },
      { type: "toggleUsedMove", code: "A" },
      { type: "endTurn" },
      { type: "toggleRivalMove", code: "R1" },
    );
    expect(s.rivalSeen).toEqual(["R2", "R1"]);
    expect(s.rivalMove).toBe("R1");
  });

  it("clears the mark on end turn but keeps what was seen", () => {
    const s = run({ type: "toggleRivalMove", code: "R1" }, { type: "toggleUsedMove", code: "A" }, { type: "endTurn" });
    expect(s).toMatchObject({ rivalMove: null, rivalSeen: ["R1"], rivalMoveIsNew: false });
  });

  it("forgets a move first seen by a mark that is undone (misclick)", () => {
    expect(run({ type: "toggleRivalMove", code: "R1" }, { type: "toggleRivalMove", code: "R1" }).rivalSeen).toEqual([]);
    // Misclick on R1, then the right card R2.
    expect(run({ type: "toggleRivalMove", code: "R1" }, { type: "toggleRivalMove", code: "R2" }).rivalSeen).toEqual([
      "R2",
    ]);
  });

  it("keeps a move seen in an earlier turn when its mark is undone", () => {
    const s = run(
      { type: "toggleRivalMove", code: "R1" },
      { type: "toggleUsedMove", code: "A" },
      { type: "endTurn" },
      { type: "toggleRivalMove", code: "R1" },
      { type: "toggleRivalMove", code: "R1" },
    );
    expect(s).toMatchObject({ rivalMove: null, rivalSeen: ["R1"] });
  });

  it("reset forgets the rival moves", () => {
    expect(run({ type: "toggleRivalMove", code: "R1" }, { type: "reset" })).toBe(s0);
  });
});

describe("isGameState", () => {
  it("rejects malformed data", () => {
    expect(isGameState(s0)).toBe(true);
    expect(isGameState({ ...s0, hp: -1 })).toBe(false);
    expect(isGameState({ ...s0, turn: 0 })).toBe(false);
    expect(isGameState({ ...s0, usedMove: 3 })).toBe(false);
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

  it("keeps a match saved before rival tracking existed", () => {
    const storage = new MemoryStorage();
    storage.setItem(gameKey("v1"), JSON.stringify({ turn: 3, hp: 80, usedMove: null, blockedMove: "A" }));
    expect(loadGame(gameKey("v1"), storage)).toEqual({ ...s0, turn: 3, hp: 80, blockedMove: "A" });
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
