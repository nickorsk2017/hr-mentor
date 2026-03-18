"use client";

import React from "react";

type Appearance = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  appearance?: Appearance;
};

const baseClasses =
  "cursor-pointer inline-flex items-center justify-center rounded-full px-3 py-1.5 text-md font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/5 disabled:opacity-50 disabled:cursor-not-allowed";

const appearanceClasses: Record<Appearance, string> = {
  primary: "bg-zinc-900 text-white shadow-sm hover:bg-zinc-800",
  secondary:
    "border border-zinc-200 bg-zinc-50 text-zinc-800 hover:bg-zinc-100",
  ghost: "text-zinc-700 hover:bg-zinc-100",
  danger:
    "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 shadow-sm",
};

export function Button({
  appearance = "secondary",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={`${baseClasses} ${appearanceClasses[appearance]} ${
        className ?? ""
      }`}
    >
      {children}
    </button>
  );
}

