import Link from "next/link";
import type { ComponentProps } from "react";
import { cx } from "./cx";

export interface CardStyleProps {
  /** Adds hover/press feedback for clickable cards. */
  interactive?: boolean;
  selected?: boolean;
}

export const cardStyles = ({ interactive = false, selected = false }: CardStyleProps = {}) =>
  cx(
    "rounded-card border bg-surface p-3 shadow-card",
    selected ? "border-accent ring-2 ring-accent" : "border-border",
    interactive && "transition hover:border-accent active:scale-[0.98]",
  );

export function Card({ interactive, selected, className, ...props }: ComponentProps<"div"> & CardStyleProps) {
  return <div className={cx(cardStyles({ interactive, selected }), className)} {...props} />;
}

export function CardLink({ selected, className, ...props }: ComponentProps<typeof Link> & Omit<CardStyleProps, "interactive">) {
  return <Link className={cx(cardStyles({ interactive: true, selected }), className)} {...props} />;
}
