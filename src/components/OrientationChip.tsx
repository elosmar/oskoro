import type { Orientation } from "@/lib/data/constants";
import type { SymbolLabels } from "@/lib/move-view";
import { cx } from "@/ui";

/** Charakoro face. Shows the Japanese label too, to match the physical icon. */
export function OrientationChip({
  orientation,
  labels,
  highlighted = false,
}: {
  orientation: Orientation;
  labels: SymbolLabels["orientations"];
  highlighted?: boolean;
}) {
  const { name, japanese } = labels[orientation];
  return (
    <span
      title={japanese}
      className={cx(
        "mx-0.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 align-middle text-xs font-medium",
        highlighted ? "bg-accent text-accent-foreground" : "bg-surface-muted text-foreground",
      )}
    >
      {name}
      <span lang="ja" className="text-[10px] opacity-70">
        {japanese}
      </span>
    </span>
  );
}
