import { getOrCreateUserId } from "./cvService";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8004" ;

export async function getRenkingVacancies(): Promise<Entity.Vacancy[]> {
  const userId = getOrCreateUserId();
  const res = await fetch(
    `${API_URL}/rankings?user_id=${encodeURIComponent(userId)}`
  );

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    throw new Error(
      `Get vacancies for ranking failed (${res.status})${detail ? `: ${detail}` : ""}`
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

  const res = await fetch(`${API_URL}/vacancies/index`, {
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
    `${API_URL}/v1/vacancies/index/${encodeURIComponent(vacancyId)}`,
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
