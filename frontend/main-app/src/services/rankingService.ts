import { getOrCreateUserId } from "./cvService";

export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8001" ;

export async function getRenkingVacancies(): Promise<Entity.RankedVacancy[]> {
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

  const data = (await res.json()) as { vacancies: Entity.RankedVacancy[] };
  return data.vacancies ?? []
}
