/**
 * Splits PlakoroDB effect text into plain text and symbol tokens:
 * energy `{L}` and Charakoro orientations `{st} {hs} {ba} {do} {s1}{s2}`.
 * Consecutive orientations ("{hs}{do}") mean "any of these".
 */
import { ENERGY_TYPES, type EnergyType, type Orientation } from "./data/constants";

export type TextSegment =
  | { kind: "text"; value: string }
  | { kind: "energy"; type: EnergyType }
  | { kind: "orientation"; orientation: Orientation };

const ORIENTATION_TAGS: Record<string, Orientation | null> = {
  st: "standing",
  hs: "handstand",
  ba: "faceUp",
  do: "faceDown",
  s1: "sideways",
  s2: null, // second half of the two sideways icons
};

export function tokenize(text: string): TextSegment[] {
  const segments: TextSegment[] = [];
  const pushText = (value: string) => {
    if (!value) return;
    const last = segments.at(-1);
    if (last?.kind === "text") last.value += value;
    else segments.push({ kind: "text", value });
  };

  let cursor = 0;
  for (const match of text.matchAll(/\{([A-Za-z0-9]+)\}/g)) {
    pushText(text.slice(cursor, match.index));
    cursor = match.index + match[0].length;
    const tag = match[1];

    if ((ENERGY_TYPES as readonly string[]).includes(tag)) {
      segments.push({ kind: "energy", type: tag as EnergyType });
    } else if (tag in ORIENTATION_TAGS) {
      const orientation = ORIENTATION_TAGS[tag];
      if (orientation) segments.push({ kind: "orientation", orientation });
    } else {
      pushText(match[0]); // unknown tag: keep it visible rather than hide it
    }
  }
  pushText(text.slice(cursor));
  return segments;
}
