"use client";

import React, { useMemo } from "react";
import { useMentor, Vacancy } from "../mentor-context";

type RankedVacancy = Vacancy & {
  fitScore: number;
  completedStages: number;
  totalStages: number;
  failedStages: number;
  recommendations: string[];
};

function computeFitScore(cvText: string, vacancy: Vacancy): RankedVacancy {
  const base: RankedVacancy = {
    ...vacancy,
    fitScore: 0,
    completedStages: 0,
    totalStages: vacancy.stages.length,
    failedStages: 0,
    recommendations: [],
  };

  const plainCv = cvText.toLowerCase();
  const sourceText =
    (vacancy.title + " " + (vacancy.description ?? "")).toLowerCase();

  const keywords = Array.from(
    new Set(
      sourceText
        .split(/[^a-z0-9+#.]/i)
        .map((k) => k.trim())
        .filter((k) => k.length > 2)
    )
  );

  let matchCount = 0;
  const missingKeywords: string[] = [];

  for (const kw of keywords) {
    if (!kw) continue;
    if (plainCv.includes(kw)) {
      matchCount += 1;
    } else {
      missingKeywords.push(kw);
    }
  }

  const keywordScore =
    keywords.length === 0 ? 0 : (matchCount / keywords.length) * 70;

  const completedStages = vacancy.stages.filter((s) => s.status === "done")
    .length;
  const failedStages = vacancy.stages.filter((s) => s.status === "failed")
    .length;
  const totalStages = vacancy.stages.length || 1;

  const progressScore = (completedStages / totalStages) * 30;
  const penalty = failedStages * 5;

  const fitScore = Math.max(
    0,
    Math.min(100, Math.round(keywordScore + progressScore - penalty))
  );

  const recommendations: string[] = [];

  if (missingKeywords.length > 0) {
    const techLike = missingKeywords
      .filter((k) => /react|next|node|typescript|python|java|docker|kubernetes|aws|gcp|azure|sql|graphql|kafka|tailwind/i.test(k))
      .slice(0, 6);
    if (techLike.length > 0) {
      recommendations.push(
        `Strengthen your experience with: ${techLike.join(", ")}.`
      );
    }
  }

  if (failedStages > 0) {
    recommendations.push(
      "Review notes from failed stages and practice targeted interview questions for those rounds."
    );
  }

  if (fitScore < 50) {
    recommendations.push(
      "Consider tailoring your CV to highlight directly relevant experience and technologies for this vacancy."
    );
  } else if (fitScore >= 75) {
    recommendations.push(
      "This looks like a strong match. Double‑check your CV for clarity and quantifiable impact to maximise your chances."
    );
  }

  return {
    ...base,
    fitScore,
    completedStages,
    totalStages,
    failedStages,
    recommendations,
  };
}

export default function RankingPage() {
  const { cv, vacancies } = useMentor();

  const ranked = useMemo(() => {
    const cvText =
      cv?.contentHtml
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim() ?? "";

    return vacancies
      .map((v) => computeFitScore(cvText, v))
      .sort((a, b) => b.fitScore - a.fitScore);
  }, [cv, vacancies]);

  return (
    <section className="flex w-full flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-zinc-950">
          Ranking & Recommendations
        </h1>
        <p className="max-w-2xl text-lg text-zinc-600">
          Vacancies are ordered from strongest to weakest fit based on your CV
          and interview progress. Use the insights to decide where to invest
          your time and which skills to grow.
        </p>
      </header>

      {!cv && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-lg text-amber-800">
          No CV content found yet. The ranking will be much more accurate once
          you add your CV on the My CV page.
        </p>
      )}

      {ranked.length === 0 ? (
        <p className="text-lg text-zinc-500">
          No vacancies to rank yet. Add a few on the Vacancies page first.
        </p>
      ) : (
        <div className="flex flex-col gap-3">
          {ranked.map((vacancy, index) => (
            <article
              key={vacancy.id}
              className="flex flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm"
            >
              <header className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2">
                  <span className="text-lg font-semibold text-zinc-400">
                    #{index + 1}
                  </span>
                  <div className="flex flex-col gap-1">
                    <h2 className="text-sm font-semibold text-zinc-900">
                      {vacancy.title}
                    </h2>
                    {vacancy.company && (
                      <p className="text-[11px] text-zinc-600">
                        {vacancy.company}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1">
                  <span className="text-[11px] font-medium text-zinc-500">
                    Fit score
                  </span>
                  <div className="flex items-center gap-2">
                    <div className="h-1.5 w-24 overflow-hidden rounded-full bg-zinc-100">
                      <div
                        className="h-full rounded-full bg-emerald-500"
                        style={{ width: `${vacancy.fitScore}%` }}
                      />
                    </div>
                    <span className="text-lg font-semibold text-zinc-900">
                      {vacancy.fitScore}%
                    </span>
                  </div>
                </div>
              </header>

              {vacancy.description && (
                <p className="max-w-xl text-[11px] text-zinc-600">
                  {vacancy.description}
                </p>
              )}

              <div className="grid gap-2 text-[11px] md:grid-cols-3">
                <div className="flex flex-col gap-1 rounded-lg bg-zinc-50 p-2">
                  <span className="font-medium text-zinc-700">
                    Interview progress
                  </span>
                  <span className="text-zinc-600">
                    {vacancy.completedStages} / {vacancy.totalStages} stages
                    completed
                  </span>
                  {vacancy.failedStages > 0 && (
                    <span className="text-red-600">
                      {vacancy.failedStages} failed stage
                      {vacancy.failedStages > 1 ? "s" : ""}
                    </span>
                  )}
                  {vacancy.totalStages === 0 && (
                    <span className="text-zinc-500">
                      No stages tracked yet.
                    </span>
                  )}
                </div>

                <div className="flex flex-col gap-1 rounded-lg bg-zinc-50 p-2">
                  <span className="font-medium text-zinc-700">
                    CV keyword overlap
                  </span>
                  <span className="text-zinc-600">
                    Fit score combines keyword overlap between your CV and the
                    vacancy with your interview progress.
                  </span>
                </div>

                <div className="flex flex-col gap-1 rounded-lg bg-emerald-50 p-2">
                  <span className="font-medium text-emerald-800">
                    AI-style recommendations
                  </span>
                  {vacancy.recommendations.length === 0 ? (
                    <span className="text-emerald-700">
                      Keep going – this role looks like a reasonable fit based
                      on current signals.
                    </span>
                  ) : (
                    <ul className="ml-4 list-disc space-y-1 text-emerald-800">
                      {vacancy.recommendations.map((rec, i) => (
                        <li key={i}>{rec}</li>
                      ))}
                    </ul>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>
      )}
    </section>
  );
}

