"use client";

import { useEffect, useRef, useState } from "react";
import { useMentor } from "@/app/mentor-context";
import { Modal } from "@/shared/ui/Modal";
import { Container } from "@/shared/layout/Container";
import { Header } from "@/shared/layout/Header";
import { VacancyCard } from "./VacancyCard";
import {
  deleteVacancyFromMatchingIndex,
  indexVacancyForMatching,
} from "@/shared/api/matchingApi";
import {
  createVacancyOnBackend,
  deleteVacancyOnBackend,
  updateVacancyOnBackend,
} from "@/shared/api/vacancyApi";

export function VacanciesPage() {
  const {
    vacancies,
    addVacancy,
    deleteVacancy,
    updateVacancy,
    updateVacancyStages,
    setVacancyPlannedStageCount,
    fetchVacancies,
  } = useMentor();

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
    const newStage: Entity.VacancyStage = {
      id: crypto.randomUUID(),
      name: "",
      status: "pending",
      notes: "",
    };
    const vacancy = vacancies.find((v) => v.id === vacancyId);
    if (!vacancy) return;
    updateVacancyStages(vacancyId, [...vacancy.stages??[], newStage]);
  };

  const updateStage = (
    vacancyId: string,
    stageId: string,
    patch: Partial<Entity.VacancyStage>
  ) => {
    const vacancy = vacancies.find((v) => v.id === vacancyId);
    if (!vacancy) return;
    const stages = vacancy.stages?.map((s) =>
      s.id === stageId ? { ...s, ...patch } : s
    ) ?? [];
    updateVacancyStages(vacancyId, stages);
  };

  const removeStage = (vacancyId: string, stageId: string) => {
    const vacancy = vacancies.find((v) => v.id === vacancyId);
    if (!vacancy) return;

    updateVacancyStages(
      vacancyId,
      vacancy.stages?.filter((s) => s.id !== stageId) ?? []
    );
  };

  const openStageCountModal = (vacancyId: string) => {
    setStageCountModalVacancyId(vacancyId);
    setStageCountInput("");
  };

  const saveStageCountAndAddStage = () => {
    if (!stageCountModalVacancyId) return;
    const parsed = parseInt(stageCountInput, 10);
    if (!Number.isNaN(parsed) && parsed > 0) {
      setVacancyPlannedStageCount(stageCountModalVacancyId, parsed);
    }
    addStage(stageCountModalVacancyId);
    setStageCountModalVacancyId(null);
    setStageCountInput("");
  };

  const handleSaveVacancy = async (vacancyId: string, patch: Partial<Entity.Vacancy>) => {
    if (timerSaveRef.current) {
      clearTimeout(timerSaveRef.current);
    }

    timerSaveRef.current = setTimeout(async () => {
        const vacancy = vacancies.find((x) => x.id === vacancyId);
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
      <section className="flex w-full flex-col">
        <Header
          title="Vacancies"
          actionLabel="Add Vacancy"
          onActionClick={handleAddVacancy}
        />

        <Container className="gap-4">
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
                  onOpenStageCountModal={() => openStageCountModal(vacancy.id)}
                  onUpdateVacancy={(patch) => onUpdateVacancyHandler(vacancy.id, patch)}
                  onUpdateStages={(stages) => onUpdateVacancyHandler(vacancy.id, {stages})
                  }
                  onRemoveStage={(stageId) => removeStage(vacancy.id, stageId)}
                />
              ))
            )}
            <div ref={listEndRef} />
        </Container>

        <Modal
          open={stageCountModalVacancyId !== null}
          title="Do you know count of stages?"
          description="If you know how many stages this process has, enter it below. This number is stored and used in your analytics."
          onClose={() => {
            setStageCountModalVacancyId(null);
            setStageCountInput("");
          }}
        >
          <div className="flex flex-col gap-3 text-lg">
            <label className="flex flex-col gap-1">
              <span className="font-medium text-zinc-800">
                Planned number of stages
              </span>
              <input
                type="number"
                min={1}
                className="w-32 rounded-md border border-zinc-200 px-2 py-1 text-lg text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/5"
                value={stageCountInput}
                onChange={(e) => setStageCountInput(e.target.value)}
              />
            </label>
            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setStageCountModalVacancyId(null);
                  setStageCountInput("");
                }}
                className="rounded-full border border-zinc-200 bg-white px-3 py-1 text-lg font-medium text-zinc-700 hover:bg-zinc-100"
              >
                Skip
              </button>
              <button
                type="button"
                onClick={saveStageCountAndAddStage}
                className="rounded-full bg-zinc-900 px-4 py-1 text-lg font-semibold text-white hover:bg-zinc-800"
              >
                Save & add stage
              </button>
            </div>
          </div>
        </Modal>
      </section>
  );
}
