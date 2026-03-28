"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

type NavItem = {
  href: string;
  label: string;
  icon: React.ReactNode;
};

const items: NavItem[] = [
  {
    href: "/",
    label: "Home",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path
          d="M3 10.5L12 3L21 10.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path
          d="M5.5 9.5V20H18.5V9.5"
          stroke="currentColor"
          strokeWidth="1.8"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    ),
  },
  {
    href: "/my-cv",
    label: "My CV",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <rect x="5" y="3" width="14" height="18" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M8 8H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
        <path d="M8 12H16" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
      </svg>
    ),
  },
  {
    href: "/vacancies",
    label: "Vacancies",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <path d="M8 7V5.5A1.5 1.5 0 0 1 9.5 4H14.5A1.5 1.5 0 0 1 16 5.5V7" stroke="currentColor" strokeWidth="1.8" />
        <rect x="3" y="7" width="18" height="13" rx="2.2" stroke="currentColor" strokeWidth="1.8" />
        <path d="M3 12.5H21" stroke="currentColor" strokeWidth="1.8" />
      </svg>
    ),
  },
  {
    href: "/matching",
    label: "Matching",
    icon: (
      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden>
        <circle cx="12" cy="12" r="8.5" stroke="currentColor" strokeWidth="1.8" />
        <path d="M9.5 12.5L11.2 14.2L14.8 10.6" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
      </svg>
    ),
  },
];

export function SidebarNav() {
  const pathname = usePathname();

  return (
    <aside className="sticky top-4 mr-4 flex h-[calc(100vh-2rem)] w-60 flex-col rounded-[26px] border border-[#e7e6f5] bg-[#f1f4fa] p-4 shadow-[0_2px_10px_rgba(19,17,56,0.05)]">
      <div className="mb-3 flex items-center gap-1.5 px-1 text-base">
        <span className="font-semibold text-[#5f41d5]">AI</span>
        <span className="font-semibold text-zinc-800">Carrier</span>
        <span className="font-medium text-zinc-500">Mentor</span>
      </div>

      <div className="mb-3 border-t border-[#e3e2ef]" />

      <nav className="flex flex-col gap-1.5">
        {items.map((item) => {
          const active = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`relative flex items-center gap-2.5 rounded-xl px-3 py-2 text-base font-medium transition ${
                active
                  ? "bg-white/55 text-[#5f41d5]"
                  : "text-zinc-700 hover:bg-white/45 hover:text-zinc-900"
              }`}
            >
              {active && (
                <span className="absolute -left-2 top-2 bottom-2 w-1 rounded-full bg-[#7f59ff]" />
              )}
              <span className={active ? "text-[#5f41d5]" : "text-zinc-500"}>{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}

