"use client";

import { Button } from "@/components/common/ui/Button";

type HeaderProps = {
  title: string;
  actionLabel?: string;
  onActionClick?: () => void;
};

export function Header({ title, actionLabel, onActionClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-60 mb-4 flex items-center justify-between bg-white/80 px-6 py-4 backdrop-blur">
      <h1 className="flex items-center gap-2 text-2xl font-semibold">{title}</h1>

      {actionLabel && onActionClick ? (
        <Button
          appearance="violet"
          className="inline-flex items-center rounded-full bg-[#6f47d9] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#613acb]"
          onClick={onActionClick}
        >
          {actionLabel}
        </Button>
      ) : null}
    </header>
  );
}

