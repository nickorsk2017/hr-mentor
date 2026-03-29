namespace Entity {

    type StageStatus = "scheduled" | "done" | "failed";

    type VacancyStage = {
        id: string;
        name: string;
        status: StageStatus;
        notes: string;
    };

    type Vacancy = {
        id: string;
        userId: string;
        title: string;
        company: string;
        description: string;
        planned_stages: number;
        created_at: string;
        match_score: number;
        reason?: string;
        tech_score?: number;
        years_score?: number;
        other_score?: number;
        domain_score?: number;
        aligned_skills?: string[];
        not_aligned_skills?: string[];
        meta_data?: Record<string, unknown>;
        stages?: VacancyStage[];
    };
}