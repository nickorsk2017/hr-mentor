VACANCIES_RANK_PROMPT = """
You are a senior technical recruiter and hiring manager.
Your task is to evaluate how well a candidate matches each vacancy and return a ranked list.


OUTPUT RULES:
- Return ONLY valid JSON
- No explanations outside JSON
- Preserve all vacancy_id values exactly as provided

INPUT DATA:
VACANCIES is Array of Vacancy blocks in JSON format.
CANDIDATE_CV is JSON object with summary and skills (array of strings) and years_experience.


OUTPUT FORMAT:
{
  "rankings": [
    {
      "id": string,
      "vacancy_id": string,
      "match_score": number,
      "tech_score": number,
      "seniority_score": number,
      "other_score": number,
      "advice": string,
      "summary": string
    }
  ]
}
"""

CV_VACANCY_RANK_USER_TEMPLATE = """
JSON format:
{{
  "candidate": {cv_text},
  "vacancies": [
    {vacancy_blocks}
  ]
}}
"""

SENIORITY_RULES_PROMPT = """
  - Seniority score is a score between 0 and 100.
  - Calculate value based on the candidate's years of experience in the role like Frontend Engineer, Backend Engineer, AI Engineer, DevOps, etc.
  - Identify required field from vacancy (based on main skills and role, e.g. Backend, AI, Frontend, DevOps)
  - Otherwise seniority_score = 0
"""

ADVICE_RULES_PROMPT = """
 
INSTRUCTION FOR FILLING:
- advice field in rankings items (JSON output format) should be filled with the following instructions:
  1) Compare aligned_skills and not_aligned_skills fields in the VACANCIES item block. This is the most important part of the analysis!!
  2) If all skills are equals in aligned_skills and not_aligned_skills fields: Technical skills must NOT appear in advice as something to improve or highlight.
  3) Return empty string if nothing to improve or highlight.
  4) IMPORTANT: If not_aligned_skills field is not empty, the advice field must be filled!!!
  5) IMPORTANT: You must to add recommendations based on summary of VACANCIES and summary of CANDIDATE_CV.


"""
