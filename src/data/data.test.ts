/**
 * Guards the committed JSON bundles: if a PlakoroDB bump changes the format,
 * these counts and known cards break loudly.
 */
import { describe, expect, it } from "vitest";
import { DataBundleSchema, LANGS } from "@/lib/data/schema";
import en from "./en.json";
import es from "./es.json";

const bundles = { en, es } as const;

describe.each(LANGS)("%s bundle", (lang) => {
  const data = DataBundleSchema.parse(bundles[lang]);

  it("matches the expected counts", () => {
    expect(data.pokemon).toHaveLength(23);
    expect(data.moves).toHaveLength(205);
    expect(data.moves.filter((m) => m.set === "ST")).toHaveLength(77);
    expect(data.moves.filter((m) => m.set === "EB01" || m.set === "EB02")).toHaveLength(119);
    expect(data.moves.filter((m) => m.set === "PR")).toHaveLength(9);
  });

  it("links every move to an existing Pokémon", () => {
    const codes = new Set(data.pokemon.map((p) => p.code));
    for (const m of data.moves) expect(codes.has(m.pokemonCode)).toBe(true);
    const listed = data.pokemon.flatMap((p) => p.moveCodes);
    expect(new Set(listed).size).toBe(205);
  });

  it("gives every Pokémon between 7 and 10 moves", () => {
    for (const p of data.pokemon) {
      expect(p.moveCodes.length).toBeGreaterThanOrEqual(7);
      expect(p.moveCodes.length).toBeLessThanOrEqual(10);
    }
  });
});

describe("known cards", () => {
  it("STW04-001 is Gnaw / Roer", () => {
    const gnawEn = en.moves.find((m) => m.code === "STW04-001")!;
    const gnawEs = es.moves.find((m) => m.code === "STW04-001")!;
    expect(gnawEn).toMatchObject({ name: "Gnaw", japanese: "かじる", energy: ["L"], damage: 10 });
    expect(gnawEs).toMatchObject({ name: "Roer", japanese: "かじる", energy: ["L"], damage: 10 });
    expect(Object.keys(gnawEs.orientations)).toEqual(["standing", "faceUp"]);
  });

  it("Pikachu has 8 moves", () => {
    expect(en.pokemon.find((p) => p.code === "STC04-001")?.moveCodes).toHaveLength(8);
  });

  it("strips the fan-translation marker and flags it", () => {
    const rush = en.moves.find((m) => m.code === "STW04-003")!;
    expect(rush).toMatchObject({ name: "Electric Rush", official: false });
  });
});
