"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Modal } from "@/components/common/ui/Modal";
import { LinkedInIcon } from "@/components/common/icons";
const FIRST_VISIT_KEY = "is_visited";
const LINKEDIN_URL = "https://www.linkedin.com/in/nickot/";

export function AuthorWelcomeModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const seen = window.localStorage.getItem(FIRST_VISIT_KEY);
    if (seen) return;

    setOpen(true);
    window.localStorage.setItem(FIRST_VISIT_KEY, "1");
  }, []);

  return (
    <Modal
      open={open}
      title="Welcome to demo of AI-first product  👋"
      onClose={() => setOpen(false)}
    >
      <p className="text-[20px] text-zinc-600 whitespace-pre-line mb-6">
        My name is <b>Nikolai Stepanov</b><br/><br/>
        <b>I build AI products end-to-end</b> — from concept to production-ready systems. This project shows how I design AI systems and make real problems simpler with AI.
        <br/><br/>
        If you’re looking to build an AI-powered product, I’d be glad to help.
      </p>
     <Link href={LINKEDIN_URL} target="_blank" rel="noreferrer" className="inline-flex items-center gap-2 text-white font-semibold text-[18px] bg-blue-500 px-4 py-2 rounded-lg w-full md:w-auto">
        <LinkedInIcon /> Visit my LinkedIn Page
      </Link>
    </Modal>
  );
}
