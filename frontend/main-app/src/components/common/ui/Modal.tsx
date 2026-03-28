"use client";

import React from "react";
import { Button } from "./Button";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  children?: React.ReactNode;
  onClose: () => void;
};

export function Modal({ open, title, description, children, onClose }: ModalProps) {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-4 shadow-xl">
        <div className="flex items-start justify-between gap-2">
          <div className="flex flex-col gap-1">
            <h2 className="text-sm font-semibold text-zinc-900">{title}</h2>
            {description && (
              <p className="text-[11px] text-zinc-600">{description}</p>
            )}
          </div>
          <Button type="button" appearance="ghost" onClick={onClose} className="px-2 py-1">
            Close
          </Button>
        </div>
        {children && <div className="mt-3">{children}</div>}
      </div>
    </div>
  );
}

