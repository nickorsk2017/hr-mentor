import type { Metadata } from "next";
import Link from "next/link";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "AI HR Mentor",
  description: "Your personal AI mentor for CVs and vacancies.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-[#f4f3ff] via-[#f9fafb] to-[#eef5ff] text-zinc-900`}
      >
        <Providers>
          <div className="min-h-screen flex items-start px-4 py-4 text-sm text-zinc-800">
            {/* Sidebar */}
            <aside className="sticky top-4 mr-4 flex h-[calc(100vh-2rem)] w-60 flex-col rounded-3xl bg-white/80 p-4 shadow-sm ring-1 ring-zinc-100 backdrop-blur">
              <div className="mb-4 flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[#7c5cff] to-[#f973ff] text-lg font-semibold text-white">
                  AI
                </div>
                <div className="flex flex-col">
                  <span className="text-[11px] font-medium uppercase tracking-wide text-zinc-500">
                    AI HR Mentor
                  </span>
                  <span className="text-lg font-semibold text-zinc-900">
                    Career workspace
                  </span>
                </div>
              </div>

              <nav className="flex flex-1 flex-col gap-1 text-lg">
                <span className="mb-1 px-2 text-[10px] font-semibold uppercase tracking-wide text-zinc-400">
                  Main
                </span>
                <Link
                  href="/"
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                  <span>Home</span>
                </Link>
                <Link
                  href="/my-cv"
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-sky-400" />
                  <span>My CV</span>
                </Link>
                <Link
                  href="/vacancies"
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-violet-400" />
                  <span>Vacancies</span>
                </Link>
                <Link
                  href="/ranking"
                  className="flex items-center gap-2 rounded-xl px-2 py-1.5 text-zinc-700 hover:bg-zinc-50 hover:text-zinc-900"
                >
                  <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                  <span>Ranking &amp; Advice</span>
                </Link>

                <div className="mt-auto">
                  <button
                    type="button"
                    className="mt-3 flex w-full items-center justify-between rounded-2xl bg-zinc-50 px-3 py-2 text-[11px] text-zinc-600 ring-1 ring-zinc-100 hover:bg-zinc-100"
                  >
                    <span>Settings</span>
                    <span className="rounded-full bg-white px-2 py-0.5 text-[10px] text-zinc-500">
                      Soon
                    </span>
                  </button>
                </div>
              </nav>
            </aside>

            {/* Main content area */}
            <div className="flex min-h-full flex-1 flex-col  bg-white/80  ">

              <main className="flex-1 overflow-auto px-6 py-4">
                <div className="mx-auto max-w-6xl relative">{children}</div>
              </main>

              <footer className="mt-4 flex items-center justify-between text-[11px] text-zinc-400">
                <span>AI HR Mentor · Personal career cockpit</span>
                <span>Built with Next.js &amp; React</span>
              </footer>
            </div>
          </div>
        </Providers>
      </body>
    </html>
  );
}

