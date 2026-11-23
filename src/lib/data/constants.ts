/**
 * Domain constants and types with zero dependencies, safe for Client Components.
 * (schema.ts pulls in Zod; import it only on the server or in scripts.)
 */
export const ENERGY_TYPES = ["G", "R", "W", "L", "P", "F", "D", "M", "N", "Y", "C"] as const;
export const ORIENTATIONS = ["standing", "handstand", "faceUp", "faceDown", "sideways"] as const;
export const SETS = ["ST", "EB01", "EB02", "PR"] as const;
export const LANGS = ["es", "en"] as const;

export type EnergyType = (typeof ENERGY_TYPES)[number];
export type Orientation = (typeof ORIENTATIONS)[number];
export type CardSet = (typeof SETS)[number];
export type Lang = (typeof LANGS)[number];
