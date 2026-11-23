import type { EnergyType } from "@/lib/data/schema";

/** Own palette: deliberately not the official type icons or colors. */
const TYPE_STYLES: Record<EnergyType, string> = {
  G: "bg-[#3f9b4f] text-white",
  R: "bg-[#e0573a] text-white",
  W: "bg-[#2f80d1] text-white",
  L: "bg-[#f0c419] text-[#3a2f00]",
  P: "bg-[#b04fc9] text-white",
  F: "bg-[#b3672b] text-white",
  D: "bg-[#3b3b4f] text-white",
  M: "bg-[#8797a5] text-white",
  N: "bg-[#5a4fcf] text-white",
  Y: "bg-[#5fb8de] text-[#062a3a]",
  C: "bg-[#a8a29e] text-[#1c1917]",
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
      className={`inline-flex shrink-0 items-center justify-center rounded-full font-bold ${SIZES[size]} ${TYPE_STYLES[type]}`}
    >
      {type}
    </span>
  );
}
