import type { ReactNode } from "react";

type IconBadgeProps = {
  children: ReactNode;
  className?: string;
};

export function IconBadge({
  children,
  className = "bg-violet-100 text-violet-700",
}: IconBadgeProps) {
  return (
    <div
      className={`mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl ${className}`}
    >
      {children}
    </div>
  );
}
