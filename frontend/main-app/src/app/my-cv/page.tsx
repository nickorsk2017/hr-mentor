"use client";

import { useEffect, useRef, useState } from "react";
import { useMentor } from "../mentor-context";
import { CvRichEditor } from "../../shared/ui/CvRichEditor";
import { Button } from "../../shared/ui/Button";
import { CircleLoader } from "../../shared/ui/CircleLoader";
import {
  getLastSavedCvFromBackend,
  saveCvToBackend,
} from "../../shared/api/cvApi";
import { Header } from "@/shared/layout/Header";

export default function MyCvPage() {
  const { cv, setCv } = useMentor();
  const [draftHtml, setDraftHtml] = useState<string>(cv?.contentHtml ?? "");
  const [fileName] = useState<string | undefined>(cv?.uploadedFileName);
  const [isLoading, setIsLoading] = useState(false);
  const [backendMessage, setBackendMessage] = useState<string>("");
  const timerRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const timeLoadingRef = useRef<NodeJS.Timeout | undefined>(undefined);

  // Cleanup side effects
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

        setBackendMessage("Loaded CV from backend");
      } catch {
        if (!cancelled) {
          setBackendMessage("Could not load CV from backend");
        }
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
    setBackendMessage("");
    clearTimeout(timeLoadingRef.current);

    try {
      await saveCvToBackend(draftHtml);
      setBackendMessage("");
    } catch {
      setBackendMessage("Backend save failed. Kept local data.");
    } finally {

      timeLoadingRef.current = setTimeout(() => {
        setIsLoading(false);
      }, 2000);
    }

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
    <section className="flex w-full flex-col gap-4">
      <Header
        title="My CV"
      />

      <div className="flex flex-col w-fulljustify-center items-center">
        <div className="w-full  max-w-6xl ">

          <CvRichEditor valueHtml={draftHtml} onChangeHtml={handleChangeHtml} classToolbar="!top-[64px]" />
          <p className="text-[11px] text-zinc-500">
            Tip: Include key skills, technologies, and achievements. The ranking
            engine uses this text to compare with vacancies.
          </p>
        </div>
      </div>  
    </section>
  );
}

