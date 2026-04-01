"use client";

import { useMemo } from "react";

type ComponentProps = {
  vacancy: Entity.RankedVacancy;
  index: number;
  isActive: boolean;
  onActivate: () => void;
};

function scoreTone(score: number): string {
  if (score >= 85) return "from-emerald-500 to-teal-400";
  if (score >= 65) return "from-cyan-500 to-sky-400";
  if (score >= 45) return "from-amber-500 to-yellow-400";
  return "from-rose-500 to-orange-400";
}

function chipStyle(kind: "aligned" | "missing"): string {
  return kind === "aligned"
    ? "border-black bg-gray-800 text-white"
    : "border-zinc-200 bg-zinc-100 text-zinc-700";
}

export function VacancyRankedCard({
  vacancy,
  index,
  isActive,
  onActivate,
}: ComponentProps) {
  const completedStages = vacancy.completed_stages ?? 0;
  const totalStages = vacancy.total_stages ?? Math.max(vacancy.planned_stages ?? 1, 1);
  const failedStages = vacancy.failed_stages ?? 0;
  const progressPct = Math.max(0, Math.min(100, Math.round((completedStages / totalStages) * 100)));
  const salary_range: string = vacancy.meta_data?.salary_range as string || "No salary range provided";

  const summary = vacancy.summary;
  const summary_truncated = useMemo(() => summary ? summary?.slice(0, 100) + "..." : "", [summary]);


  const skills_jsx = useMemo(() => {
    return <div className="flex flex-wrap gap-2">
      {vacancy.aligned_skills.map((skill: string) => (
            <span
              key={`aligned-${vacancy.id}-${skill}`}
              className={`inline-flex items-center rounded-full border px-3 py-1 text-sm ${chipStyle("aligned")}`}
            >
              {skill}
            </span>
        ))}
      {vacancy.not_aligned_skills.map((skill: string) => (
            <span
              key={`missing-${vacancy.id}-${skill}`}
              className={`inline-flex items-center rounded-full border px-3 py-1 text-sm ${chipStyle("missing")}`}
            >
              {skill}
            </span>
          ))}
    </div>
  }, [vacancy.aligned_skills, vacancy.not_aligned_skills]);

  console.log(vacancy);

  return (
    <article
      className={`flex cursor-pointer flex-col gap-4 rounded-2xl border bg-white p-4 shadow-sm transition hover:scale-101 ${
        isActive ? "border-violet-400 shadow-violet-100" : "border-zinc-200 hover:border-zinc-300 hover:scale-101"
      }`}
      onClick={onActivate}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h2 className="truncate text-lg font-semibold leading-tight text-zinc-900">
            <span className="mr-2 text-zinc-700">#{index}</span>
            {vacancy.title || "Untitled vacancy"}
          </h2>
          <p className="mt-1  text-sm text-zinc-500">
            {vacancy.company || "Unknown company"}
          </p>
        </div>

        <div className={`rounded-2xl bg-gradient-to-r px-4 py-2 text-white ${scoreTone(vacancy.match_score)}`}>
          <p className="text-xs uppercase tracking-wide text-white/80">Fit</p>
          <p className="text-3xl font-bold leading-none">{vacancy.match_score ?? 0}%</p>
        </div>
      </header>

      {salary_range && <div className="text-sm text-gray-900 font-medium">{salary_range}</div>}

      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
        <p className="text-sm font-medium text-zinc-700">Summary</p>
        <p className="mt-1 text-base text-zinc-700 whitespace-pre-line">{(isActive ? summary : summary_truncated) || "No summary returned by the model."}</p>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <div className="rounded-xl border border-zinc-200 p-3">
          <p className="text-sm font-medium text-zinc-700">Interview Progress</p>
          <p className="mt-1 text-sm text-zinc-600">{completedStages} / {totalStages} stages completed</p>
          <div className="mt-2 h-2 w-full overflow-hidden rounded-full bg-zinc-200">
            <div className="h-full rounded-full bg-emerald-500" style={{ width: `${progressPct}%` }} />
          </div>
          <p className="mt-2 text-sm text-rose-600">{failedStages > 0 ? `${failedStages} failed stage${failedStages > 1 ? "s" : ""}` : "No failed stages"}</p>
        </div>

        <div className="rounded-xl border border-zinc-200 p-3">
          <p className="text-sm font-medium text-zinc-700">AI Score Breakdown</p>
          <p className="mt-1 text-sm text-zinc-600">Tech: {vacancy.tech_score ?? "—"} | Seniority: {vacancy.seniority_score ?? "—"}</p>
          <p className="text-sm text-zinc-600">Domain: {vacancy.domain_score ?? "—"} | Other: {vacancy.other_score ?? "—"}</p>
        </div>

        <div className="rounded-xl border border-violet-200 bg-violet-50 p-3">
          <p className="text-sm font-medium text-violet-800">Advice</p>
          <p className="mt-1 text-sm text-violet-700">
            {vacancy.advice || "Keep your CV impact-focused and aligned with vacancy requirements."}
          </p>
        </div>
      </div>

      {skills_jsx}
    </article>
  );
}

