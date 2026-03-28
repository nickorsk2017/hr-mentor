"use client";

import { create } from "zustand";
import { getVacanciesOnBackend } from "@/services/vacancyService";

type VacancyState = {
  vacancies: Entity.Vacancy[];
};

type VacancyActions = {
  addVacancy: (vacancy: Entity.Vacancy) => void;
  deleteVacancy: (id: string) => void;
  updateVacancy: (id: string, patch: Partial<Entity.Vacancy>) => void;
  updateVacancyStages: (id: string, stages: Entity.VacancyStage[]) => void;
  setVacancyPlannedStageCount: (id: string, count: number) => void;
  fetchVacancies: () => Promise<void>;
};

export type VacancyStore = VacancyState & VacancyActions;

export const useVacancyStore = create<VacancyStore>((set) => ({
  vacancies: [],

  addVacancy: (vacancy) =>
    set((s) => ({ vacancies: [...s.vacancies, vacancy] })),

  fetchVacancies: async () => {
    const data = await getVacanciesOnBackend();
    set({ vacancies: data.vacancies });
  },

  deleteVacancy: (id) =>
    set((s) => ({
      vacancies: s.vacancies.filter((v) => v.id !== id),
    })),

  updateVacancy: (id, patch) =>
    set((s) => ({
      vacancies: s.vacancies.map((v) =>
        v.id === id ? { ...v, ...patch } : v
      ),
    })),

  updateVacancyStages: (id, stages) =>
    set((s) => ({
      vacancies: s.vacancies.map((v) =>
        v.id === id ? { ...v, stages } : v
      ),
    })),

  setVacancyPlannedStageCount: (id, count) =>
    set((s) => ({
      vacancies: s.vacancies.map((v) =>
        v.id === id ? { ...v, planned_stages: count } : v
      ),
    })),
}));
