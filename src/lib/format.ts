/** Replaces `{name}` placeholders: format("{count} moves", { count: 8 }). */
export const format = (template: string, vars: Record<string, string | number>) =>
  template.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
