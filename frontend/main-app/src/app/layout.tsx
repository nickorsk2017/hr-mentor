import type { Metadata } from "next";
import Link from "next/link";
import { Inter, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { SidebarNav } from "@/shared/layout/SidebarNav";

const inter = Inter({
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
        className={`${inter.variable} ${geistMono.variable} antialiased bg-gradient-to-br from-[#f4f3ff] via-[#f9fafb] to-[#eef5ff] text-zinc-900`}
      >
        <Providers>
          <div className="min-h-screen flex items-start px-4 py-4 text-sm text-zinc-800">
            <SidebarNav />

            {/* Main content area */}
            <main className="flex-1">
              <header className="sticky top-0 z-30 mb-4 flex items-center justify-between border-b border-[#e4e3ee] bg-white/80 px-6 py-4 backdrop-blur">
                <div className="flex items-center gap-2 text-2xl">
                  <span className="font-semibold text-[#5f41d5]">AI</span>
                  <span className="font-semibold text-zinc-800">Carrier</span>
                  <span className="font-medium text-zinc-500">Mentor</span>
                </div>

                <Link
                  href="/vacancies"
                  className="inline-flex items-center rounded-full bg-[#6f47d9] px-5 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#613acb]"
                >
                  + Add Vacancy
                </Link>
              </header>
              <div className="mx-auto max-w-6xl px-6 py-4 relative">{children}</div>
            </main>
          </div>
        </Providers>
      </body>
    </html>
  );
}

