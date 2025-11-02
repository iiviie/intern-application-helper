from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage
from app.config import get_settings
from pypdf import PdfReader
from io import BytesIO
import json
import re

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

        prompt = f"""You are an expert at extracting structured information from resumes, especially LaTeX-formatted resumes.

RESUME TEXT (may contain LaTeX commands):
{resume_text}

IMPORTANT: This resume may contain LaTeX formatting. Ignore all LaTeX commands (like \\textbf, \\underline, \\href, \\section, \\resumeItem, etc.) and extract ONLY the actual content.

LATEX PARSING RULES:
1. **Remove LaTeX commands**: \\textbf{{X}} → X, \\underline{{X}} → X, \\emph{{X}} → X
2. **Extract links**: \\href{{URL}}{{text}} → extract both URL and text
3. **Section headers**: \\section{{X}} → X is a section name
4. **Ignore document structure**: \\begin{{document}}, \\end{{document}}, \\usepackage, etc.
5. **Extract from custom commands**: \\resumeSubheading, \\resumeProjectHeading, \\resumeItem - extract the actual content inside curly braces
6. **Special characters**: Handle \\&, \\%, \\$, etc. properly
7. **Comments**: Ignore lines starting with %

EXTRACTION INSTRUCTIONS:

1. **HEADING / PERSONAL INFORMATION:**
   - Extract name (usually in \\Huge or first prominent text)
   - Extract job title/role (often right after name)
   - Phone: Look for \\faPhone or phone numbers (+91-XXX, etc.)
   - Email: Look for \\faEnvelope or \\href{{mailto:...}}
   - LinkedIn: Look for \\faLinkedin or linkedin.com URLs
   - GitHub: Look for \\faGithub or github.com URLs
   - Location: Extract from address/location fields if present

2. **BIO / PROFESSIONAL SUMMARY:**
   - Create a 1-2 sentence bio based on their current role and experience
   - Example: "Backend Engineer with experience in FastAPI, Django, and cloud infrastructure"
   - Use their job title and top skills to craft this

3. **EXPERIENCE (from "Professional Experience" or "Experience" section):**
   - Extract ALL work experience entries
   - For each job:
     * company: Company name (often in \\resumeSubheading first argument)
     * role: Job title (often third argument in \\resumeSubheading)
     * duration: Date range (like "Sep 2025 -- Oct 2025")
     * description: Combine ALL \\resumeItem bullet points into a single detailed description paragraph
   - Be comprehensive - don't miss any bullet points

4. **PROJECTS (from "Projects" or "Key Projects" section):**
   - Extract ALL project entries
   - For each project:
     * name: Project name (from \\resumeProjectHeading or \\textbf)
     * description: Combine ALL project bullet points into a detailed paragraph
     * tech_stack: Extract technologies from the line with $|$ or "Technologies:" (like "Django, Gemini, AWS, Redis")
     * link: GitHub URL if present (from \\href{{https://github.com/...}})

5. **SKILLS (from "Technical Expertise", "Technical Skills", or "Skills" section):**
   - Extract EVERY skill mentioned
   - Look for categories like:
     * Programming Languages
     * Backend Frameworks
     * Databases
     * Cloud & AWS
     * DevOps & Tools
     * AI/ML Tools
     * API Technologies
   - Flatten all categories into one comprehensive skills array
   - Include programming languages, frameworks, databases, tools, cloud services, everything

6. **EDUCATION:**
   - Extract university/institution name
   - Extract degree (like "Bachelor of Technology, Computer Science")
   - Extract year or date range
   - Extract GPA/CGPA if mentioned (like "8.8/10.0" or "3.8/4.0")

7. **LINKS:**
   - Extract GitHub URL (from \\href or direct URL)
   - Extract LinkedIn URL
   - Extract portfolio URL if present
   - Set twitter to null if not present
   - Put any other URLs in "other" object

8. **ADDITIONAL FIELDS:**
   - achievements: Extract notable achievements, awards, certifications if mentioned
   - certifications: If there's a certifications section, extract each one
   - languages: If spoken languages are mentioned, extract them
   - interests: If hobbies/interests are mentioned, extract them
   - resume_url: Set to null (this will be filled in later)

CRITICAL RULES:
- Be EXTREMELY thorough - extract every single skill, technology, and detail
- When combining bullet points into descriptions, preserve all technical details and metrics
- Keep numbers and percentages (like "10,000+ users", "30% cost reduction", "99.9% uptime")
- Preserve technical terms exactly as written
- For experience/project descriptions: combine all bullet points into a flowing paragraph, don't lose any information
- If a field is not found in the resume, use null (for strings) or [] (for arrays) or {{}} (for objects)

Return ONLY valid JSON in this EXACT format (no markdown, no code blocks):
{{
  "name": "Full Name",
  "email": "email@example.com",
  "phone": "+91-XXXXXXXXXX",
  "location": "City, State/Country",
  "bio": "Current role with X years of experience in Y and Z",
  "skills": ["Python", "Django", "FastAPI", "PostgreSQL", "AWS", "Docker", "Redis", ...],
  "experience": [
    {{
      "company": "Company Name",
      "role": "Job Title",
      "duration": "Month YYYY -- Month YYYY",
      "description": "Detailed paragraph combining all bullet points with metrics and achievements"
    }}
  ],
  "projects": [
    {{
      "name": "Project Name",
      "description": "Detailed paragraph combining all project bullet points",
      "tech_stack": ["Tech1", "Tech2", "Tech3"],
      "link": "https://github.com/username/repo"
    }}
  ],
  "education": [
    {{
      "institution": "University Full Name",
      "degree": "Bachelor of Technology, Computer Science and Engineering",
      "year": "Aug 2023 -- Present",
      "gpa": "8.8/10.0"
    }}
  ],
  "links": {{
    "github": "https://github.com/username",
    "linkedin": "https://linkedin.com/in/username",
    "portfolio": null,
    "twitter": null,
    "other": {{}}
  }},
  "resume_url": null,
  "achievements": [],
  "certifications": [],
  "languages": [],
  "interests": null
}}

CRITICAL OUTPUT FORMATTING:
- Return ONLY the raw JSON object
- DO NOT wrap in markdown code blocks (no ```json, no ```)
- DO NOT add any text before or after the JSON
- DO NOT escape percent signs or dollar signs (use 99.5% not 99.5\\%)
- Start your response with {{ and end with }}
- Valid JSON only - test it in your head before responding

RESPOND WITH ONLY THE JSON OBJECT."""

        messages = [HumanMessage(content=prompt)]
        response = await self.llm.ainvoke(messages)

        # Parse the JSON response
        try:
            # Extract JSON from response (handle markdown code blocks if present)
            response_text = response.content.strip()

            # Remove markdown code blocks if present
            if response_text.startswith("```json"):
                response_text = response_text[7:]  # Remove ```json
            elif response_text.startswith("```"):
                response_text = response_text[3:]  # Remove ```

            if response_text.endswith("```"):
                response_text = response_text[:-3]  # Remove closing ```

            response_text = response_text.strip()

            # Fix common JSON escaping issues from AI responses
            # Replace double backslashes with single backslash (e.g., "99.5\\%" -> "99.5%")
            response_text = re.sub(r'\\\\([%$&])', r'\1', response_text)

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
