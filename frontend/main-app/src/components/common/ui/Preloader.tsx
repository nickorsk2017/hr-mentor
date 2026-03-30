import React from "react";

type PreloaderProps = {
  className?: string;
};

export function Preloader({ className }: PreloaderProps) {
  return (
    <span
      role="status"
      aria-live="polite"
      aria-label="Loading"
      className={`fixed bottom-4 right-4 inline-block h-14 w-14 animate-spin rounded-full border-5 border-violet-500 border-t-transparent ${
        className ?? ""
      }`}
    />
  );
}

