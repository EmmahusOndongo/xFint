// components/ui/Button.tsx
import clsx from "clsx";
import React from "react";

type Props = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "soft" | "solid";
  loading?: boolean;
};

export default function Button({
  className,
  children,
  variant = "soft",
  loading = false,
  disabled,
  ...rest
}: Props) {
  const base =
    variant === "solid"
      ? "btn-primary"
      : "btn"; // soft par défaut (lavande)

  return (
    <button
      className={clsx(base, className)}
      disabled={disabled || loading}
      {...rest}
    >
      {loading ? "…" : children}
    </button>
  );
}
