export const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:8004" ;

const USER_ID_KEY = "ai-hr-user-id";
const CV_ID_KEY = "ai-hr-cv-id";

export function getOrCreateUserId(): string {

  const existing = window.localStorage.getItem(USER_ID_KEY);
  if (existing) return existing;

  const created = crypto.randomUUID();
  window.localStorage.setItem(USER_ID_KEY, created);
  return created;
}

export type CVResponse = {
  id: string;
  user_id: string;
  cv_text: string;
  created_at: string;
};

export async function saveCV(cvText: string): Promise<CVResponse> {
  const userId = getOrCreateUserId();
  const res = await fetch(`${API_URL}/cvs`, {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ user_id: userId, cv_text: cvText }),
  });

  if (!res.ok) {
    throw new Error(`Save CV failed (${res.status})`);
  }

  const data = (await res.json()) as CVResponse;
  if (typeof window !== "undefined") {
    window.localStorage.setItem(CV_ID_KEY, data.id);
  }
  return data;
}

export async function getCV(): Promise<CVResponse | null> {
  if (typeof window === "undefined") return null;
  const cvId = window.localStorage.getItem(CV_ID_KEY);
  if (!cvId) return null;

  const res = await fetch(`${API_URL}/cvs/${cvId}`);
  if (res.status === 404) return null;
  if (!res.ok) {
    throw new Error(`Load CV failed (${res.status})`);
  }
  return (await res.json()) as CVResponse;
}

