import React from "react";

type CircleLoaderProps = {
  className?: string;
  ariaLabel?: string;
};

export function CircleLoader({
  className,
  ariaLabel = "Loading",
}: CircleLoaderProps) {
  return (
    <span
      aria-label={ariaLabel}
      className={`inline-block h-5 w-5 animate-spin rounded-full border-2 border-zinc-300 border-t-zinc-900 ${
        className ?? ""
      }`}
    />
  );
}

