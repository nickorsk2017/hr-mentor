import type { Metadata } from "next";
import { Inter, Geist_Mono } from "next/font/google";
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
        className={`${inter.variable} ${geistMono.variable} antialiased text-zinc-900 relative`}
      >
        <div className="min-h-screen flex items-start px-4 py-4 text-sm text-zinc-800">
            <SidebarNav />
            {/* Main content area */}
            <main className="flex-1">
              <div className="mx-auto px-6 py-4 relative">{children}</div>
            </main>
        </div>
      </body>
    </html>
  );
}

