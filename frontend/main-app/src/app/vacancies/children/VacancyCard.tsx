"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { cx } from "@/libs/utils";
import type { Vacancy, VacancyStage } from "../../mentor-context";
import { Button } from "@/shared/ui/Button";
import { CvRichEditor } from "@/shared/ui/CvRichEditor";

type VacancyCardProps = {
  vacancy: Vacancy;
  isActive: boolean;
  isSaving?: boolean;
  onToggle: (isActive?: boolean) => void;
  onDelete: () => void;
  onOpenStageCountModal: () => void;
  onUpdateVacancy: (patch: Partial<Omit<Vacancy, "id" | "stages">>) => void;
  onUpdateStages: (stages: VacancyStage[]) => void;
  onRemoveStage: (stageId: string) => void;
};

export function VacancyCard({
  vacancy,
  isActive,
  isSaving = false,
  onToggle,
  onDelete,
  onOpenStageCountModal,
  onUpdateVacancy,
  onUpdateStages,
  onRemoveStage,
}: VacancyCardProps) {
  const titleRef = useRef<HTMLInputElement | null>(null);
  const companyRef = useRef<HTMLInputElement | null>(null);
  const descriptionRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!isActive) return;

    const title = vacancy.title.trim();

    if (!title) {
      titleRef.current?.focus();
    }

  }, [isActive, vacancy.title]);

  const stagesJSX = useMemo(() => {
    if(!isActive) return null;

    const onUpdateStage = (stageId: string, patch: Partial<VacancyStage>) => {
      onUpdateStages(vacancy.stages?.map((s) => s.id === stageId ? { ...s, ...patch } : s) ?? []);
    };

    return  vacancy.stages?.length === 0 ? (
      <p className="text-lg text-zinc-500">
        No stages yet. Add the first one to track your progress.
      </p>
    ) : (
      <div className="flex flex-col gap-2">
        {vacancy.stages?.map((stage, index) => (
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

  const buttonsJSX = useMemo(() => {
    return (
      <div onMouseUp={(e) => e.stopPropagation()} className="absolute right-4 top-[40px] z-40 flex items-center gap-2">
        <Button
          type="button"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          appearance="danger"
        >
          Delete
        </Button>

        <Button
          type="button"
          size="small"
          onClick={(e) => {
            e.stopPropagation();
            onToggle()
          }}
        >
        {isActive ? (
          // Up chevron
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 15L12 9L18 15"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        ) : (
          // Down chevron
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <path
              d="M6 9L12 15L18 9"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </Button>
      </div>
    );
  }, [isActive, isSaving, onToggle, onDelete]);

  useEffect(() => {
    if (isActive) {
     // titleRef.current?.focus();
    }
  }, [isActive]);

  return (
    <article
      className={`relative flex flex-col cursor-pointer bg-white`}
    >
      <div className="sticky top-0 h-[28px] w-full bg-white backdrop-blu z-50"></div>
      <div className={cx("flex flex-col relative")}>
        <header className={cx("top-4 z-40 bg-white/70 backdrop-blur z-50 rounded-2xl !border-b-0 !rounded-b-none border border-gray-300", isActive ? "border-violet-500 sticky" : "static border-gray-300")}>
        <div onMouseDown={() => {if(!isActive) onToggle()}} className={cx("flex flex-col gap-2  p-4 bg-transparent", isActive ? "border-violet-500" : "border-gray-300")}>
            <input
              ref={titleRef}
              className="w-full max-w-[600px] border-none bg-transparent text-[20px] font-semibold outline-none focus:ring-0"
              value={vacancy.title}
              onMouseUp={(e) => e.stopPropagation()}
              onChange={(e) => {
                onUpdateVacancy({ title: e.target.value })}
              }
              placeholder="Vacancy title"
              onFocus={(e) => onToggle(true)}
            />
            <input
              onMouseUp={(e) => e.stopPropagation()}
              className="w-full max-w-[400px] border-none bg-transparent text-[20px] text-zinc-600 outline-none focus:ring-0"
              value={vacancy.company ?? ""}
              onChange={(e) => onUpdateVacancy({ company: e.target.value })}
              placeholder="Company"
              onFocus={(e) => onToggle(true)}
            />
            
            {buttonsJSX}
          </div>      
        </header>

        <div className={cx(" flex flex-col gap-2 p-4 pt-0 border !border-t-0 !border-b-0", isActive ? "border-violet-500 " : "static border-gray-300")}>
          {isActive && <CvRichEditor
            size="small"
            ref={descriptionRef}
            onMouseUp={(e) => e.stopPropagation()}
            className="max-h-auto mt-2 w-full"
            classToolbar="!top-[114px]"
            valueHtml={vacancy.description}
            onChangeHtml={(next) =>
              onUpdateVacancy({
                description: next,
              })
            }
          />}

          <div className="flex items-center justify-between">
            <span></span>
            {vacancy.planned_stages > 0 && (
              <span className="text-lg text-zinc-500">
                Planned: {vacancy.planned_stages} stages
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
      </div>
      
      <div className={cx("flex flex-col gap-2 sticky top-0 z-60 border !border-t-0 rounded-2xl !rounded-t-none h-4", isActive ? "border-violet-500" : "border-gray-300")}>
          
      </div>
    </article>
  );
}

