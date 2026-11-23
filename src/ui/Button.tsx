import Link from "next/link";
import type { ComponentProps } from "react";
import { cx } from "./cx";

const VARIANTS = {
  primary: "bg-accent text-accent-foreground shadow-card",
  secondary: "border border-border bg-surface text-foreground",
  ghost: "text-muted hover:text-foreground",
} as const;

const SIZES = {
  sm: "px-2 py-1 text-sm",
  md: "px-4 py-2 text-base",
  lg: "px-8 py-4 text-lg",
} as const;

export interface ButtonStyleProps {
  variant?: keyof typeof VARIANTS;
  size?: keyof typeof SIZES;
}

export const buttonStyles = ({ variant = "primary", size = "md" }: ButtonStyleProps = {}) =>
  cx(
    "inline-flex items-center justify-center gap-2 rounded-control font-semibold transition",
    "active:scale-95 disabled:pointer-events-none disabled:opacity-40",
    VARIANTS[variant],
    SIZES[size],
  );

export function Button({ variant, size, className, ...props }: ComponentProps<"button"> & ButtonStyleProps) {
  return <button type="button" className={cx(buttonStyles({ variant, size }), className)} {...props} />;
}

export function ButtonLink({ variant, size, className, ...props }: ComponentProps<typeof Link> & ButtonStyleProps) {
  return <Link className={cx(buttonStyles({ variant, size }), className)} {...props} />;
}
