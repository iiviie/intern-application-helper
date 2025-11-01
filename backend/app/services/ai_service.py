from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.prompts import ChatPromptTemplate
from langchain.schema import HumanMessage, SystemMessage
from app.config import get_settings
from app.models import UserProfile, Company
from app.schemas.generation import GenerationType

settings = get_settings()


class AIService:
    """Service for AI-powered content generation using LangChain and Gemini."""

    def __init__(self):
        """Initialize the Gemini LLM."""
        self.llm = ChatGoogleGenerativeAI(
            model=settings.gemini_model,
            google_api_key=settings.gemini_api_key,
            temperature=0.7,
            convert_system_message_to_human=True,
        )

    def _format_user_profile(self, profile: UserProfile) -> str:
        """Format user profile into a readable string."""
        profile_parts = [
            f"Name: {profile.name}",
            f"Email: {profile.email}",
        ]

        if profile.location:
            profile_parts.append(f"Location: {profile.location}")

        if profile.bio:
            profile_parts.append(f"Bio: {profile.bio}")

        if profile.skills:
            profile_parts.append(f"Skills: {', '.join(profile.skills)}")

        if profile.experience:
            exp_list = []
            for exp in profile.experience:
                exp_str = f"- {exp.get('role', '')} at {exp.get('company', '')} ({exp.get('duration', '')})"
                if exp.get('description'):
                    exp_str += f": {exp.get('description')}"
                exp_list.append(exp_str)
            profile_parts.append(f"Experience:\n" + "\n".join(exp_list))

        if profile.projects:
            proj_list = []
            for proj in profile.projects:
                proj_str = f"- {proj.get('name', '')}: {proj.get('description', '')}"
                if proj.get('tech_stack'):
                    proj_str += f" (Tech: {', '.join(proj.get('tech_stack', []))})"
                proj_list.append(proj_str)
            profile_parts.append(f"Projects:\n" + "\n".join(proj_list))

        if profile.education:
            edu_list = []
            for edu in profile.education:
                edu_str = f"- {edu.get('degree', '')} from {edu.get('institution', '')} ({edu.get('year', '')})"
                edu_list.append(edu_str)
            profile_parts.append(f"Education:\n" + "\n".join(edu_list))

        if profile.achievements:
            profile_parts.append(f"Achievements: {', '.join(profile.achievements)}")

        if profile.links:
            links_list = [f"{key}: {value}" for key, value in profile.links.items() if value]
            if links_list:
                profile_parts.append(f"Links:\n" + "\n".join([f"- {link}" for link in links_list]))

        return "\n\n".join(profile_parts)

    def _format_company_info(self, company: Company) -> str:
        """Format company information into a readable string."""
        company_parts = [
            f"Company Name: {company.name}",
        ]

        if company.founder_name:
            company_parts.append(f"Founder: {company.founder_name}")

        company_parts.append(f"Description: {company.description}")

        if company.industry:
            company_parts.append(f"Industry: {company.industry}")

        if company.size:
            company_parts.append(f"Company Size: {company.size}")

        if company.location:
            company_parts.append(f"Location: {company.location}")

        if company.values:
            company_parts.append(f"Company Values: {', '.join(company.values)}")

        if company.tech_stack:
            company_parts.append(f"Tech Stack: {', '.join(company.tech_stack)}")

        if company.job_role:
            company_parts.append(f"Job Role: {company.job_role}")

        if company.job_description:
            company_parts.append(f"Job Description: {company.job_description}")

        if company.requirements:
            company_parts.append(f"Requirements:\n" + "\n".join([f"- {req}" for req in company.requirements]))

        if company.culture_notes:
            company_parts.append(f"Culture Notes: {company.culture_notes}")

        if company.recent_news:
            company_parts.append(f"Recent News: {company.recent_news}")

        return "\n\n".join(company_parts)

    async def generate_cold_email(
        self,
        profile: UserProfile,
        company: Company,
        tone: str = "professional",
        max_length: int = 500,
        additional_context: str | None = None
    ) -> str:
        """Generate a personalized cold email."""
        user_info = self._format_user_profile(profile)
        company_info = self._format_company_info(company)

        prompt = f"""You are an expert at writing compelling cold emails for internship/job applications.

USER PROFILE:
{user_info}

COMPANY INFORMATION:
{company_info}

{f'ADDITIONAL CONTEXT: {additional_context}' if additional_context else ''}

Write a personalized cold email for an internship/job application to {company.name}.

Requirements:
- Tone: {tone}
- Maximum length: {max_length} words
- Make it highly personalized based on the user's profile and company information
- Highlight relevant skills, projects, and experiences that align with the company's needs
- Show genuine interest in the company and explain why the user is a good fit
- Include a clear call-to-action
- Keep it concise and engaging
- Use a professional email format with subject line
- DO NOT include placeholder text like [Your Name] - use the actual information provided

Generate ONLY the email content (including subject line). Do not add any explanations or metadata."""

        messages = [HumanMessage(content=prompt)]
        response = await self.llm.ainvoke(messages)

        return response.content

    async def generate_cold_dm(
        self,
        profile: UserProfile,
        company: Company,
        tone: str = "professional",
        max_length: int = 300,
        additional_context: str | None = None
    ) -> str:
        """Generate a personalized cold DM (for LinkedIn, Twitter, etc.)."""
        user_info = self._format_user_profile(profile)
        company_info = self._format_company_info(company)

        prompt = f"""You are an expert at writing compelling direct messages for professional networking.

USER PROFILE:
{user_info}

COMPANY INFORMATION:
{company_info}

{f'ADDITIONAL CONTEXT: {additional_context}' if additional_context else ''}

Write a personalized direct message (DM) for reaching out to someone at {company.name} about internship/job opportunities.

Requirements:
- Tone: {tone}
- Maximum length: {max_length} words
- Make it highly personalized and conversational
- Keep it brief and to the point (suitable for LinkedIn, Twitter, etc.)
- Highlight the most relevant accomplishment or skill
- Show genuine interest in the company
- End with a clear, specific ask
- DO NOT include placeholder text - use the actual information provided
- Keep it casual yet professional

Generate ONLY the DM content. Do not add any explanations or metadata."""

        messages = [HumanMessage(content=prompt)]
        response = await self.llm.ainvoke(messages)

        return response.content

    async def generate_application(
        self,
        profile: UserProfile,
        company: Company,
        tone: str = "professional",
        max_length: int = 500,
        additional_context: str | None = None
    ) -> str:
        """Generate a personalized application response/cover letter."""
        user_info = self._format_user_profile(profile)
        company_info = self._format_company_info(company)

        prompt = f"""You are an expert at writing compelling cover letters and application responses for internships/jobs.

USER PROFILE:
{user_info}

COMPANY INFORMATION:
{company_info}

{f'ADDITIONAL CONTEXT: {additional_context}' if additional_context else ''}

Write a personalized cover letter or application response for applying to {company.name}{f" for the role of {company.job_role}" if company.job_role else ""}.

Requirements:
- Tone: {tone}
- Maximum length: {max_length} words
- Make it highly personalized based on the user's profile and company information
- Address specific requirements or skills mentioned in the job description
- Demonstrate understanding of the company's mission, values, and culture
- Highlight relevant projects, experiences, and achievements
- Show enthusiasm and genuine interest
- Explain why the user is a great fit for the role and company
- Keep it well-structured with clear paragraphs
- DO NOT include placeholder text - use the actual information provided

Generate ONLY the cover letter/application content. Do not add any explanations or metadata."""

        messages = [HumanMessage(content=prompt)]
        response = await self.llm.ainvoke(messages)

        return response.content

    async def generate_content(
        self,
        profile: UserProfile,
        company: Company,
        generation_type: GenerationType,
        tone: str = "professional",
        max_length: int = 500,
        additional_context: str | None = None
    ) -> str:
        """Generate content based on the specified type."""
        if generation_type == GenerationType.COLD_EMAIL:
            return await self.generate_cold_email(profile, company, tone, max_length, additional_context)
        elif generation_type == GenerationType.COLD_DM:
            return await self.generate_cold_dm(profile, company, tone, max_length, additional_context)
        elif generation_type == GenerationType.APPLICATION:
            return await self.generate_application(profile, company, tone, max_length, additional_context)
        else:
            raise ValueError(f"Unknown generation type: {generation_type}")


# Singleton instance
ai_service = AIService()
