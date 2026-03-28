import { Container } from "@/components/layout/Container";
import Image from "next/image";
import Link from "next/link";
import type { ReactNode } from "react";

function IconBadge({ children }: { children: ReactNode }) {
  return (
    <div className="mb-3 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-violet-100 text-violet-700">
      {children}
    </div>
  );
}

function FileTextIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-violet-700"
      aria-hidden="true"
    >
      <path d="M14 2H7a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7l-5-5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M14 2v5h5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M9 12h6M9 16h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
    </svg>
  );
}

function BriefcaseIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-violet-700"
      aria-hidden="true"
    >
      <rect x="3" y="7" width="18" height="13" rx="2" stroke="currentColor" strokeWidth="2" />
      <path d="M3 12h18" stroke="currentColor" strokeWidth="2" />
      <path d="M9 7V5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2v2" stroke="currentColor" strokeWidth="2" />
    </svg>
  );
}

function RankingAdviceIcon() {
  return (
    <svg
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="text-violet-700"
      aria-hidden="true"
    >
      <path
        d="M4 16L10 10L14 14L20 8"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M14.5 8H20V13.5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export default function Home() {
  return (
    <Container className="flex w-full flex-col gap-8 pb-8">
      <section className="grid items-center gap-6 rounded-3xl border border-zinc-200 bg-gradient-to-br from-violet-40 to-white p-6 shadow-sm lg:grid-cols-[1.1fr_1fr] mb-8">
        <div className="flex flex-col gap-4">
          <h1 className="max-w-xl text-5xl font-semibold leading-tight text-zinc-900">
            AI Carrier Mentor for your career growth
          </h1>
          <p className="max-w-xl text-2xl leading-relaxed text-zinc-600">
            Upload your CV, track vacancies and interview stages, and let an AI
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

      <section className="grid gap-4 md:grid-cols-3  mb-8">
        <Link
          href="/my-cv"
          className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
        >
          <IconBadge>
            <FileTextIcon />
          </IconBadge>
          <h2 className="mb-1 text-2xl font-semibold text-zinc-900">
            1. Paste or edit your CV
          </h2>
          <p className="text-xl leading-relaxed text-zinc-600">
            Paste or edit your CV in a rich editor and optionally attach a
            file version.
          </p>
        </Link>

        <Link
          href="/vacancies"
          className="group rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
        >
          <IconBadge>
            <BriefcaseIcon />
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
          <IconBadge>
            <RankingAdviceIcon />
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

      <section className="rounded-2xl border border-zinc-200 bg-white px-5 py-4 shadow-sm">
        <p className="mb-2 text-lg font-semibold uppercase tracking-wide text-violet-700">
          How it works
        </p>
        <ol className="ml-5 list-decimal space-y-1 text-xl leading-relaxed text-zinc-600">
          <li>Fill your CV on the My CV page.</li>
          <li>
            Add vacancies and interview stages, marking them as done or failed
            with notes.
          </li>
          <li>
            Visit the Ranking page to see a ranked list of vacancies based on
            your CV and interview progress, plus skill recommendations.
          </li>
        </ol>
      </section>
    </Container>
  );
}

