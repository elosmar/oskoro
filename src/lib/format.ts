/** Replaces `{name}` placeholders: format("{count} moves", { count: 8 }). */
export const format = (template: string, vars: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));

export type TemplatePart = { text: string } | { slot: string };

/**
 * Splits a template into text and `{slot}` parts, so UI code can put rich
 * elements (links) inside translated sentences.
 */
export function templateParts(template: string): TemplatePart[] {
  return template
    .split(/(\{\w+\})/g)
    .filter(Boolean)
    .map((piece) => {
      const slot = piece.match(/^\{(\w+)\}$/);
      return slot ? { slot: slot[1] } : { text: piece };
    });
}
