"use client";

import { useEffect, useMemo, useRef } from "react";
import cx from "@/utils/cx";
import { Button } from "@/components/common/ui/Button";
import { RichEditor } from "@/components/common/ui/RichEditor";

type VacancyCardProps = {
  vacancy: Entity.Vacancy;
  isActive: boolean;
  isSaving?: boolean;
  onToggle: (isActive?: boolean) => void;
  onDelete: () => void;
  onOpenStageCountModal: () => void;
  onUpdateVacancy: (patch: Partial<Entity.Vacancy>) => void;
  onUpdateStages: (stages: Entity.VacancyStage[]) => void;
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

    const onUpdateStage = (stageId: string, patch: Partial<Entity.VacancyStage>) => {
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
                          status: e.target.value as Entity.VacancyStage["status"],
                        })
                      }
                    >
                      <option value="scheduled">Scheduled</option>
                      <option value="done">Done</option>
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
      <div onMouseUp={(e) => e.stopPropagation()} onMouseDown={(e) => e.stopPropagation()} className="absolute right-4 top-[40px] z-40 flex items-center gap-2">
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
          onMouseDown={(e) =>  {onToggle(); e.stopPropagation()}}
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
      className={cx(`relative flex flex-col cursor-pointer bg-white w-full`, !isActive && "mt-[20px]")}
    >
      {isActive && <div className="sticky top-[72px] h-[20px] w-full bg-white z-50"></div>}
      <div className={cx("flex flex-col relative bg-white")}>
        <header className={cx("top-18 z-40 bg-white/70 backdrop-blur z-50 rounded-2xl !border-b-0 !rounded-b-none border border-gray-300 duration-200", isActive ? "border-violet-500 sticky " : "static border-gray-300")}>
        <div onMouseDown={() => {if(!isActive) onToggle()}} className={cx("flex flex-col gap-2  p-4 bg-transparent", isActive ? "border-violet-500" : "border-gray-300")}>
            <input
              ref={titleRef}
              className="w-full max-w-[760px] border-none bg-transparent text-[20px] font-semibold leading-tight tracking-[-0.01em] text-zinc-900 outline-none focus:ring-0 placeholder:text-zinc-400"
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
              className="w-full max-w-[620px] border-none bg-transparent text-[18px] font-medium leading-tight text-zinc-500 outline-none focus:ring-0 placeholder:text-zinc-400"
              value={vacancy.company ?? ""}
              onChange={(e) => onUpdateVacancy({ company: e.target.value })}
              placeholder="Company"
              onFocus={(e) => onToggle(true)}
            />
            
            {buttonsJSX}
          </div>      
        </header>

        <div className={cx("flex flex-col gap-2 px-4  border !border-t-0 !border-b-0 bg-white", isActive ? "border-violet-500 " : "static border-gray-300")}>
          {isActive && <RichEditor
            size="small"
            ref={descriptionRef}
            onMouseUp={(e) => e.stopPropagation()}
            className="max-h-auto mt-2 w-full"
            classToolbar="!top-[158px]"
            valueHtml={vacancy.description}
            placeholder="Vacancy description"
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
      
      <div className={cx("flex flex-col gap-2 sticky top-0 z-50 border !border-t-0 rounded-2xl !rounded-t-none h-4 shadow-[0_8px_20px_rgba(17,24,39,0.07)]", isActive ? "border-violet-500" : "border-gray-300")}>
          
      </div>
      
    </article>
  );
}

