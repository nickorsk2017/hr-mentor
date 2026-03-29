"use client";

import { useEffect, useRef, useState } from "react";
import { useVacancyStore } from "@/stores/vacancyStore";
import { Modal } from "@/components/common/ui/Modal";
import { Container } from "@/components/layout/Container";
import { Header } from "@/components/layout/Header";
import { VacancyCard } from "./VacancyCard";
import {
  deleteVacancyFromMatchingIndex,
  indexVacancyForMatching,
} from "@/services/rankingService";
import {
  createVacancyOnBackend,
  deleteVacancyOnBackend,
  updateVacancyOnBackend,
} from "@/services/vacancyService";

export function VacanciesPage() {
  const {
    vacancies,
    addVacancy,
    deleteVacancy,
    updateVacancy,
    updateVacancyStages,
    fetchVacancies,
  } = useVacancyStore();

  const [stageCountModalVacancyId, setStageCountModalVacancyId] =
    useState<string | null>(null);
  const [stageCountInput, setStageCountInput] = useState<string>("");
  const [activeVacancyId, setActiveVacancyId] = useState<string | null>(null);
  const [savingVacancyId, setSavingVacancyId] = useState<string | null>(null);
  const timerSaveRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const listEndRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    fetchVacancies();
  }, [fetchVacancies]);

  const getVacancyById = (vacancyId: string) => {
    return vacancies.find((vacancy) => vacancy.id === vacancyId) ?? null;
  };

  const scrollToBottomSmooth = () => {
    setTimeout(() => {
    requestAnimationFrame(() => {
      listEndRef.current?.scrollIntoView({
        behavior: "smooth",
          block: "end",
        });
      });
    }, 100);
  };

  const handleAddVacancy = async () => {
    const draft = {
      title: "",
      company: "",
      description: "",
    };

    const saved = await createVacancyOnBackend(draft);
    setActiveVacancyId(saved.id);
    addVacancy(saved);
    scrollToBottomSmooth();

    try {
      await indexVacancyForMatching(saved);
    } catch (e) {
      console.warn("[vacancies] Pinecone index skipped:", e);
    }
  };


  const addStage = (vacancyId: string) => {
    const vacancy = getVacancyById(vacancyId);
    if (!vacancy) return;

    const stages = vacancy?.stages ?? [];
    const newStage: Entity.VacancyStage = {
      id: crypto.randomUUID(),
      name: !stages.length ? "HR Interview" : "",
      status: "scheduled",
      notes: "",
    };

    updateVacancyStages(vacancyId, [...vacancy.stages??[], newStage]);
  };

  const updateStage = (
    vacancyId: string,
    stageId: string,
    patch: Partial<Entity.VacancyStage>
  ) => {
    const vacancy = getVacancyById(vacancyId);
    if (!vacancy) return;

    const stages = vacancy.stages?.map((stage) =>
      stage.id === stageId ? { ...stage, ...patch } : stage
    ) ?? [];
    updateVacancyStages(vacancyId, stages);
  };

  const removeStage = (vacancyId: string, stageId: string) => {
    const vacancy = getVacancyById(vacancyId);
    if (!vacancy) return;

    updateVacancyStages(
      vacancyId,
      vacancy.stages?.filter((s) => s.id !== stageId) ?? []
    );
  };

  const handleSaveVacancy = async (vacancyId: string, patch: Partial<Entity.Vacancy>) => {
    if (timerSaveRef.current) {
      clearTimeout(timerSaveRef.current);
    }

    timerSaveRef.current = setTimeout(async () => {
        const vacancy = getVacancyById(vacancyId);
        if (!vacancy) return;

        setSavingVacancyId(vacancyId);

        const data = {
          ...vacancy,
          ...patch,
          stages: patch.stages ?? vacancy.stages ?? [],
        };

        try {
          const mapped = await updateVacancyOnBackend(vacancyId, data);

          updateVacancy(mapped.id, {
            title: mapped.title,
            company: mapped.company,
            description: mapped.description,
            planned_stages: mapped.planned_stages,
            created_at: mapped.created_at,
          });

          updateVacancyStages(mapped.id, mapped.stages ?? []);

          try {
            await indexVacancyForMatching(mapped);
          } catch (indexErr) {
            console.warn("[vacancies] Pinecone re-index skipped:", indexErr);
          }
        } catch (e) {
          console.error(e);
          window.alert("Could not save vacancy. Check the API is running.");
        } finally {
          setSavingVacancyId(null);
        }
    }, 3000);
  };

  const onUpdateVacancyHandler = (vacancyId: string, patch: Partial<Entity.Vacancy>) => {
    updateVacancy(vacancyId, patch);
    handleSaveVacancy(vacancyId, patch);
  };

  const handleDeleteVacancy = async (vacancyId: string) => {
    try {
      await deleteVacancyOnBackend(vacancyId);
      deleteVacancy(vacancyId);
    } catch (e) {
      console.error(e);
      window.alert("Could not delete vacancy. Check the API is running.");
      return;
    }

    try {
      await deleteVacancyFromMatchingIndex(vacancyId);
    } catch (e) {
      console.warn("[vacancies] Pinecone index delete skipped:", e);
    }
  };

  return (
    <Container className="flex w-full flex-colgap-4">
    <Header
      title="Vacancies"
      actionLabel="Add Vacancy"
      onActionClick={handleAddVacancy}
    />

      {vacancies.length === 0 ? (
        <p className="text-lg text-zinc-500">
          No vacancies added yet. Start by adding a role above.
        </p>
      ) : (
        vacancies.map((vacancy) => (
          <VacancyCard
            key={vacancy.id}
            vacancy={vacancy}
            isActive={vacancy.id === activeVacancyId && activeVacancyId !== null}
            isSaving={savingVacancyId === vacancy.id}
            onToggle={(isActive) => setActiveVacancyId((activeVacancyId !== vacancy.id || isActive) ? vacancy.id : null)}
            onDelete={() => handleDeleteVacancy(vacancy.id)}
            onOpenStageCountModal={() => addStage(vacancy.id)}
            onUpdateVacancy={(patch) => onUpdateVacancyHandler(vacancy.id, patch)}
            onUpdateStages={(stages) => onUpdateVacancyHandler(vacancy.id, {stages})}
            onRemoveStage={(stageId) => removeStage(vacancy.id, stageId)}
          />
        ))
      )}
      <div ref={listEndRef} />

  </Container>
  );
}
