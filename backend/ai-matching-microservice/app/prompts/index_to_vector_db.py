EXTRACT_JOB_FIELDS = """
- skills (array of technologies)
- seniority (string) // ONLY THIS VALUES: junior/mid/senior/lead
- role (string) // ONLY THIS VALUES: frontend/backend/fullstack/devops/ai/pm/
- is_remote (true/false) // IMPORTANT: if not present, set  value to false
- is_full_time (true/false) // IMPORTANT: if not present, set value to true
- is_part_time (true/false) // IMPORTANT: if not present, set  value to false
- is_contract (true/false) // IMPORTANT: if not present, set  value to false
- location (string)
"""

EXTRACT_JOB_DESCRIPTION_PROMPT = """
Extract structured information from this job description.

Return JSON with the following fields:
{FIELDS}
short_description (string)


short_description should have only description of the job, without any of fields from the JSON.

IMPORTANT:
- ALL FIELDS MUST BE FILLED! RETURN VALID JSON PYTHON!
- LOCATION FIELD MUST BE FILLED WITH FOLLOWING VALUES: "city name" or "remote" or empty string
- IS_FULL_TIME FIELD MUST BE FILLED IF NOT DEFINED, VALUE TO TRUE!
"""