"use client";

import { useState } from "react";
import { useMentor } from "../mentor-context";
import { CvRichEditor } from "../../shared/ui/CvRichEditor";
import { Button } from "../../shared/ui/Button";

export default function MyCvPage() {
  const { cv, setCv } = useMentor();
  const [draftHtml, setDraftHtml] = useState<string>(cv?.contentHtml ?? "");
  const [fileName, setFileName] = useState<string | undefined>(
    cv?.uploadedFileName
  );

  const handleSave = () => {
    setCv({
      contentHtml: draftHtml,
      uploadedFileName: fileName,
    });
  };

  return (
    <section className="flex w-full flex-col gap-6">
      <header className="sticky top-0 z-10 flex flex-col gap-2 border-b border-white/70 bg-white/80 pb-3 backdrop-blur">
        <h1 className="text-xl font-semibold text-zinc-950">My CV</h1>
        <p className="max-w-2xl text-lg text-zinc-600">
          Maintain a structured version of your CV here. Use the rich editor to
          tweak content for different roles and keep a file copy attached if
          you like.
        </p>
      </header>

      <div className="flex flex-col gap-4 rounded-2xl border border-zinc-200 bg-white p-4 shadow-sm">

        <div className="flex flex-col gap-2">

          <CvRichEditor valueHtml={draftHtml} onChangeHtml={setDraftHtml} />
          <p className="text-[11px] text-zinc-500">
            Tip: Include key skills, technologies, and achievements. The ranking
            engine uses this text to compare with vacancies.
          </p>
        </div>

        <div className="flex justify-end gap-2">
          <Button
            type="button"
            onClick={handleSave}
            appearance="primary"
          >
            Save CV
          </Button>
        </div>
      </div>
    </section>
  );
}

