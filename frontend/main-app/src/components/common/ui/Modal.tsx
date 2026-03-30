"use client";

import React from "react";
import { Button } from "./Button";

type ModalProps = {
  open: boolean;
  title: string;
  children?: React.ReactNode;
  onClose: () => void;
};

export function Modal({ open, title, children, onClose }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed top-0 inset-0 z-80 flex items-center justify-center bg-black/40 px-4" onClick={onClose} role="dialog" aria-modal="true" aria-labelledby={title}>
      <div className="rounded-2xl bg-white p-4 shadow-xl w-[650px] max-w-full" onClick={(e) => e.stopPropagation()}>
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-[26px] font-semibold text-zinc-900">{title}</h2>
          </div>
          <Button type="button" appearance="ghost" onClick={onClose} className="!text-2xl rounded-full px-2 py-1 text-zinc-600 hover:bg-white/60">
            X
          </Button>
        </div>
        {children && <div className="mt-3 text-[20px] text-zinc-600 whitespace-pre-line">{children}</div>}
      </div>
    </div>
  );
}

