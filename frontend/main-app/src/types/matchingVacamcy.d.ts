namespace Entity {
    type RankedVacancy = Entity.Vacancy & {
        match_score: number;
        completed_stages: number;
        total_stages: number;
        failed_stages: number;
        recommendations: string[];
        why_score: string | null;
        tech_score: number | null;
        years_score: number | null;
        other_score: number | null;
        domain_score: number | null;
        aligned_skills: string[];
        not_aligned_skills: string[];
        summary: string | null;
    };
}