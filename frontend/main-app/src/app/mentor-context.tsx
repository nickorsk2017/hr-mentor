"use client";

import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

type StageStatus = "pending" | "done" | "failed";

export type VacancyStage = {
  id: string;
  name: string;
  status: StageStatus;
  notes: string;
};

export type Vacancy = {
  id: string;
  title: string;
  company?: string;
  description: string;
  stages: VacancyStage[];
  plannedStageCount?: number;
};

export type CV = {
  contentHtml: string;
  uploadedFileName?: string;
};

type MentorState = {
  cv: CV | null;
  vacancies: Vacancy[];
};

type MentorContextValue = MentorState & {
  setCv: (cv: CV) => void;
  addVacancy: (vacancy: Omit<Vacancy, "id" | "stages">) => void;
  deleteVacancy: (id: string) => void;
  updateVacancy: (id: string, patch: Partial<Omit<Vacancy, "id" | "stages">>) => void;
  updateVacancyStages: (id: string, stages: VacancyStage[]) => void;
  setVacancyPlannedStageCount: (id: string, count: number) => void;
};

const MentorContext = createContext<MentorContextValue | undefined>(undefined);

const STORAGE_KEY = "ai-hr-mentor-state-v1";

export function MentorProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<MentorState>(() => {
    if (typeof window === "undefined") return { cv: null, vacancies: [] };
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (!raw) return { cv: null, vacancies: [] };
      return JSON.parse(raw) as MentorState;
    } catch {
      return { cv: null, vacancies: [] };
    }
  });

  useEffect(() => {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  }, [state]);

  const setCv = useCallback((cv: CV) => {
    setState((prev) => ({ ...prev, cv }));
  }, []);

  const addVacancy = useCallback(
    (vacancy: Omit<Vacancy, "id" | "stages">) => {
      const id = crypto.randomUUID();
      const newVacancy: Vacancy = {
        id,
        stages: [],
        ...vacancy,
      };
      setState((prev) => ({
        ...prev,
        vacancies: [...prev.vacancies, newVacancy],
      }));
    },
    []
  );

  const deleteVacancy = useCallback((id: string) => {
    setState((prev) => ({
      ...prev,
      vacancies: prev.vacancies.filter((v) => v.id !== id),
    }));
  }, []);

  const updateVacancy = useCallback(
    (id: string, patch: Partial<Omit<Vacancy, "id" | "stages">>) => {
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
    (id: string, stages: VacancyStage[]) => {
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
          v.id === id ? { ...v, plannedStageCount: count } : v
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
    }),
    [state, setCv, addVacancy, deleteVacancy, updateVacancy, updateVacancyStages, setVacancyPlannedStageCount]
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

