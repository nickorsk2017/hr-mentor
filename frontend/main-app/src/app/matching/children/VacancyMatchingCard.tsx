"use client";
import { useMemo } from "react";

type ComponentProps = {
  vacancy: Entity.Vacancy;
  index: number;
  isActive: boolean;
  onActivate: () => void;
};

export function VacancyMatchingCard({
  vacancy,
  index,
  isActive,
  onActivate,
}: ComponentProps) {
  console.log("vacancy", vacancy);

  const headerJSX = useMemo(() => {
    return (
      <header className="flex items-start justify-between gap-2">
      <div className="flex items-center gap-2">
        <span className="text-lg font-semibold text-zinc-400">#{index}</span>
        <div className="flex flex-col gap-1">
          <h2 className="text-sm font-semibold text-zinc-900">
            {vacancy.title || "Untitled vacancy"}
          </h2>
          {vacancy.company && (
            <p className="text-[11px] text-zinc-600">{vacancy.company}</p>
          )}
        </div>
      </div>
      <div className="flex flex-col items-end gap-1">
        <span className="text-[11px] font-medium text-zinc-500">Fit score</span>
        <div className="flex items-center gap-2">
          <div className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-100">
            <div
              className="h-full rounded-full bg-emerald-500"
              style={{ width: `${vacancy.match_score}%` }}
            />
          </div>
          <span className="text-lg font-semibold text-zinc-900">
            {vacancy.match_score}%
          </span>
        </div>
      </div>
    </header>
    );
  }, [index]);

  const reasoningJSX = useMemo(() => {
    return (
      <div className="flex flex-col gap-1 rounded-lg bg-zinc-50 p-2">
        <span className="font-medium text-zinc-700">Reasoning</span>
        <span className="text-zinc-600" dangerouslySetInnerHTML={{ __html: vacancy.reason ?? "" }} />
      </div>
    );
  }, [vacancy.reason]);

  return (
    <article
      className={`flex flex-col gap-3 rounded-2xl border bg-white p-4 shadow-sm cursor-pointer ${
        isActive ? "border-violet-500" : "border-zinc-200"
      }`}
      onClick={onActivate}
    >
      {headerJSX}
      {reasoningJSX}

      {isActive && vacancy.description && (
        <div
          className="prose prose-sm max-w-none text-zinc-600"
          dangerouslySetInnerHTML={{ __html: vacancy.description }}
        />
      )}

      <div className="grid gap-2 text-[11px] md:grid-cols-3">
        <div className="flex flex-col gap-1 rounded-lg bg-zinc-50 p-2">
          <span className="font-medium text-zinc-700">Interview progress</span>
          <span className="text-zinc-600">
            1 / 3 stages completed
          </span>
          <span className="text-red-600">
            1 failed stage
          </span>
          {vacancy.planned_stages === 0 && (
            <span className="text-zinc-500">No stages tracked yet.</span>
          )}
        </div>

        <div className="flex flex-col gap-1 rounded-lg bg-zinc-50 p-2">
          <span className="font-medium text-zinc-700">CV keyword overlap</span>
          <span className="text-zinc-600">
            Fit score combines keyword overlap between your CV and the vacancy
            with your interview progress.
          </span>
        </div>

        <div className="flex flex-col gap-1 rounded-lg bg-violet-50 p-2">
          <span className="font-medium text-violet-800">AI scoring details</span>
          <span className="text-violet-700">
            Tech: {vacancy.tech_score ?? "—"} | Years: {vacancy.years_score ?? "—"}
          </span>
          <span className="text-violet-700">
            Domain: {vacancy.domain_score ?? "—"} | Other: {vacancy.other_score ?? "—"}
          </span>
          {(vacancy.aligned_skills || []).length > 0 && (
            <span className="text-violet-700">
              Aligned skills: {vacancy.aligned_skills?.join(", ")}
            </span>
          )}
          {(vacancy.not_aligned_skills || []).length > 0 && (
            <span className="text-violet-700">
              Not aligned skills: {vacancy.not_aligned_skills?.join(", ")}
            </span>
          )}
        </div>

        <div className="flex flex-col gap-1 rounded-lg bg-emerald-50 p-2">
          <span className="font-medium text-emerald-800">
            AI-style recommendations
          </span>
        </div>
      </div>
    </article>
  );
}

