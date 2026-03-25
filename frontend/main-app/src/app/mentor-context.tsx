"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { getVacanciesOnBackend } from "../shared/api/vacancyApi";


export type CV = {
  contentHtml: string;
  uploadedFileName?: string;
};

type MentorState = {
  cv: CV | null;
  vacancies: Entity.Vacancy[];
};

type MentorContextValue = MentorState & {
  setCv: (cv: CV) => void;
  /** Append a vacancy (e.g. from POST /vacancies). `stages` default to []. */
  addVacancy: (vacancy: Entity.Vacancy) => void;
  deleteVacancy: (id: string) => void;
  updateVacancy: (id: string, patch: Partial<Entity.Vacancy>) => void;
  updateVacancyStages: (id: string, stages: Entity.VacancyStage[]) => void;
  setVacancyPlannedStageCount: (id: string, count: number) => void;
  fetchVacancies: () => Promise<void>;
};

const MentorContext = createContext<MentorContextValue | undefined>(undefined);


export function MentorProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MentorState>({ cv: null, vacancies: [] });

  const setCv = useCallback((cv: CV) => {
    setState((prev) => ({ ...prev, cv }));
  }, []);

  const addVacancy = useCallback(
    (vacancy: Entity.Vacancy) => {
      setState((prev) => ({
        ...prev,
        vacancies: [...prev.vacancies, vacancy],
      }));
    },
    []
  );

  const fetchVacancies = useCallback(async () => {
    const data = await getVacanciesOnBackend();
    setState((prev) => ({ ...prev, vacancies: data.vacancies}));
  }, []);

  const deleteVacancy = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      vacancies: prev.vacancies.filter((v) => v.id !== id),
    }));
  }, []);

  const updateVacancy = useCallback(
    (id: string, patch: Partial<Entity.Vacancy>) => {
      setState((prev) => ({
        ...prev,
        vacancies: prev.vacancies.map((v) =>
          v.id === id ? { ...v, ...patch } : v
        ),
      }));
    },
    []
  );

  const updateVacancyStages = useCallback(
    (id: string, stages: Entity.VacancyStage[]) => {
      setState((prev) => ({
        ...prev,
        vacancies: prev.vacancies.map((v) =>
          v.id === id ? { ...v, stages } : v
        ),
      }));
    },
    []
  );

  const setVacancyPlannedStageCount = useCallback(
    (id: string, count: number) => {
      setState((prev) => ({
        ...prev,
        vacancies: prev.vacancies.map((v) =>
          v.id === id ? { ...v, planned_stages: count } : v
        ),
      }));
    },
    []
  );

  const value = useMemo(
    () => ({
      ...state,
      setCv,
      addVacancy,
      deleteVacancy,
      updateVacancy,
      updateVacancyStages,
      setVacancyPlannedStageCount,
      fetchVacancies,
    }),
    [state, setCv, addVacancy, deleteVacancy, updateVacancy, updateVacancyStages, setVacancyPlannedStageCount, fetchVacancies]
  );

  return (
    <MentorContext.Provider value={value}>{children}</MentorContext.Provider>
  );
}

export function useMentor() {
  const ctx = useContext(MentorContext);
  if (!ctx) {
    throw new Error("useMentor must be used within MentorProvider");
  }
  return ctx;
}

