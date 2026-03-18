"use client";

import React, { useEffect, useId, useMemo, useRef, useState } from "react";
import type { Vacancy, VacancyStage } from "../../mentor-context";
import { Button } from "@/shared/ui/Button";
import { CvRichEditor } from "@/shared/ui/CvRichEditor";

type VacancyCardProps = {
  vacancy: Vacancy;
  isActive: boolean;
  onActivate: () => void;
  onDelete: () => void;
  onOpenStageCountModal: () => void;
  onUpdateVacancy: (patch: Partial<Omit<Vacancy, "id" | "stages">>) => void;
  onUpdateStage: (stageId: string, patch: Partial<VacancyStage>) => void;
  onRemoveStage: (stageId: string) => void;
};

export function VacancyCard({
  vacancy,
  isActive,
  onActivate,
  onDelete,
  onOpenStageCountModal,
  onUpdateVacancy,
  onUpdateStage,
  onRemoveStage,
}: VacancyCardProps) {
  const titleRef = useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (!isActive) return;
    if (!vacancy.title.trim()) {
      titleRef.current?.focus();
    }
  }, [isActive, vacancy.title]);


  const stagesJSX = useMemo(() => {
    if(!isActive) return null;

    return  vacancy.stages.length === 0 ? (
      <p className="text-lg text-zinc-500">
        No stages yet. Add the first one to track your progress.
      </p>
    ) : (
      <div className="flex flex-col gap-2">
        {vacancy.stages.map((stage, index) => (
          <div
            key={stage.id}
            className="flex flex-col gap-1 rounded-lg border border-zinc-200 bg-zinc-50 p-3"
          >
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="text-lg text-zinc-500">{index + 1}.</span>
                {isActive ? (
                  <input
                    className="w-40 rounded-md border border-zinc-200 px-2 py-1 text-lg text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/5"
                    value={stage.name}
                    onChange={(e) =>
                      onUpdateStage(stage.id, { name: e.target.value })
                    }
                  />
                ) : (
                  <span className="text-lg text-zinc-800">{stage.name}</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                {isActive ? (
                  <>
                    <select
                      className="rounded-md border border-zinc-200 px-2 py-1 text-lg text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/5"
                      value={stage.status}
                      onChange={(e) =>
                        onUpdateStage(stage.id, {
                          status: e.target.value as VacancyStage["status"],
                        })
                      }
                    >
                      <option value="pending">Pending</option>
                      <option value="done">Done (success)</option>
                      <option value="failed">Failed</option>
                    </select>
                    <Button
                      appearance="danger"
                      size="small"
                      onClick={(e) => {
                        e.stopPropagation();
                        onRemoveStage(stage.id);
                      }}
                    >
                      Remove
                    </Button>
                  </>
                ) : (
                  <span className="text-sm text-zinc-500">{stage.status}</span>
                )}
              </div>
            </div>
            {isActive ? (
              <textarea
                className="mt-1 min-h-[60px] w-full rounded-md border border-zinc-200 px-2 py-1 text-lg text-zinc-900 outline-none focus:ring-2 focus:ring-zinc-900/5"
                placeholder="Notes: feedback, what went well, what to improve..."
                value={stage.notes}
                onChange={(e) =>
                  onUpdateStage(stage.id, { notes: e.target.value })
                }
              />
            ) : (
              stage.notes && (
                <p className="mt-1 text-sm text-zinc-600">{stage.notes}</p>
              )
            )}
          </div>
        ))}
      </div>
    )
  }, [vacancy.stages, isActive]);

  return (
    <article
      className={`relative flex flex-col gap-3 rounded-2xl border p-4 shadow-sm cursor-pointer bg-white ${isActive ? "border-violet-500" : "border-zinc-200"}`}
      onClick={() => {
        if (!isActive) onActivate();
      }}
    >
      <header className="relative flex w-full items-start justify-between gap-2">
        <div className="flex w-full flex-col gap-1 text-lg">
         
          <div></div>
          {isActive ? (
            <>
            <div className="sticky top-0 z-40 bg-white/90 backdrop-blur flex flex-col gap-2">
                <input
                    ref={titleRef}
                    className="w-full max-w-[600px] border-none bg-transparent text-[20px] font-semibold outline-none focus:ring-0"
                    value={vacancy.title}
                    onChange={(e) => onUpdateVacancy({ title: e.target.value })}
                    placeholder="Vacancy title"
                  />
                <input
                  className="w-full max-w-[400px] border-none bg-transparent text-[20px] text-zinc-600 outline-none focus:ring-0"
                  value={vacancy.company ?? ""}
                  onChange={(e) => onUpdateVacancy({ company: e.target.value })}
                  placeholder="Company"
                />
            </div>
              
               <CvRichEditor
                  size="small"
                  className="max-h-auto mt-2 w-full"
                  valueHtml={vacancy.description}
                  onChangeHtml={(next) =>
                    onUpdateVacancy({
                      description: next,
                    })
                  }
                  autoFocus={Boolean(vacancy.title.trim())}
                />
            </>
          ) : (
            <>
              <div className="text-[20px] font-semibold text-zinc-900">
                {vacancy.title || "Untitled vacancy"}
              </div>
              {vacancy.company && (
                <div className="text-[20px] text-zinc-600">{vacancy.company}</div>
              )}
            </>
          )}
        </div>
        <Button
          type="button"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          appearance="danger"
          className="absolute right-4 top-0 z-40"
        >
          Delete
        </Button>
      </header>

      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between">
          <span></span>
          {typeof vacancy.plannedStageCount === "number" && (
            <span className="text-lg text-zinc-500">
              Planned: {vacancy.plannedStageCount} stages
            </span>
          )}
          {isActive && <Button
            size="small"
            onClick={(e) => {
              e.stopPropagation();
              onOpenStageCountModal();
            }}
          >
            Add stage
          </Button>}
        </div>
        {stagesJSX}
      </div>
    </article>
  );
}

