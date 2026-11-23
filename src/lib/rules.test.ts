import { describe, expect, it } from "vitest";
import { parseSetup, setupQuery } from "./setup-url";
import { isValidTeam, sanitizeMoves, toggleMove } from "./team-rules";
import { tokenize } from "./text-tokens";

const ALLOWED = ["A", "B", "C", "D", "E"];

describe("toggleMove", () => {
  it("adds and removes", () => {
    expect(toggleMove([], "A", ALLOWED)).toEqual(["A"]);
    expect(toggleMove(["A", "B"], "A", ALLOWED)).toEqual(["B"]);
  });

  it("stops at 4 and rejects foreign moves", () => {
    expect(toggleMove(["A", "B", "C", "D"], "E", ALLOWED)).toEqual(["A", "B", "C", "D"]);
    expect(toggleMove([], "Z", ALLOWED)).toEqual([]);
  });
});

describe("isValidTeam / sanitizeMoves", () => {
  it("requires exactly 4 different allowed moves", () => {
    expect(isValidTeam(["A", "B", "C", "D"], ALLOWED)).toBe(true);
    expect(isValidTeam(["A", "B", "C"], ALLOWED)).toBe(false);
    expect(isValidTeam(["A", "A", "B", "C"], ALLOWED)).toBe(false);
    expect(isValidTeam(["A", "B", "C", "Z"], ALLOWED)).toBe(false);
  });

  it("cleans untrusted input", () => {
    expect(sanitizeMoves(["A", "A", "Z", "B", "C", "D", "E"], ALLOWED)).toEqual(["A", "B", "C", "D"]);
  });
});

describe("setup url", () => {
  it("round-trips", () => {
    const setup = { me: "STC04-001", moves: ["STW04-001", "STW04-002"], rival: "STC01-001" };
    const query = setupQuery(setup);
    expect(query).toBe("me=STC04-001&moves=STW04-001,STW04-002&rival=STC01-001");
    expect(parseSetup(new URLSearchParams(query))).toEqual(setup);
  });

  it("handles missing values", () => {
    expect(parseSetup(new URLSearchParams(""))).toEqual({ me: null, moves: [], rival: null });
  });
});

describe("tokenize", () => {
  it("splits energy and orientation tokens", () => {
    expect(tokenize("Si cae en {hs}{do}, +20 por cada {L}.")).toEqual([
      { kind: "text", value: "Si cae en " },
      { kind: "orientation", orientation: "handstand" },
      { kind: "orientation", orientation: "faceDown" },
      { kind: "text", value: ", +20 por cada " },
      { kind: "energy", type: "L" },
      { kind: "text", value: "." },
    ]);
  });

  it("collapses the two sideways icons into one", () => {
    expect(tokenize("{s1}{s2}")).toEqual([{ kind: "orientation", orientation: "sideways" }]);
  });

  it("keeps unknown tags as text", () => {
    expect(tokenize("a {zz} b")).toEqual([{ kind: "text", value: "a {zz} b" }]);
  });
});
