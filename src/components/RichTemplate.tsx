import { Fragment, type ReactNode } from "react";
import { templateParts } from "@/lib/format";

/** Renders a translated sentence with React elements in its `{slot}`s. */
export function RichTemplate({ template, slots }: { template: string; slots: Record<string, ReactNode> }) {
  return (
    <>
      {templateParts(template).map((part, i) => (
        <Fragment key={i}>{"slot" in part ? (slots[part.slot] ?? `{${part.slot}}`) : part.text}</Fragment>
      ))}
    </>
  );
}
