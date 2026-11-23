/**
 * Guards the UI structure described in docs/0002-estructura-ui.md.
 */
import { globSync, readFileSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";

const SRC = path.resolve(__dirname);
const files = (pattern: string) =>
  globSync(pattern, { cwd: SRC }).filter((f) => !f.endsWith(".test.ts"));
const read = (f: string) => readFileSync(path.join(SRC, f), "utf8");

describe("design tokens", () => {
  it("keeps raw colors only in styles/tokens.css", () => {
    const offenders = files("**/*.{ts,tsx,css}")
      .filter((f) => f !== path.join("styles", "tokens.css"))
      .filter((f) => /#[0-9a-fA-F]{3,8}\b|rgba?\(|hsla?\(/.test(read(f)));
    expect(offenders).toEqual([]);
  });
});

describe("layer boundaries", () => {
  it("ui/ atoms do not know the domain", () => {
    const offenders = files("ui/**/*.{ts,tsx}").filter((f) =>
      /from "@\/(lib|features|components|i18n|data)/.test(read(f)),
    );
    expect(offenders).toEqual([]);
  });

  it("components/ and features/ do not read data bundles directly", () => {
    const offenders = files("{components,features}/**/*.{ts,tsx}").filter((f) =>
      /from "@\/(data\/|lib\/data"|lib\/data\/index)/.test(read(f)),
    );
    expect(offenders).toEqual([]);
  });

  it("client-facing code does not pull Zod into the browser", () => {
    const offenders = files("{components,features,ui}/**/*.{ts,tsx}").filter((f) =>
      /from "(zod|@\/lib\/data\/schema)"/.test(read(f)),
    );
    expect(offenders).toEqual([]);
  });

  it("lib/ has no UI", () => {
    expect(files("lib/**/*.tsx")).toEqual([]);
  });
});
