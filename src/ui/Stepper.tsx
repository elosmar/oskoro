"use client";

import { Button } from "./Button";
import { cx } from "./cx";

export interface StepperProps {
  label: string;
  value: number;
  /** Step sizes, largest first: [20, 10] renders −20 −10 value +10 +20. */
  steps?: number[];
  onChange: (delta: number) => void;
  size?: "md" | "lg";
  decreaseLabel: string;
  increaseLabel: string;
}

/** Numeric counter with symmetric −/+ buttons. */
export function Stepper({
  label,
  value,
  steps = [1],
  onChange,
  size = "md",
  decreaseLabel,
  increaseLabel,
}: StepperProps) {
  const showAmount = steps.length > 1 || steps[0] !== 1;
  const text = (sign: "−" | "+", step: number) => (showAmount ? `${sign}${step}` : sign);

  return (
    <div role="group" aria-label={label} className="flex flex-col items-center gap-1">
      <span className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</span>
      <div className="flex items-center gap-1">
        {steps.map((step) => (
          <Button
            key={`-${step}`}
            variant="secondary"
            size="sm"
            aria-label={`${decreaseLabel} ${step}`}
            onClick={() => onChange(-step)}
            className="min-w-10"
          >
            {text("−", step)}
          </Button>
        ))}
        <output
          aria-live="polite"
          className={cx("min-w-12 text-center font-extrabold tabular-nums", size === "lg" ? "text-4xl" : "text-2xl")}
        >
          {value}
        </output>
        {[...steps].reverse().map((step) => (
          <Button
            key={`+${step}`}
            variant="secondary"
            size="sm"
            aria-label={`${increaseLabel} ${step}`}
            onClick={() => onChange(step)}
            className="min-w-10"
          >
            {text("+", step)}
          </Button>
        ))}
      </div>
    </div>
  );
}
