"use client";

import { useEffect, useMemo } from "react";
import { useCvStore } from "@/stores/cvStore";
import { useVacancyRankingStore } from "@/stores/vacancyRankedStore";
import Image from "next/image";
import { VacancyRankedCard } from "@/components/features/ranking/VacancyRankedCard";


export default function RankingPage() {
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


  const avgFit = vacancies.length
    ? Math.round(vacancies.reduce((acc, vacancy) => acc + vacancy.match_score, 0) / vacancies.length)
    : 0;
  const strongMatches = vacancies.filter((vacancy) => vacancy.match_score >= 70).length;
  const weakMatches = vacancies.filter((vacancy) => vacancy.match_score < 70).length;
  const vacanciesSorted = vacancies.sort((a, b) => b.match_score - a.match_score);

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
              <p className="text-2xl font-semibold text-zinc-900">{vacancies.length}</p>
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
            <p className="text-sm text-zinc-500">Strong / Weak matches</p>
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

      {!loadingVacancies && !vacanciesError && vacancies.length === 0 ? (
        <p className="rounded-xl border border-zinc-200 bg-white px-4 py-3 text-base text-zinc-500">
          No vacancies to rank yet. Add a few on the Vacancies page first.
        </p>
      ) : !loadingVacancies && !vacanciesError ? (
        <div className="flex flex-col gap-4">
          {vacanciesSorted.map((vacancy, index) => (
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

