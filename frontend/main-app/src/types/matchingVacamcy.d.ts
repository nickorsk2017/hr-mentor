namespace Entity {
    type RankedVacancy = Entity.Vacancy & {
        fitScore: number;
        completedStages: number;
        totalStages: number;
        failedStages: number;
        recommendations: string[];
        whyScore: string | null;
        techScore: number | null;
        yearsScore: number | null;
        otherScore: number | null;
        domainScore: number | null;
        alignedSkills: string[];
        notAlignedSkills: string[];
    };
}