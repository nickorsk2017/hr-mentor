"use client";

import React from "react";

type Appearance = "primary" | "secondary" | "ghost" | "danger" | "violet";
export type Size = "small" | "medium" | "large";

type ButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  appearance?: Appearance;
  size?: Size;
};

const baseClasses =
  "cursor-pointer inline-flex items-center justify-center rounded-full font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-zinc-900/5 disabled:opacity-50 disabled:cursor-not-allowed";

const appearanceClasses: Record<Appearance, string> = {
  primary: "bg-zinc-900 text-white shadow-sm hover:bg-zinc-800",
  secondary:
    "border border-zinc-200 bg-zinc-50 text-zinc-800 hover:bg-zinc-100",
  ghost: "text-zinc-700 hover:bg-zinc-100",
  danger:
    "border border-red-200 bg-red-50 text-red-700 hover:bg-red-100 shadow-sm",
  violet:
    "bg-violet-500 text-white hover:bg-violet-600",
};

const sizeClasses: Record<Size, string> = {
  small: "px-2.5 py-1 text-[14px] h-8",
  medium: "px-3 py-1.5 text-[16px] h-10",
  large: "px-4 py-2 text-[20px] h-12",
};

export function Button({
  appearance = "primary",
  size = "medium",
  className,
  children,
  ...rest
}: ButtonProps) {
  return (
    <button
      {...rest}
      className={`${baseClasses} ${appearanceClasses[appearance]} ${sizeClasses[size]} ${
        className ?? ""
      }`}
    >
      {children}
    </button>
  );
}

