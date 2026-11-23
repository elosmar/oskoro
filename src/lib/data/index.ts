/**
 * Access to the generated card data. Server-side only: pages pass the slices
 * they need to Client Components, so the full bundle never ships to the browser.
 */
import en from "@/data/en.json";
import es from "@/data/es.json";
import type { DataBundle, Lang, Pokemon } from "./schema";

// Shape is guaranteed by DataBundleSchema at build time and by src/data/data.test.ts.
const bundles: Record<Lang, DataBundle> = {
  es: es as unknown as DataBundle,
  en: en as unknown as DataBundle,
};

export const getData = (lang: Lang): DataBundle => bundles[lang];

export const getPokemon = (lang: Lang, code: string): Pokemon | undefined =>
  getData(lang).pokemon.find((p) => p.code === code);
