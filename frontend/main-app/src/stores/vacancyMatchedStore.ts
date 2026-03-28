"use client";

import { create } from "zustand";
import { getRenkingVacancies } from "@/services/rankingService";

type VacancyMatchedState = {
  vacancies: Entity.Vacancy[];
  loadingVacancies: boolean;
  vacanciesError: string | null;
  activeVacancyId: string | null;
};

type VacancyMatchedActions = {
  fetchMatchedVacancies: () => Promise<void>;
  setActiveVacancyId: (id: string | null) => void;
};

export type VacancyMatchedStore = VacancyMatchedState & VacancyMatchedActions;

export const useVacancyMatchedStore = create<VacancyMatchedStore>((set) => ({
  vacancies: [],
  loadingVacancies: true,
  vacanciesError: null,
  activeVacancyId: null,

  fetchMatchedVacancies: async () => {
    set({ loadingVacancies: true, vacanciesError: null });
    try {
      const data = await getRenkingVacancies();
      set({ vacancies: data, loadingVacancies: false });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to load vacancies";
      set({ vacanciesError: message, loadingVacancies: false });
    }
  },

  setActiveVacancyId: (id) => set({ activeVacancyId: id }),
}));
