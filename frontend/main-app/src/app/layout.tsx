import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
import { AuthorWelcomeModal } from "@/components/layout/AuthorWelcomeModal";
import { SidebarNav } from "@/components/layout/SidebarNav";
import "./globals.css";

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
  description: "The AI mentor for a Job Seekers"
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.className} ${inter.variable} ${geistMono.variable} antialiased text-zinc-900 relative`}
      >
        <AuthorWelcomeModal />
        <div className="min-h-screen flex items-start px-3 py-3 text-sm text-zinc-800 md:px-4 md:py-4 max-w-7xl mx-auto">
            <SidebarNav />
            {/* Main content area */}
            <main className="flex-1 w-full">
              <div className="mx-auto px-2 py-2 relative md:px-6 md:py-4">
                {children}
              </div>
            </main>
        </div>
      </body>
    </html>
  );
}

