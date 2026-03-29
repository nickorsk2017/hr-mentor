"use client";

import { create } from "zustand";

export type CV = {
  contentHtml: string;
  uploadedFileName?: string;
};

type CvState = { cv: CV | null };
type CvActions = { setCv: (cv: CV) => void };

export type CvStore = CvState & CvActions;

export const useCvStore = create<CvStore>((set) => ({
  cv: null,
  setCv: (cv) => set({ cv }),
}));
