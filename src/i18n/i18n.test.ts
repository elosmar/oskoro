import { describe, expect, it } from "vitest";
import { switchLangHref } from "@/components/LangSwitcher";
import en from "./en.json";
import es from "./es.json";
import { format, preferredLang } from "./index";

const keysOf = (obj: object, prefix = ""): string[] =>
  Object.entries(obj).flatMap(([k, v]) =>
    v && typeof v === "object" ? keysOf(v, `${prefix}${k}.`) : [`${prefix}${k}`],
  );

describe("dictionaries", () => {
  it("es and en have the same keys", () => {
    expect(keysOf(es).sort()).toEqual(keysOf(en).sort());
  });
});

describe("preferredLang", () => {
  it("matches the base language", () => {
    expect(preferredLang(["es-AR", "en"])).toBe("es");
    expect(preferredLang(["en-US"])).toBe("en");
  });

  it("falls back to English", () => {
    expect(preferredLang(["ja-JP", "fr"])).toBe("en");
    expect(preferredLang([])).toBe("en");
  });
});

describe("format", () => {
  it("replaces placeholders", () => {
    expect(format("{count} ataques", { count: 8 })).toBe("8 ataques");
  });
});

describe("switchLangHref", () => {
  it("swaps the language segment and keeps the query", () => {
    expect(switchLangHref("/es/mesa/", "me=STC04-001", "en")).toBe("/en/mesa/?me=STC04-001");
    expect(switchLangHref("/en", "", "es")).toBe("/es");
  });
});
