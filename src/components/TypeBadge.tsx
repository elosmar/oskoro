import type { EnergyType } from "@/lib/data/constants";
import { cx } from "@/ui";

/** Static class names so Tailwind can detect them. Colors live in tokens.css. */
const TYPE_CLASSES: Record<EnergyType, string> = {
  G: "bg-type-g text-type-g-fg",
  R: "bg-type-r text-type-r-fg",
  W: "bg-type-w text-type-w-fg",
  L: "bg-type-l text-type-l-fg",
  P: "bg-type-p text-type-p-fg",
  F: "bg-type-f text-type-f-fg",
  D: "bg-type-d text-type-d-fg",
  M: "bg-type-m text-type-m-fg",
  N: "bg-type-n text-type-n-fg",
  Y: "bg-type-y text-type-y-fg",
  C: "bg-type-c text-type-c-fg",
};

const SIZES = {
  sm: "size-5 text-[10px]",
  md: "size-7 text-xs",
} as const;

export function TypeBadge({
  type,
  label,
  size = "md",
}: {
  type: EnergyType;
  /** Localized type name, used for accessibility. */
  label: string;
  size?: keyof typeof SIZES;
}) {
  return (
    <span
      role="img"
      aria-label={label}
      title={label}
      className={cx(
        "inline-flex shrink-0 items-center justify-center rounded-full font-bold",
        SIZES[size],
        TYPE_CLASSES[type],
      )}
    >
      {type}
    </span>
  );
}
