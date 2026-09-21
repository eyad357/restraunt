import type { ButtonHTMLAttributes } from "react";

type Variant = "primary" | "secondary" | "danger";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
}

/**
 * Shared UI primitive. Kept intentionally minimal per the foundation scope
 * — modules should reach for this instead of hand-rolling button styling,
 * but should not expect a full design system yet.
 */
export function Button({ variant = "primary", className, ...rest }: ButtonProps) {
  const classes = ["btn", `btn--${variant}`, className].filter(Boolean).join(" ");
  return <button type="button" className={classes} {...rest} />;
}
