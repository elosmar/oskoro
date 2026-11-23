import { LANGS, type Lang } from "@/lib/data/schema";
import en from "./en.json";
import es from "./es.json";

export type Dictionary = typeof en;

const dictionaries: Record<Lang, Dictionary> = { es, en };

export const getDictionary = (lang: Lang): Dictionary => dictionaries[lang];

export const isLang = (value: string): value is Lang => (LANGS as readonly string[]).includes(value);

/** Replaces `{name}` placeholders: format("{count} moves", { count: 8 }). */
export const format = (template: string, vars: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));

/** Picks the best supported language from the browser preferences. */
export function preferredLang(languages: readonly string[]): Lang {
  for (const l of languages) {
    const base = l.toLowerCase().split("-")[0];
    if (isLang(base)) return base;
  }
  return "en";
}
