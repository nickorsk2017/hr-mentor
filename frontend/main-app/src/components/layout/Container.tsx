import type { ReactNode } from "react";

type ContainerProps = {
  children: ReactNode;
  className?: string;
};

export function Container({ children, className }: ContainerProps) {
  return (
    <div className={`flex flex-col w-full items-center justify-center max-w-4xl mx-auto ${className ?? ""}`}>
      <div className="w-full max-w-6xl">{children}</div>
    </div>
  );
}

