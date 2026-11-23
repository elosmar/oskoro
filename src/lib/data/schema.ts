import { z } from "zod";

export const ENERGY_TYPES = ["G", "R", "W", "L", "P", "F", "D", "M", "N", "Y", "C"] as const;
export const ORIENTATIONS = ["standing", "handstand", "faceUp", "faceDown", "sideways"] as const;
export const SETS = ["ST", "EB01", "EB02", "PR"] as const;
export const LANGS = ["es", "en"] as const;

export const EnergyTypeSchema = z.enum(ENERGY_TYPES);
export const OrientationSchema = z.enum(ORIENTATIONS);
export const SetSchema = z.enum(SETS);
export const LangSchema = z.enum(LANGS);

export const MoveSchema = z.object({
  code: z.string().regex(/^(STW|EBW|PRW)\d{2}-[\d-]+$/),
  set: SetSchema,
  pokemonCode: z.string(),
  name: z.string().min(1),
  official: z.boolean(),
  japanese: z.string().min(1),
  type: EnergyTypeSchema,
  energy: z.array(EnergyTypeSchema),
  damage: z.number().int().positive().nullable(),
  effect: z.string().nullable(),
  orientations: z.partialRecord(OrientationSchema, z.string().min(1)),
});

export const PokemonSchema = z.object({
  code: z.string().regex(/^(STC|EBC)\d{2}-\d{3}$/),
  name: z.string().min(1),
  type: EnergyTypeSchema,
  weakness: EnergyTypeSchema,
  hp: z.number().int().positive(),
  set: SetSchema.exclude(["PR"]),
  moveCodes: z.array(z.string()).min(1),
});

export const DataBundleSchema = z.object({
  lang: LangSchema,
  source: z.object({
    repo: z.url(),
    commit: z.string().length(40),
    license: z.literal("CC BY-NC 4.0"),
  }),
  types: z.record(EnergyTypeSchema, z.object({ name: z.string(), japanese: z.string() })),
  orientations: z.record(OrientationSchema, z.object({ name: z.string(), japanese: z.string() })),
  pokemon: z.array(PokemonSchema),
  moves: z.array(MoveSchema),
});

export type EnergyType = z.infer<typeof EnergyTypeSchema>;
export type Orientation = z.infer<typeof OrientationSchema>;
export type CardSet = z.infer<typeof SetSchema>;
export type Lang = z.infer<typeof LangSchema>;
export type Move = z.infer<typeof MoveSchema>;
export type Pokemon = z.infer<typeof PokemonSchema>;
export type DataBundle = z.infer<typeof DataBundleSchema>;
