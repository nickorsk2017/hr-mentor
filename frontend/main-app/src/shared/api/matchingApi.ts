import { getOrCreateUserId } from "./cvApi";

const DEFAULT_MATCHING_BASE = "http://localhost:8001";

export const MATCHING_API_BASE =
  process.env.NEXT_PUBLIC_AI_MATCHING_MICROSERVICE_URL?.replace(/\/$/, "") ??
  DEFAULT_MATCHING_BASE;

export async function getVacanciesForMatching(): Promise<Entity.Vacancy[]> {
  const userId = getOrCreateUserId();
  const res = await fetch(
    `${MATCHING_API_BASE}/v1/vacancies?user_id=${encodeURIComponent(userId)}`
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Get vacancies for matching failed (${res.status})${detail ? `: ${detail}` : ""}`
    );
  }

  const data = (await res.json()) as { vacancies: Entity.Vacancy[] };
  return data.vacancies ?? []
}

export async function indexVacancyForMatching(vacancy: Entity.Vacancy): Promise<void> {
  const desc = vacancy.description?.trim();
  const title = vacancy.title?.trim() ?? "";
  const company = vacancy.company?.trim() ?? "";
  const description =
    desc ||
    [title, company].filter(Boolean).join(" — ") ||
    "No description yet.";

  const res = await fetch(`${MATCHING_API_BASE}/v1/vacancies/index`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: getOrCreateUserId(),
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
    `${MATCHING_API_BASE}/v1/vacancies/index/${encodeURIComponent(vacancyId)}`,
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
