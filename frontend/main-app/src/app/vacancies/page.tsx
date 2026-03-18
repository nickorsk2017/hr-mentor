"use client";

import React, { useEffect, useRef, useState } from "react";
import { useMentor, VacancyStage } from "../mentor-context";
import { Modal } from "../../shared/ui/Modal";
import { Button } from "@/shared/ui/Button";
import { VacancyCard } from "./children/VacancyCard";

export default function VacanciesPage() {
  const {
    vacancies,
    addVacancy,
    deleteVacancy,
    updateVacancy,
    updateVacancyStages,
    setVacancyPlannedStageCount,
  } = useMentor();

  const [stageCountModalVacancyId, setStageCountModalVacancyId] =
    useState<string | null>(null);
  const [stageCountInput, setStageCountInput] = useState<string>("");
  const [activeVacancyId, setActiveVacancyId] = useState<string | null>(null);
  const previousCountRef = useRef<number>(0);

  const handleAddVacancy = () => {
    addVacancy({
      title: "New vacancy",
      company: "",
      description: "",
    });
  };

  const addStage = (vacancyId: string) => {
    const newStage: VacancyStage = {
      id: crypto.randomUUID(),
      name: "New stage",
      status: "pending",
      notes: "",
    };
    const vacancy = vacancies.find((v) => v.id === vacancyId);
    if (!vacancy) return;
    updateVacancyStages(vacancyId, [...vacancy.stages, newStage]);
  };

  const updateStage = (
    vacancyId: string,
    stageId: string,
    patch: Partial<VacancyStage>
  ) => {
    const vacancy = vacancies.find((v) => v.id === vacancyId);
    if (!vacancy) return;
    const stages = vacancy.stages.map((s) =>
      s.id === stageId ? { ...s, ...patch } : s
    );
    updateVacancyStages(vacancyId, stages);
  };

  const removeStage = (vacancyId: string, stageId: string) => {
    const vacancy = vacancies.find((v) => v.id === vacancyId);
    if (!vacancy) return;
    updateVacancyStages(
      vacancyId,
      vacancy.stages.filter((s) => s.id !== stageId)
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

  useEffect(() => {
    // Keep only one active card: default to first, or the newest when added.
    if (vacancies.length === 0) {
      setActiveVacancyId(null);
      previousCountRef.current = 0;
      return;
    }

    if (!activeVacancyId || !vacancies.some((v) => v.id === activeVacancyId)) {
      setActiveVacancyId(vacancies[0].id);
    }

    if (vacancies.length > previousCountRef.current) {
      const last = vacancies[vacancies.length - 1];
      setActiveVacancyId(last.id);
    }

    previousCountRef.current = vacancies.length;
  }, [vacancies, activeVacancyId]);

  return (
    <section className="flex w-full flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-zinc-950">Vacancies</h1>
        <p className="max-w-2xl text-lg text-violet-500">
          Track roles you are targeting, manage interview stages, and capture
          notes about what went well or could improve.
        </p>
      </header>

      <Button type="button"  onClick={handleAddVacancy} appearance="violet" className="self-end !sticky !top-2 z-450 mr-5">
          Add vacancy
      </Button>

      <div className="flex flex-col gap-3">
        {vacancies.length === 0 ? (
          <p className="text-lg text-zinc-500">
            No vacancies added yet. Start by adding a role above.
          </p>
        ) : (
          vacancies.map((vacancy) => (
            <VacancyCard
              key={vacancy.id}
              vacancy={vacancy}
              isActive={vacancy.id === activeVacancyId}
              onActivate={() => setActiveVacancyId(vacancy.id)}
              onDelete={() => deleteVacancy(vacancy.id)}
              onOpenStageCountModal={() => openStageCountModal(vacancy.id)}
              onUpdateVacancy={(patch) => updateVacancy(vacancy.id, patch)}
              onUpdateStage={(stageId, patch) =>
                updateStage(vacancy.id, stageId, patch)
              }
              onRemoveStage={(stageId) => removeStage(vacancy.id, stageId)}
            />
          ))
        )}
      </div>
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

