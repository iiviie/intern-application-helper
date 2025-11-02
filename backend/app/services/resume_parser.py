from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage
from app.config import get_settings
from pypdf import PdfReader
from io import BytesIO
import json

settings = get_settings()


class ResumeParser:
    """Service for parsing resumes (PDF or LaTeX) and extracting structured data."""

    def __init__(self):
        """Initialize the Gemini LLM for parsing."""
        self.llm = ChatGoogleGenerativeAI(
            model=settings.gemini_model,
            google_api_key=settings.gemini_api_key,
            temperature=0.1,  # Low temperature for accurate extraction
            convert_system_message_to_human=True,
        )

    async def extract_text_from_pdf(self, pdf_bytes: bytes) -> str:
        """Extract text from PDF bytes."""
        try:
            pdf_file = BytesIO(pdf_bytes)
            reader = PdfReader(pdf_file)

            text = ""
            for page in reader.pages:
                text += page.extract_text() + "\n"

            return text.strip()
        except Exception as e:
            raise ValueError(f"Failed to extract text from PDF: {str(e)}")

    async def parse_resume(self, resume_text: str) -> dict:
        """
        Parse resume text (from PDF or LaTeX) and extract structured information.

        Returns a dictionary matching the UserProfileCreate schema.
        """

        prompt = f"""You are an expert at extracting structured information from resumes.

Given the resume text below, extract ALL relevant information and return it as valid JSON.

RESUME TEXT:
{resume_text}

Extract the following information:

1. **Personal Information:**
   - name (full name)
   - email
   - phone (if available)
   - location (city, state/country)

2. **Professional Summary:**
   - bio (a brief 1-2 sentence summary of their background)

3. **Skills:**
   - skills (array of technical skills, programming languages, frameworks, tools)

4. **Work Experience:**
   - experience (array of objects with: company, role, duration, description)
   - Format: [{{"company": "X", "role": "Y", "duration": "Z", "description": "..."}}]

5. **Projects:**
   - projects (array of objects with: name, description, tech_stack, link)
   - Format: [{{"name": "X", "description": "Y", "tech_stack": ["A", "B"], "link": "URL"}}]

6. **Education:**
   - education (array of objects with: institution, degree, year, gpa)
   - Format: [{{"institution": "X", "degree": "Y", "year": "Z", "gpa": "3.8"}}]

7. **Additional Information:**
   - achievements (array of notable achievements, awards, certifications)
   - certifications (array of objects with: name, issuer, date)
   - languages (array of spoken languages)
   - interests (brief text about interests/hobbies)

8. **Links:**
   - links (object with: github, linkedin, portfolio, twitter, other)
   - Format: {{"github": "URL", "linkedin": "URL", ...}}

IMPORTANT EXTRACTION RULES:
- Extract ALL information available in the resume
- For skills, be comprehensive - include programming languages, frameworks, tools, technologies
- For experience and projects, extract as much detail as possible
- If a field is not found, use null or empty array/object
- Be thorough - don't skip anything
- Format all dates consistently
- Extract URLs for links (GitHub, LinkedIn, portfolio, etc.)
- For tech_stack in projects, list all technologies mentioned

Return ONLY valid JSON in this exact format:
{{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "+1234567890",
  "location": "City, State",
  "bio": "Brief professional summary",
  "skills": ["Python", "FastAPI", ...],
  "experience": [
    {{
      "company": "Company Name",
      "role": "Job Title",
      "duration": "Jan 2022 - Present",
      "description": "What they did in this role"
    }}
  ],
  "projects": [
    {{
      "name": "Project Name",
      "description": "What the project does",
      "tech_stack": ["Python", "React"],
      "link": "https://github.com/..."
    }}
  ],
  "education": [
    {{
      "institution": "University Name",
      "degree": "Bachelor of Science in Computer Science",
      "year": "2024",
      "gpa": "3.8"
    }}
  ],
  "links": {{
    "github": "https://github.com/username",
    "linkedin": "https://linkedin.com/in/username",
    "portfolio": "https://example.com",
    "twitter": null,
    "other": {{}}
  }},
  "resume_url": null,
  "achievements": ["Achievement 1", "Achievement 2"],
  "certifications": [
    {{
      "name": "AWS Certified Developer",
      "issuer": "Amazon",
      "date": "2023"
    }}
  ],
  "languages": ["English", "Spanish"],
  "interests": "Brief description of interests"
}}

Return ONLY the JSON, nothing else."""

        messages = [HumanMessage(content=prompt)]
        response = await self.llm.ainvoke(messages)

        # Parse the JSON response
        try:
            # Extract JSON from response (handle markdown code blocks if present)
            response_text = response.content.strip()

            # Remove markdown code blocks if present
            if response_text.startswith("```json"):
                response_text = response_text[7:]  # Remove ```json
            if response_text.startswith("```"):
                response_text = response_text[3:]  # Remove ```
            if response_text.endswith("```"):
                response_text = response_text[:-3]  # Remove closing ```

            response_text = response_text.strip()

            parsed_data = json.loads(response_text)

            # Validate and clean the data
            return self._validate_and_clean_data(parsed_data)

        except json.JSONDecodeError as e:
            raise ValueError(f"Failed to parse AI response as JSON: {str(e)}\nResponse: {response.content}")

    def _validate_and_clean_data(self, data: dict) -> dict:
        """Validate and clean the parsed data."""

        # Ensure required fields exist
        if not data.get('name') or not data.get('email'):
            raise ValueError("Resume must contain at least name and email")

        # Set defaults for optional fields
        defaults = {
            'phone': None,
            'location': None,
            'bio': None,
            'skills': [],
            'experience': [],
            'projects': [],
            'education': [],
            'links': {},
            'resume_url': None,
            'achievements': [],
            'certifications': [],
            'languages': [],
            'interests': None,
        }

        # Merge with defaults
        for key, default_value in defaults.items():
            if key not in data or data[key] is None:
                data[key] = default_value

        # Clean up empty strings
        for key in ['phone', 'location', 'bio', 'interests']:
            if isinstance(data.get(key), str) and not data[key].strip():
                data[key] = None

        return data


# Singleton instance
resume_parser = ResumeParser()
