"use client";

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
    ? "border-violet-200 bg-violet-100 text-violet-800"
    : "border-zinc-200 bg-zinc-100 text-zinc-700";
}

export function VacancyRankedCard({
  vacancy,
  index,
  isActive,
  onActivate,
}: ComponentProps) {
  const safeScore = Math.max(0, Math.min(100, Math.round(vacancy.fitScore ?? 0)));
  const completedStages = vacancy.completedStages ?? 0;
  const totalStages = vacancy.totalStages ?? Math.max(vacancy.planned_stages ?? 1, 1);
  const failedStages = vacancy.failedStages ?? 0;
  const progressPct = Math.max(0, Math.min(100, Math.round((completedStages / totalStages) * 100)));
  const aligned = vacancy.alignedSkills ?? [];
  const missing = vacancy.notAlignedSkills ?? [];

  return (
    <article
      className={`flex cursor-pointer flex-col gap-4 rounded-2xl border bg-white p-4 shadow-sm transition ${
        isActive ? "border-violet-400 shadow-violet-100" : "border-zinc-200 hover:border-zinc-300"
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

        <div className={`rounded-2xl bg-gradient-to-r px-4 py-2 text-white ${scoreTone(safeScore)}`}>
          <p className="text-xs uppercase tracking-wide text-white/80">Fit</p>
          <p className="text-3xl font-bold leading-none">{safeScore}%</p>
        </div>
      </header>

      <div className="rounded-xl border border-zinc-200 bg-zinc-50 p-3">
        <p className="text-sm font-medium text-zinc-700">Reasoning</p>
        <p className="mt-1 text-base text-zinc-700">{vacancy.whyScore || "No explanation returned by the model."}</p>
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
          <p className="mt-1 text-sm text-zinc-600">Tech: {vacancy.techScore ?? "—"} | Years: {vacancy.yearsScore ?? "—"}</p>
          <p className="text-sm text-zinc-600">Domain: {vacancy.domainScore ?? "—"} | Other: {vacancy.otherScore ?? "—"}</p>
        </div>

        <div className="rounded-xl border border-violet-200 bg-violet-50 p-3">
          <p className="text-sm font-medium text-violet-800">Recommendations</p>
          <p className="mt-1 text-sm text-violet-700">
            {vacancy.recommendations[0] || "Keep your CV impact-focused and aligned with vacancy requirements."}
          </p>
        </div>
      </div>

      <div className="space-y-2">
        <p className="text-sm font-medium text-zinc-700">Aligned Skills</p>
        <div className="flex flex-wrap gap-2">
          {aligned.length > 0 ? (
            aligned.map((skill: string) => (
              <span
                key={`aligned-${vacancy.id}-${skill}`}
                className={`inline-flex items-center rounded-full border px-3 py-1 text-sm ${chipStyle("aligned")}`}
              >
                {skill}
              </span>
            ))
          ) : (
            <span className="text-sm text-zinc-500">No aligned skills extracted.</span>
          )}
        </div>
      </div>

      {isActive && (
        <div className="space-y-2">
          <p className="text-sm font-medium text-zinc-700">Missing / Weak Skills</p>
          <div className="flex flex-wrap gap-2">
            {missing.length > 0 ? (
              missing.map((skill: string) => (
                <span
                  key={`missing-${vacancy.id}-${skill}`}
                  className={`inline-flex items-center rounded-full border px-3 py-1 text-sm ${chipStyle("missing")}`}
                >
                  {skill}
                </span>
              ))
            ) : (
              <span className="text-sm text-zinc-500">No missing skills reported.</span>
            )}
          </div>
        </div>
      )}
    </article>
  );
}

