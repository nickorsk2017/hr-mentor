import { getOrCreateUserId } from "./cvService";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8004" ;

export async function createVacancyOnBackend(payload: {
  title: string;
  company?: string;
  description?: string;
}): Promise<Entity.Vacancy> {
  const userId = getOrCreateUserId();

  const res = await fetch(`${API_URL}/vacancies`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      title: payload.title,
      company: payload.company ?? "",
      description: payload.description ?? "",
      stages: [],
      planned_stages: 1,
    }),
  });

  if (!res.ok) {
    throw new Error(`Create vacancy failed (${res.status})`);
  }

  const vacancy = (await res.json()) as Entity.Vacancy;
  return vacancy;
}

export async function getVacanciesOnBackend(): Promise<{ vacancies: Entity.Vacancy[] }> {
  const userId = getOrCreateUserId();

  const res = await fetch(`${API_URL}/vacancies?user_id=${userId}`);

  if (!res.ok) {
    throw new Error(`Get vacancies failed (${res.status})`);
  }

  const data = await res.json() as { vacancies: Entity.Vacancy[] };

  return data;
}

export async function updateVacancyOnBackend(
  vacancyId: string,
  payload: {
    title: string;
    company?: string;
    description: string;
    planned_stages: number;
    stages: Entity.VacancyStage[];
  }
): Promise<Entity.Vacancy> {
  const userId = getOrCreateUserId();

  const res = await fetch(`${API_URL}/vacancies/${vacancyId}`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      user_id: userId,
      title: payload.title,
      company: payload.company ?? "",
      description: payload.description,
      planned_stages: payload.planned_stages,
      stages: payload.stages.map((s) => ({
        id: s.id,
        name: s.name,
        status: s.status,
        notes: s.notes,
      })),
    }),
  });

  if (!res.ok) {
    throw new Error(`Save vacancy failed (${res.status})`);
  }

  const vacancy = await res.json() as Entity.Vacancy;

  return vacancy;
}

export async function deleteVacancyOnBackend(vacancyId: string): Promise<void> {
  const userId = getOrCreateUserId();
  const res = await fetch(`${API_URL}/vacancies/${vacancyId}?user_id=${userId}`, {
    method: "DELETE",
  });

  if (!res.ok) {
    throw new Error(`Delete vacancy failed (${res.status})`);
  }
}
