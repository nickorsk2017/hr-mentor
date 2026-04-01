"use client";

import { useEffect, useMemo } from "react";
import { useCvStore } from "@/stores/cvStore";
import { useVacancyRankingStore } from "@/stores/vacancyRankedStore";
import Image from "next/image";
import { VacancyRankedCard } from "@/components/features/ranking/VacancyRankedCard";

function computeFitScore(cvText: string, vacancy: Entity.RankedVacancy): Entity.RankedVacancy {
  const stages = vacancy.stages ?? [];
  const base: Entity.RankedVacancy = vacancy;

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
    match_score: fitScore,
    completed_stages: completedStages,
    total_stages: totalStages,
    failed_stages: failedStages,
    recommendations: recommendations,
  };
}

export default function RankingPage() {
  const cv = useCvStore((s) => s.cv);
  const vacancies: Entity.RankedVacancy[] = useVacancyRankingStore((s) => s.vacancies);
  const loadingVacancies = useVacancyRankingStore((s) => s.loadingVacancies);
  const vacanciesError = useVacancyRankingStore((s) => s.vacanciesError);
  const activeVacancyId = useVacancyRankingStore((s) => s.activeVacancyId);
  const fetchMatchedVacancies = useVacancyRankingStore(
    (s) => s.fetchMatchedVacancies
  );
  const setActiveVacancyId = useVacancyRankingStore(
    (s) => s.setActiveVacancyId
  );

  useEffect(() => {
    fetchMatchedVacancies();
  }, [fetchMatchedVacancies]);

  const ranked = useMemo(() => {
    const cvText =
      cv?.contentHtml
        .replace(/<[^>]+>/g, " ")
        .replace(/\s+/g, " ")
        .trim() ?? "";

    const hasApiRank = vacancies.some(
      (v) => typeof v.match_score === "number"
    );
    const mapped = vacancies.sort((a, b) => b.match_score - a.match_score).map((v) => {
      const local = computeFitScore(cvText, v);
      const match_score = v.match_score;
      if (typeof match_score === "number") {
        return { ...local, match_score: Math.max(0, Math.min(100, Math.round(match_score))) };
      }
      return local;
    });

    if (hasApiRank) {
      return mapped;
    }
    return mapped.sort((a, b) => b.match_score - a.match_score);
  }, [cv, vacancies]);

  const avgFit = ranked.length
    ? Math.round(ranked.reduce((acc, item) => acc + item.match_score, 0) / ranked.length)
    : 0;
  const strongMatches = ranked.filter((item) => item.match_score >= 75).length;
  const weakMatches = ranked.filter((item) => item.match_score < 50).length;

  return (
    <section className="flex w-full flex-col gap-5 mt-16 md:mt-0">
      <header className="rounded-3xl border border-violet-100 bg-white p-6 shadow-sm">
        <div className="flex-col-reverse md:flex-row flex gap-3">
          <div className="flex flex-col gap-3">
              <h1 className="text-4xl font-semibold text-zinc-900 sticky top-0 bg-white/80 backdrop-blur-sm">Matching for your profile</h1>
              <p className="max-w-3xl text-lg text-zinc-600">
              We intelligently rank vacancies based on how well they match your profile—so you see the best opportunities first.
              <br/>Once your CV is added, our AI prioritizes roles from highest to lowest fit.
              </p>
          </div>
          <Image src="/ranking-img.png" alt="Matching" width={450} height={500} className="rounded-xl overflow-hidden" />
        </div>
        <div className="mt-5 grid gap-3 md:grid-cols-3">
          <div className="rounded-xl border border-zinc-200 bg-white p-3">
            <p className="text-sm text-zinc-500">Vacancies ranked</p>
            {loadingVacancies ? (
              <div className="mt-1 h-8 w-16 animate-pulse rounded bg-zinc-200" />
            ) : (
              <p className="text-2xl font-semibold text-zinc-900">{ranked.length}</p>
            )}
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-3">
            <p className="text-sm text-zinc-500">Average fit score</p>
            {loadingVacancies ? (
              <div className="mt-1 h-8 w-24 animate-pulse rounded bg-zinc-200" />
            ) : (
              <p className="text-2xl font-semibold text-zinc-900">{avgFit}%</p>
            )}
          </div>
          <div className="rounded-xl border border-zinc-200 bg-white p-3">
            <p className="text-sm text-zinc-500">Strong / weak matches</p>
            {loadingVacancies ? (
              <div className="mt-1 h-8 w-28 animate-pulse rounded bg-zinc-200" />
            ) : (
              <p className="text-2xl font-semibold text-zinc-900">{strongMatches} / {weakMatches}</p>
            )}
          </div>
        </div>
      </header>

      {loadingVacancies && (
        <p className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-500">Loading vacancies...</p>
      )}

      {vacanciesError && !loadingVacancies && (
        <p className="rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-base text-red-800">
          {vacanciesError}
        </p>
      )}

      {!loadingVacancies && !vacanciesError && ranked.length === 0 ? (
        <p className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-500">
          No vacancies to rank yet. Add a few on the Vacancies page first.
        </p>
      ) : !loadingVacancies && !vacanciesError ? (
        <div className="flex flex-col gap-4">
          {ranked.map((vacancy, index) => (
            <VacancyRankedCard
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

