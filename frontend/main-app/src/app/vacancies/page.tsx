import { VacanciesPage } from "@/components/features/vacancies/VacanciesPage";

// SSR wrapper only: route remains a server component.
export default function Page() {
  return <VacanciesPage />;
}

