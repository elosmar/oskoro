import { describe, expect, it } from "vitest";
import {
  parseCharacards,
  parseDamage,
  parseEnergy,
  parseTables,
  parseWazacards,
  pokemonFromPath,
} from "./parse";

const WAZACARD_ES = `
#### Roer ?

| Nombre      | Roer ?                                  |
| ----------- | --------------------------------------- |
| Japonés     | かじる                                  |
| Tipo        | Eléctrico                               |
| Código      | STW04-001                               |
| Pokémon     | Pikachu                                 |
| Energía     | {L}{C}                                  |
| Daño        | 10                                      |
| Efecto      |                                         |
| De pie      | Este ataque hace 30 puntos de daño más. |
| De cabeza   |                                         |
| Boca arriba | Este ataque hace 30 puntos de daño más. |
| Boca abajo  |                                         |
| De lado     |                                         |

[Roer](https://example.com/img.webp)
`;

describe("parseTables", () => {
  it("drops separator rows and splits tables on blank lines", () => {
    const tables = parseTables("| a | b |\n| - | - |\n| c | d |\n\n| e | f |");
    expect(tables).toEqual([[["a", "b"], ["c", "d"]], [["e", "f"]]]);
  });
});

describe("parseWazacards", () => {
  it("reads rows by position, ignoring translated labels", () => {
    const [move] = parseWazacards(WAZACARD_ES);
    expect(move).toEqual({
      name: "Roer ?",
      japanese: "かじる",
      type: "Eléctrico",
      code: "STW04-001",
      energy: "{L}{C}",
      damage: "10",
      effect: "",
      orientations: [
        "Este ataque hace 30 puntos de daño más.",
        "",
        "Este ataque hace 30 puntos de daño más.",
        "",
        "",
      ],
    });
  });
});

describe("parseCharacards", () => {
  it("skips the empty template table", () => {
    const md = `
| Name     |     |
| -------- | --- |
| Type     |
| Code     |
| Weakness |
| HP       | 120 |

| Name     | Pikachu   |
| -------- | --------- |
| Type     | Electric  |
| Code     | STC04-001 |
| Weakness | Fighting  |
| HP       | 120       |
`;
    expect(parseCharacards(md)).toEqual([
      { name: "Pikachu", type: "Electric", code: "STC04-001", weakness: "Fighting", hp: "120" },
    ]);
  });
});

describe("value parsers", () => {
  it("parses energy tokens", () => {
    expect(parseEnergy("{L}{L}{W}")).toEqual(["L", "L", "W"]);
    expect(parseEnergy("")).toEqual([]);
    expect(() => parseEnergy("{X}")).toThrow();
  });

  it("parses damage as number or null", () => {
    expect(parseDamage("30")).toBe(30);
    expect(parseDamage("")).toBeNull();
    expect(() => parseDamage("10+")).toThrow();
  });

  it("derives the Pokémon code and set from the file path", () => {
    expect(pokemonFromPath("ST/04-001_pikachu.md")).toEqual({ set: "ST", pokemonCode: "STC04-001" });
    expect(pokemonFromPath("EB02/02-005_rayquaza.md")).toEqual({ set: "EB02", pokemonCode: "EBC02-005" });
  });
});
