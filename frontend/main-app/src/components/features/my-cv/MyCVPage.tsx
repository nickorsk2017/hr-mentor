"use client";

import { useEffect, useRef, useState } from "react";
import { useCvStore } from "@/stores/cvStore";
import { RichEditor } from "@/components/common/ui/RichEditor";
import {
  getCV,
  saveCV,
} from "@/services/cvService";
import { Header } from "@/components/layout/Header";
import { Container } from "@/components/layout/Container";
import { Preloader } from "@/components/common/ui/Preloader";

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
        const saved = await getCV();
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


  const handleChangeHtml = (html: string) => {
    setDraftHtml(html);

    clearTimeout(timeLoadingRef.current);
    timeLoadingRef.current = setTimeout(async () => {
      setIsLoading(true);
      await saveCV(html);
      setIsLoading(false);
    }, 2500;

    setCv({
      contentHtml: html,
      uploadedFileName: fileName,
    });
  };

  return (
    <Container className="flex w-full flex-col gap-4 mt-10 md:mt-0">
      <Header
        title="My CV"
      />
      <RichEditor autoFocus placeholder="Paste your CV here..."  valueHtml={draftHtml} onChangeHtml={handleChangeHtml} classToolbar="!top-[64px]" />
      {isLoading && <Preloader />}
  </Container>
  );
}

