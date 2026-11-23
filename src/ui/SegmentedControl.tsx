"use client";

import { cx } from "./cx";

export interface SegmentedControlProps<T extends string> {
  label: string;
  options: { value: T; label: string }[];
  value: T | null;
  onChange: (value: T) => void;
  /** Allow tapping the active option again to clear it. */
  onClear?: () => void;
  size?: "sm" | "md";
}

/** A row of mutually exclusive toggle buttons (tabs, filters, faces). */
export function SegmentedControl<T extends string>({
  label,
  options,
  value,
  onChange,
  onClear,
  size = "md",
}: SegmentedControlProps<T>) {
  return (
    <div role="group" aria-label={label} className="flex flex-wrap gap-1 rounded-control bg-surface-muted p-1">
      {options.map((option) => {
        const active = option.value === value;
        return (
          <button
            key={option.value}
            type="button"
            aria-pressed={active}
            onClick={() => (active && onClear ? onClear() : onChange(option.value))}
            className={cx(
              "flex-1 rounded-control font-semibold transition",
              size === "sm" ? "px-2 py-1 text-xs" : "px-3 py-2 text-sm",
              active ? "bg-surface text-foreground shadow-card" : "text-muted hover:text-foreground",
            )}
          >
            {option.label}
          </button>
        );
      })}
    </div>
  );
}
