"use client";

import { useEffect, useRef, useState } from "react";
import { useCvStore } from "@/stores/cvStore";
import { RichEditor } from "@/components/common/ui/RichEditor";
import {
  getLastSavedCvFromBackend,
  saveCvToBackend,
} from "@/services/cvService";
import { Header } from "@/components/layout/Header";
import { Container } from "@/components/layout/Container";

export default function MyCVPage() {
  const cv = useCvStore((s) => s.cv);
  const setCv = useCvStore((s) => s.setCv);
  const [draftHtml, setDraftHtml] = useState<string>(cv?.contentHtml ?? "");
  const [fileName] = useState<string | undefined>(cv?.uploadedFileName);
  const [isLoading, setIsLoading] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const timeLoadingRef = useRef<NodeJS.Timeout | undefined>(undefined);

  
  useEffect(() => {
    return () => {
      clearTimeout(timerRef.current);
      clearTimeout(timeLoadingRef.current);
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      setIsLoading(true);

      try {
        const saved = await getLastSavedCvFromBackend();
        if (!saved || cancelled) return;
        setDraftHtml(saved.cv_text);

        setCv({
          contentHtml: saved.cv_text,
          uploadedFileName: fileName,
        });

    } finally {
        if (!cancelled) setIsLoading(false);
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [setCv, fileName]);

  const handleSave = async () => {
    setIsLoading(true);
    clearTimeout(timeLoadingRef.current);
    await saveCvToBackend(draftHtml);

    timeLoadingRef.current = setTimeout(() => {
      setIsLoading(false);
    }, 2000);

    setCv({
      contentHtml: draftHtml,
      uploadedFileName: fileName,
    });
  };

  const handleChangeHtml = (html: string) => {
    setDraftHtml(html);

    setCv({
      contentHtml: html,
      uploadedFileName: fileName,
    });

    clearTimeout(timerRef.current);

    timerRef.current = setTimeout(() => {
      handleSave();
    }, 2000);

  };

  return (
    <Container className="flex w-full flex-col gap-4">
      <Header
        title="My CV"
      />
      <RichEditor valueHtml={draftHtml} onChangeHtml={handleChangeHtml} classToolbar="!top-[64px]" />
      <p className="text-[11px] text-zinc-500">
        Tip: Include key skills, technologies, and achievements. The ranking
        engine uses this text to compare with vacancies.
      </p>
  </Container>
  );
}

