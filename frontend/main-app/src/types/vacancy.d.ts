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
        user_id: string;
        title: string;
        company: string;
        description: string;
        planned_stages: number;
        created_at: string;
        match_score: number;
        advice?: string;
        tech_score?: number;
        seniority_score?: number;
        other_score?: number;
        domain_score?: number;
        aligned_skills?: string[];
        not_aligned_skills?: string[];
        meta_data?: Record<string, unknown>;
        stages?: VacancyStage[];
    };
}