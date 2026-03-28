EXTRACT_JOB_FIELDS = """
- title (string) // IMPORTANT: if not present, set value to empty string
- skills (array of technologies)
- seniority (string) // ONLY THIS VALUES: junior/mid/senior/lead
- years_of_experience (string) // IMPORTANT: if not present, set value to empty string
- role (string) // ONLY THIS VALUES: frontend/backend/fullstack/devops/ai/pm/
- is_remote (true/false) // IMPORTANT: if not present, set  value to false
- is_full_time (true/false) // IMPORTANT: if not present, set value to true
- is_part_time (true/false) // IMPORTANT: if not present, set  value to false
- is_contract (true/false) // IMPORTANT: if not present, set  value to false
- salary_range (string) // IMPORTANT: if not present, set value to empty string
- benefits (array of benefits)
- field (string) e.g. healhcare, education, etc. // IMPORTANT: if not present, set value to empty string
- company_size (string) small/medium/large/enterprise // IMPORTANT: if not present, set value to empty string
- company_type (string) // IMPORTANT: if not present, set value as "other"
- company_industry // IMPORTANT: if not present, set value to empty string
- company_location (string) // IMPORTANT: if not present, set value to empty string
- company_website (string) // IMPORTANT: if not present, set value to empty string
- location (string)
- summary (string) // IMPORTANT: IT MUST BE FILLED
"""

EXTRACT_JOB_DESCRIPTION_PROMPT = """
Extract structured information from this job description.

Return JSON with the following fields:
{FIELDS}

IMPORTANT:
- ALL FIELDS MUST BE FILLED! RETURN VALID JSON PYTHON!
- LOCATION FIELD MUST BE FILLED WITH FOLLOWING VALUES: "city name" or "remote" or empty string
- IS_FULL_TIME FIELD MUST BE FILLED IF NOT DEFINED, VALUE TO TRUE!
- SUMMARY MUST DESCRIBE ABOUT COMPANY, TEAM, RESPONSIBILITIES, BENEFITS, APPROACHES, WHAT IS IMPORTANT.
SUMMARY SHOULD BE 5-15 SENTENCES.
- SALARY_RANGE SHOULD BE IN FORMAT "1000-2000" WITHOUT CURRENCY.
- COMPANY_SIZE SHOULD BE IN FORMAT small/medium/large/enterprise.
- COMPANY_TYPE SHOULD BE IN FORMAT "startup" OR "enterprise" OR "government" OR "non-profit" OR "other".
- COMPANY_INDUSTRY SHOULD BE IN FORMAT "Healthcare" OR "Finance" OR "EdTech" OR "FinTech" OR "Crypto" OR "other".
- COMPANY_LOCATION SHOULD BE IN FORMAT "New York" OR "London" OR "Paris" OR "other".
- COMPANY_WEBSITE SHOULD BE IN FORMAT "https://www.company.com" OR "https://company.com
- BENEFITS SHOULD BE ARRAY OF STRINGS.
- COMPANY_TYPE SHOULD BE IN FORMAT "startup" OR "enterprise" OR "government" OR "non-profit" OR "outsourcing" OR "other".
- YEARS_OF_EXPERIENCE SHOULD BE IN FORMAT "0-1" OR "1-3" OR "3-5" OR "5-10" OR "10+".
"""
