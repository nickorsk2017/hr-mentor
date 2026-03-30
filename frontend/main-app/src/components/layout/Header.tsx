"use client";

import { Button } from "@/components/common/ui/Button";

type HeaderProps = {
  title: string;
  actionLabel?: string;
  actionLabelMobile?: string;
  onActionClick?: () => void;
};

export function Header({ title, actionLabel, actionLabelMobile, onActionClick }: HeaderProps) {
  return (
    <header className="sticky top-0 z-60 flex items-center justify-between bg-white/80 px-6 py-4 backdrop-blur pl-24 md:pl-0 min-h-[72px]">
      <h1 className="flex items-center gap-2 text-2xl font-semibold">{title}</h1>

      {actionLabel && onActionClick ? (
        <Button
          appearance="violet"
          className="inline-flex items-center rounded-full bg-[#6f47d9] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#613acb]"
          onClick={onActionClick}
        >
          {actionLabelMobile ? (
            <>
              <span className="md:hidden">{actionLabelMobile}</span>
              <span className="hidden md:inline">{actionLabel}</span>
            </>
          ) : (
            actionLabel
          )}
        </Button>
      ) : null}
    </header>
  );
}

