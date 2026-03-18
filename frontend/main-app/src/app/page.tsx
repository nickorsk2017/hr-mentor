import Link from "next/link";

export default function Home() {
  return (
    <section className="flex w-full flex-col gap-10">
      <div className="mt-4 flex flex-col gap-4">
        <h1 className="text-3xl font-semibold tracking-tight text-zinc-950">
          AI HR Mentor for your career growth
        </h1>
        <p className="max-w-2xl text-sm text-zinc-600">
          Upload your CV, track vacancies and interview stages, and let an AI
          mentor rank opportunities and suggest technologies to grow into your
          next role.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Link
          href="/my-cv"
          className="group rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
        >
          <h2 className="mb-1 text-sm font-semibold text-zinc-900">
            1. Capture your CV
          </h2>
          <p className="text-lg text-zinc-600">
            Paste or edit your CV in a rich editor and optionally attach a file
            version.
          </p>
        </Link>

        <Link
          href="/vacancies"
          className="group rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
        >
          <h2 className="mb-1 text-sm font-semibold text-zinc-900">
            2. Track vacancies
          </h2>
          <p className="text-lg text-zinc-600">
            Add roles you are applying for, manage stages, and log notes on
            success or failure.
          </p>
        </Link>

        <Link
          href="/ranking"
          className="group rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm transition hover:-translate-y-0.5 hover:border-zinc-300 hover:shadow-md"
        >
          <h2 className="mb-1 text-sm font-semibold text-zinc-900">
            3. Get ranking & advice
          </h2>
          <p className="text-lg text-zinc-600">
            See which roles are the best fit and which technologies to improve
            for your target position.
          </p>
        </Link>
      </div>

      <div className="mt-2 flex flex-col gap-2 rounded-2xl border border-dashed border-zinc-300 bg-white px-4 py-3">
        <span className="text-lg font-semibold uppercase tracking-wide text-zinc-500">
          How it works
        </span>
        <ol className="ml-4 list-decimal space-y-1 text-lg text-zinc-600">
          <li>Upload or edit your CV on the My CV page.</li>
          <li>
            Add vacancies and interview stages, marking them as done or failed
            with notes.
          </li>
          <li>
            Visit the Ranking page to see a ranked list of vacancies based on
            your CV and interview progress, plus skill recommendations.
          </li>
        </ol>
      </div>
    </section>
  );
}

