import { Container } from "@/components/layout/Container";
import Image from "next/image";
import Link from "next/link";
import {
  BriefcaseIcon,
  FileTextIcon,
  IconBadge,
  RankingAdviceIcon,
} from "@/components/common/icons";

export default function Home() {
  return (
    <Container className="flex w-full flex-col gap-8 pb-8 mt-15 md:mt-0">
      <section className="grid items-center gap-6 rounded-3xl border border-zinc-200 bg-gradient-to-br from-violet-40 to-white p-6 shadow-sm lg:grid-cols-[1.1fr_1fr] mb-8">
        <div className="flex flex-col gap-4">
          <h1 className="max-w-xl text-5xl font-semibold leading-tight text-zinc-900">
            AI Carrier Mentor for your career growth
          </h1>
          <p className="max-w-xl text-2xl leading-relaxed text-zinc-600">
            Paste your CV, track vacancies and interview stages, and let an AI
            mentor rank opportunities and suggest technologies to grow into
            your next role.
          </p>
          <div>
            <Link
              href="/my-cv"
              className="inline-flex items-center rounded-2xl bg-violet-600 px-5 py-3 text-lg font-semibold text-white shadow-sm transition hover:bg-violet-700"
            >
              Get Started with Your CV
            </Link>
          </div>
        </div>

        <div className="flex justify-center lg:justify-end  mb-8">
          <Image
            src="/main-page-hero.png"
            alt="AI career mentor dashboard illustration"
            width={620}
            height={410}
            className="h-auto w-full max-w-[620px]"
            priority
          />
        </div>
      </section>

      <section
        className="grid gap-6 lg:grid-cols-2 mb-8"
        aria-labelledby="problem-solution-heading"
      >
        <h2 id="problem-solution-heading" className="sr-only">
          Problem and solution
        </h2>
        <div className="flex flex-col gap-4 rounded-3xl border border-rose-200/80 bg-gradient-to-br from-rose-50/90 to-white p-6 shadow-sm">
          <div className="flex items-center gap-4 h-[150px]">
            <Image src="/icon-problem.png" alt="Problem" width={150} height={150} className="w-[150px] h-auto" />
            <h3 className="text-4xl font-semibold text-zinc-900">Problem</h3>
          </div>
          <p className="text-xl font-medium leading-relaxed text-zinc-800">
            Finding the right job is overwhelming.
          </p>
          <p className="text-xl leading-relaxed text-zinc-600">
            Candidates spend hours scrolling through irrelevant vacancies,
            guessing which roles actually fit their skills. Most platforms rely
            on basic keyword ranking—ignoring real experience, seniority, and
            context.
          </p>
        </div>
        <div className="flex flex-col gap-5 rounded-3xl border border-violet-200/80 bg-gradient-to-br from-violet-50/90 to-white p-6 shadow-sm">
          <div className="flex items-center gap-6 h-[150px]">
            <Image src="/icon-robot.png" alt="Solution" width={150} height={150}  className="w-[150px] h-auto" />
            <h3 className="text-4xl font-semibold text-zinc-900">Solution</h3>
          </div>
          <p className="text-xl font-medium leading-relaxed text-zinc-800">
            We do the thinking for you.
          </p>
          <p className="text-xl leading-relaxed text-zinc-600">
            Our AI analyzes your CV and ranks vacancies based on real fit—not
            just keywords.
          </p>
          <ul className="space-y-3 border-t border-violet-100 pt-4 text-xl leading-relaxed text-zinc-700">
            <li className="flex gap-3">
              <span className="shrink-0" aria-hidden="true">
                🎯
              </span>
              <span>See the most relevant roles first</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0" aria-hidden="true">
                ⚡
              </span>
              <span>Save hours of manual searching</span>
            </li>
            <li className="flex gap-3">
              <span className="shrink-0" aria-hidden="true">
                📈
              </span>
              <span>Focus on jobs you&apos;re most likely to get</span>
            </li>
          </ul>
        </div>
      </section>

      
      <h2 className="text-4xl font-semibold text-zinc-900 mb-8">How it works</h2>
      <section className="grid gap-4 md:grid-cols-3  mb-8">
        <Link
          href="/my-cv"
          className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
        >
          <IconBadge className="bg-indigo-100 text-indigo-700">
            <FileTextIcon className="text-indigo-700" />
          </IconBadge>
          <h2 className="mb-1 text-2xl font-semibold text-zinc-900">
            1. Paste your CV
          </h2>
          <p className="text-xl leading-relaxed text-zinc-600">
            Paste your CV in a rich editor
          </p>
        </Link>

        <Link
          href="/vacancies"
          className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
        >
          <IconBadge className="bg-emerald-100 text-emerald-700">
            <BriefcaseIcon className="text-emerald-700" />
          </IconBadge>
          <h2 className="mb-1 text-2xl font-semibold text-zinc-900">
            2. Track vacancies
          </h2>
          <p className="text-xl leading-relaxed text-zinc-600">
            Add roles you are applying for, manage stages, and log notes on
            success or failure.
          </p>
        </Link>

        <Link
          href="/ranking"
          className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
        >
          <IconBadge className="bg-amber-100 text-amber-700">
            <RankingAdviceIcon className="text-amber-700" />
          </IconBadge>
          <h2 className="mb-1 text-2xl font-semibold text-zinc-900">
            3. Get ranking & advice
          </h2>
          <p className="text-xl leading-relaxed text-zinc-600">
            See which roles are the best fit and which technologies to improve
            for your target position.
          </p>
        </Link>
      </section>

    </Container>
  );
}

