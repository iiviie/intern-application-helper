from langchain_google_genai import ChatGoogleGenerativeAI
from langchain.schema import HumanMessage
from app.config import get_settings
from app.models import UserProfile, Company
from app.schemas.generation import GenerationType
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models.example import Example

settings = get_settings()


class AIService:
    """Service for AI-powered content generation using LangChain and Gemini."""

    def __init__(self):
        """Initialize the Gemini LLM."""
        self.llm = ChatGoogleGenerativeAI(
            model=settings.gemini_model,
            google_api_key=settings.gemini_api_key,
            temperature=0.8,  # Higher for more creative, varied output
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
            profile_parts.append(f"About: {profile.bio}")

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
                if proj.get('link'):
                    proj_str += f" - {proj.get('link')}"
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
            f"Company: {company.name}",
        ]

        if company.founder_name:
            company_parts.append(f"Founded by: {company.founder_name}")

        company_parts.append(f"What they do: {company.description}")

        if company.industry:
            company_parts.append(f"Industry: {company.industry}")

        if company.size:
            company_parts.append(f"Size: {company.size}")

        if company.location:
            company_parts.append(f"Location: {company.location}")

        if company.values:
            company_parts.append(f"Company Values: {', '.join(company.values)}")

        if company.tech_stack:
            company_parts.append(f"Tech Stack: {', '.join(company.tech_stack)}")

        if company.job_role:
            company_parts.append(f"Role you're applying for: {company.job_role}")

        if company.job_description:
            company_parts.append(f"Role Description: {company.job_description}")

        if company.requirements:
            company_parts.append(f"Requirements:\n" + "\n".join([f"- {req}" for req in company.requirements]))

        if company.culture_notes:
            company_parts.append(f"Culture Notes: {company.culture_notes}")

        if company.recent_news:
            company_parts.append(f"Recent News: {company.recent_news}")

        return "\n\n".join(company_parts)

    async def _get_examples(self, db: AsyncSession, generation_type: GenerationType, limit: int = 3) -> list[str]:
        """Fetch high-quality examples for few-shot learning."""
        result = await db.execute(
            select(Example)
            .where(Example.generation_type == generation_type.value)
            .order_by(Example.quality_rating.desc())
            .limit(limit)
        )
        examples = result.scalars().all()
        return [ex.content for ex in examples]

    async def _generate_chain_of_thought(
        self,
        profile: UserProfile,
        company: Company,
        generation_type: GenerationType,
        tone: str,
        max_length: int,
    ) -> str:
        """Stage 1: Generate a plan/outline using chain-of-thought reasoning."""
        user_info = self._format_user_profile(profile)
        company_info = self._format_company_info(company)

        content_type_name = {
            GenerationType.COLD_EMAIL: "cold email",
            GenerationType.COLD_DM: "direct message",
            GenerationType.APPLICATION: "cover letter",
        }.get(generation_type, "message")

        prompt = f"""You are helping someone apply for a role at {company.name}.

Here's what you know about the applicant:
{user_info}

Here's what you know about the company:
{company_info}

Your task: Analyze this information and create a strategic plan for writing a compelling {content_type_name}.

Think step-by-step:
1. What are the 2-3 strongest connections between the applicant's background and this company/role?
2. What specific projects, experiences, or skills should be highlighted?
3. What tone and approach would work best? (Target: {tone})
4. What's a natural, non-cliché opening line?
5. What's the key message to convey?

Provide a brief strategic outline (3-5 bullet points) that will guide the writing. Be specific about what to mention and why it matters.

Keep it concise - this is just a plan, not the actual {content_type_name}."""

        messages = [HumanMessage(content=prompt)]
        response = await self.llm.ainvoke(messages)
        return response.content

    async def _generate_with_plan(
        self,
        profile: UserProfile,
        company: Company,
        plan: str,
        generation_type: GenerationType,
        tone: str,
        max_length: int,
        examples: list[str] = None,
        additional_context: str | None = None,
    ) -> str:
        """Stage 2: Generate content following the plan."""
        user_info = self._format_user_profile(profile)
        company_info = self._format_company_info(company)

        content_type_instructions = self._get_content_type_instructions(generation_type)

        examples_section = ""
        if examples:
            examples_section = "\n\nHere are some examples of excellent " + content_type_instructions["type_name"] + "s:\n\n"
            for i, example in enumerate(examples, 1):
                examples_section += f"Example {i}:\n{example}\n\n"
            examples_section += "Notice how these are natural, specific, and show genuine interest. Use a similar style.\n"

        additional_section = f"\n\nAdditional context to incorporate: {additional_context}\n" if additional_context else ""

        prompt = f"""You're writing a {tone} {content_type_instructions['type_name']} to {company.name}.

APPLICANT INFO:
{user_info}

COMPANY INFO:
{company_info}

STRATEGIC PLAN (follow this):
{plan}
{additional_section}{examples_section}

{content_type_instructions['instructions']}

CRITICAL - WRITE LIKE A HUMAN, NOT AN AI:

NATURAL FLOW & RHYTHM:
- Vary sentence length dramatically - alternate between short punchy sentences and longer flowing ones
- Write like you're speaking to a friend who works there - natural conversational rhythm
- Don't make sentences symmetrical or balanced - humans don't think that way
- Some sentences should be choppy. Others should flow with multiple clauses and thoughts.

HUMAN LANGUAGE PATTERNS:
- USE CONTRACTIONS: I've, it's, couldn't, I'd, there's, you're (AI avoids these - you must use them)
- Use informal but confident words: "super impressive," "really excites me," "quite a bit," "a little over [time period]"
- Be naturally imprecise sometimes: "around," "about," "quite," "pretty," "a bit"
- Use colloquial transitions: "Recently," "I'd love to," "Any chance we could," "Been following"
- AVOID formal transitions: "Additionally," "Moreover," "Furthermore," "In conclusion"

WHAT TO AVOID (DEAD GIVEAWAYS OF AI):
- "I am writing to express my interest" - NEVER say this
- "I am passionate about" - sounds robotic
- "Looking forward to hearing from you" - too formal
- Perfect symmetry in phrases - humans don't balance clauses neatly
- Buzzwords: "robust," "innovative," "cutting-edge," "end-to-end," "scalable solutions," "leverage"
- Over-engineering emotion: "extremely excited," "deeply passionate" - just say "really excites me"
- Starting with "Dear [title]" - use "Hey" or the person's name

SOUND AUTHENTIC:
- Show personal ownership: "I've been working on" not "I worked on"
- Be specific but not grandiose: "built a FastAPI setup that handled a big jump in requests" NOT "developed scalable, high-performance systems"
- Express genuine emotion simply: "This really excites me" not "I am tremendously enthusiastic"
- Use direct address: "Any chance we could hop on a quick call?" not "I would welcome the opportunity to discuss"
- Ground in lived experience with concrete examples, not abstract descriptions

IMPERFECTION IS HUMAN:
- Don't over-edit for perfection - write like you thought it through once and sent it
- Natural punctuation - commas where you'd pause when speaking
- Slightly casual but still professional - like an email to a senior colleague
- Minor hedging is okay: "I think," "probably," "seems like"

CONTENT RULES:
- Around {max_length} words (not exactly, vary it naturally)
- Be {tone} but never force it - let it come through naturally
- Use actual names, projects, and details from the profile
- Make it clear you actually looked at what they're building
- End with a specific, casual ask - not a formal closing

Write it now - don't overthink it, write like a human would:"""

        messages = [HumanMessage(content=prompt)]
        response = await self.llm.ainvoke(messages)
        return response.content

    def _get_content_type_instructions(self, generation_type: GenerationType) -> dict:
        """Get specific instructions for each content type."""

        if generation_type == GenerationType.COLD_EMAIL:
            return {
                "type_name": "cold email",
                "instructions": """Write a cold email that reads like someone genuinely reaching out - not a template.

OPENING:
- Start with "Hey [name]" or just their name, not "Dear"
- First line should reference something specific about what they're building
- Show you actually looked at their work - mention a specific feature, product, or recent news

BODY (keep it natural and varied):
- Mix short and long sentences - don't make them all the same length
- Drop in a concrete example: "Recently built X that did Y" not "I have experience with X"
- Use contractions: "I've been following," "I'd love to," "It's really cool"
- Be casually specific: "Been working with FastAPI for a little over two years now"
- Show genuine interest without buzzwords: "This really excites me" not "I am passionate about leveraging"
- No perfectly balanced phrases - write like you're thinking it through

CONCRETE EXAMPLE:
- Give ONE specific project that's relevant
- Describe what it actually did, not what skills you used
- Be humble but confident: "no small feat" or "turned out pretty well"

CLOSING:
- Skip "Looking forward to hearing from you" - too formal
- Direct ask: "Any chance we could hop on a quick call?" or "Would love to chat about this"
- Sign off casually: "Thanks!" or "Cheers," not "Sincerely," or "Best regards,"

Keep it under 150 words if you can. Short paragraphs. Natural rhythm. Write it like you'd actually send it."""
            }

        elif generation_type == GenerationType.COLD_DM:
            return {
                "type_name": "direct message",
                "instructions": """Write a super short DM that sounds like a real person sliding into their DMs.

STRUCTURE (keep it tight):
- Start casual: "Hey!" or "Hey [name],"
- ONE sentence intro: "I'm a backend dev who's been working with [tech]"
- ONE sentence on why you're reaching out - be specific about what caught your eye
- ONE concrete example that's relevant: "Recently built X that handled Y"
- Direct ask: "Any chance we could chat for 15 min?" or "Would you be up for a quick call?"

VIBE:
- Use contractions: "I've been," "I'd love," "It's"
- Be casual but respectful: "Really cool what you're building"
- Keep it under 100 words - DMs should be quick
- No buzzwords or formal language
- Write like you're messaging someone you met at a conference

Example good opener: "Hey! Been following what kapa.ai's doing with knowledge bases — turning them into AI assistants people can actually use is super impressive."

Not this: "I hope this message finds you well. I am writing to express my interest..."

Keep it punchy and human."""
            }

        else:  # APPLICATION
            return {
                "type_name": "cover letter",
                "instructions": """Write a cover letter that actually sounds like a human wrote it, not an AI or template.

OPENING:
- Skip "I am writing to apply for" - start with what you know about them
- Reference something specific: their product, a recent launch, their tech stack, their mission
- Show you've actually looked at what they're building

BODY (2-3 short paragraphs):
- Vary sentence length - mix short punchy ones with longer thoughts
- Use contractions: "I've been," "it's," "I'd"
- Give concrete examples with natural language: "Built a FastAPI setup that handled a pretty big jump in requests" not "Developed scalable microservices architecture"
- Be specific about what you actually did, not the buzzwords
- Show genuine interest without sounding over-eager: "This really excites me" not "I am deeply passionate"
- Use casual but confident language: "Been working with Python for about two years" or "Recently built X"
- Mention actual numbers or specifics: "handled 10k requests," "reduced latency by quite a bit"

WHAT YOU'D BRING:
- Be specific, not generic: Give an example of what you could help with
- Avoid: "I'm a team player," "I'm detail-oriented," "I thrive in fast-paced environments"
- Instead: "I could probably help with [specific thing based on their stack]" or "I've dealt with similar challenges around [specific technical thing]"

CLOSING:
- Skip "I look forward to the opportunity to discuss"
- Be direct: "Would love to chat about this" or "Any chance we could talk more about the role?"
- Sign off naturally: "Thanks for reading!" or "Cheers," not "Sincerely," or "Best regards,"

Write like you're emailing someone you respect but know casually. Natural. Specific. Human."""
            }

    async def generate_content(
        self,
        profile: UserProfile,
        company: Company,
        generation_type: GenerationType,
        tone: str = "professional",
        max_length: int = 500,
        additional_context: str | None = None,
        use_chain_of_thought: bool = True,
        use_examples: bool = True,
        db: AsyncSession | None = None,
    ) -> tuple[str, str | None]:
        """
        Generate content with optional chain-of-thought and few-shot learning.

        Returns: (generated_content, chain_of_thought_plan)
        """
        chain_of_thought = None
        examples = []

        # Fetch examples if requested
        if use_examples and db:
            examples = await self._get_examples(db, generation_type, limit=3)

        # Use 2-stage generation if requested
        if use_chain_of_thought:
            # Stage 1: Planning
            chain_of_thought = await self._generate_chain_of_thought(
                profile, company, generation_type, tone, max_length
            )

            # Stage 2: Generation with plan
            content = await self._generate_with_plan(
                profile, company, chain_of_thought, generation_type,
                tone, max_length, examples, additional_context
            )
        else:
            # Single-stage generation (faster, lower quality)
            content = await self._generate_with_plan(
                profile, company, "Write based on the information provided.",
                generation_type, tone, max_length, examples, additional_context
            )

        return content, chain_of_thought


# Singleton instance
ai_service = AIService()
