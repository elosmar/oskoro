import type { SymbolLabels } from "@/lib/move-view";
import { tokenize } from "@/lib/text-tokens";
import { OrientationChip } from "./OrientationChip";
import { TypeBadge } from "./TypeBadge";

/** Card text with `{L}` / `{do}` tokens rendered as icons. */
export function RichText({ text, symbols }: { text: string; symbols: SymbolLabels }) {
  return (
    <>
      {tokenize(text).map((segment, i) => {
        switch (segment.kind) {
          case "text":
            return <span key={i}>{segment.value}</span>;
          case "energy":
            return (
              <span key={i} className="mx-0.5 inline-block align-middle">
                <TypeBadge type={segment.type} label={symbols.types[segment.type]} size="sm" />
              </span>
            );
          case "orientation":
            return <OrientationChip key={i} orientation={segment.orientation} labels={symbols.orientations} />;
        }
      })}
    </>
  );
}
