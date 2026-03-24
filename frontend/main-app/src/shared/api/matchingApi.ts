import type { Vacancy } from "../../app/mentor-context";

const DEFAULT_MATCHING_BASE = "http://localhost:8001";

export const MATCHING_API_BASE =
  process.env.NEXT_PUBLIC_AI_MATCHING_MICROSERVICE_URL?.replace(/\/$/, "") ??
  DEFAULT_MATCHING_BASE;

/**
 * POST /ai/index — LLM extraction + embed short_description + Pinecone upsert.
 * Safe to call with minimal text; uses fallbacks so the API min_length=1 is satisfied.
 */
export async function indexVacancyForMatching(vacancy: Vacancy): Promise<void> {
  const desc = vacancy.description?.trim();
  const title = vacancy.title?.trim() ?? "";
  const company = vacancy.company?.trim() ?? "";
  const description =
    desc ||
    [title, company].filter(Boolean).join(" — ") ||
    "No description yet.";

  const res = await fetch(`${MATCHING_API_BASE}/ai/index`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      vacancy_id: vacancy.id,
      title,
      company: company || null,
      description,
    }),
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Index vacancy failed (${res.status})${detail ? `: ${detail}` : ""}`
    );
  }
}

export async function deleteVacancyFromMatchingIndex(
  vacancyId: string
): Promise<void> {
  const res = await fetch(
    `${MATCHING_API_BASE}/ai/index/${encodeURIComponent(vacancyId)}`,
    {
      method: "DELETE",
    }
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Delete vacancy index failed (${res.status})${detail ? `: ${detail}` : ""}`
    );
  }
}
