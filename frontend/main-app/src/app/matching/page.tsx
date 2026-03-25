"use client";

import React, { useEffect, useMemo, useState } from "react";
import { getVacanciesForMatching } from "../../shared/api/matchingApi";
import { useMentor } from "../mentor-context";
import { VacancyMatchingCard, type RankedVacancy } from "./children/VacancyMatchingCard";

function computeFitScore(cvText: string, vacancy: Entity.Vacancy): RankedVacancy {
  const stages = vacancy.stages ?? [];
  const base: RankedVacancy = {
    ...vacancy,
    stages,
    fitScore: 0,
    completedStages: 0,
    totalStages: stages.length,
    failedStages: 0,
    recommendations: [],
    whyScore: vacancy.reason ?? null,
    techScore: vacancy.tech_score ?? null,
    yearsScore: vacancy.years_score ?? null,
    otherScore: vacancy.other_score ?? null,
    domainScore: vacancy.domain_score ?? null,
    alignedSkills: vacancy.aligned_skills ?? [],
    notAlignedSkills: vacancy.not_aligned_skills ?? [],
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

  const completedStages = stages.filter((s) => s.status === "done").length;
  const failedStages = stages.filter((s) => s.status === "failed").length;
  const totalStages = stages.length || 1;

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
  const { cv } = useMentor();
  const [vacancies, setVacancies] = useState<Entity.Vacancy[]>([]);
  const [loadingVacancies, setLoadingVacancies] = useState(true);
  const [vacanciesError, setVacanciesError] = useState<string | null>(null);
  const [activeVacancyId, setActiveVacancyId] = useState<string | null>(null);

  useEffect(() => {
    const loadVacancies = async () => { 
      const vacancies = await getVacanciesForMatching();
      setVacancies(vacancies);
      setLoadingVacancies(false);
    };

    loadVacancies();
  }, []);

  const ranked = useMemo(() => {
    const cvText =
      cv?.contentHtml
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim() ?? "";

    const hasApiRank = vacancies.some(
      (v) => typeof v.match_score === "number"
    );
    const mapped = vacancies.map((v) => {
      const local = computeFitScore(cvText, v);
      const api = v.match_score;
      if (typeof api === "number") {
        return { ...local, fitScore: Math.max(0, Math.min(100, Math.round(api))) };
      }
      return local;
    });

    if (hasApiRank) {
      return mapped;
    }
    return mapped.sort((a, b) => b.fitScore - a.fitScore);
  }, [cv, vacancies]);

  return (
    <section className="flex w-full flex-col gap-6">
      <header className="flex flex-col gap-2">
        <h1 className="text-xl font-semibold text-zinc-950">
          Matching
        </h1>
        <p className="max-w-2xl text-lg text-zinc-600">
          When your CV is saved to the backend, vacancies are ordered by
          OpenAI from best fit to weakest. Otherwise they stay in recency order
          and scores use local keyword heuristics.
        </p>
      </header>

      {!cv && (
        <p className="rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-lg text-amber-800">
          No CV content found yet. The ranking will be much more accurate once
          you add your CV on the My CV page.
        </p>
      )}

      {loadingVacancies && (
        <p className="text-lg text-zinc-500">Loading vacancies…</p>
      )}

      {vacanciesError && !loadingVacancies && (
        <p className="rounded-lg border border-red-200 bg-red-50 px-3 py-2 text-lg text-red-800">
          {vacanciesError}
        </p>
      )}

      {!loadingVacancies && !vacanciesError && ranked.length === 0 ? (
        <p className="text-lg text-zinc-500">
          No vacancies to rank yet. Add a few on the Vacancies page first.
        </p>
      ) : !loadingVacancies && !vacanciesError ? (
        <div className="flex flex-col gap-3">
          {ranked.map((vacancy, index) => (
            <VacancyMatchingCard
              key={vacancy.id}
              vacancy={vacancy}
              index={index + 1}
              isActive={vacancy.id === activeVacancyId}
              onActivate={() => setActiveVacancyId(vacancy.id)}
            />
          ))}
        </div>
      ) : null}
    </section>
  );
}

