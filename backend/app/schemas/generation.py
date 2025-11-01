from pydantic import BaseModel, Field
from enum import Enum


class GenerationType(str, Enum):
    """Types of content generation."""
    COLD_EMAIL = "cold_email"
    COLD_DM = "cold_dm"
    APPLICATION = "application"


class GenerationRequest(BaseModel):
    """Schema for generation request."""
    user_profile_id: int = Field(..., description="ID of the user profile to use")
    company_id: int = Field(..., description="ID of the company to apply to")
    generation_type: GenerationType = Field(..., description="Type of content to generate")
    additional_context: str | None = Field(None, description="Any additional context or requirements")
    tone: str = Field(default="professional", description="Tone of the message (professional, friendly, enthusiastic, etc.)")
    max_length: int = Field(default=500, description="Maximum length of generated content in words")


class GenerationResponse(BaseModel):
    """Schema for generation response."""
    generated_content: str = Field(..., description="The generated content")
    generation_type: GenerationType
    user_profile_id: int
    company_id: int
    metadata: dict = Field(default_factory=dict, description="Additional metadata about the generation")


class BulkGenerationRequest(BaseModel):
    """Schema for generating content for multiple companies."""
    user_profile_id: int
    company_ids: list[int] = Field(..., min_length=1)
    generation_type: GenerationType
    additional_context: str | None = None
    tone: str = "professional"
    max_length: int = 500


class BulkGenerationResponse(BaseModel):
    """Schema for bulk generation response."""
    results: list[GenerationResponse]
    total_generated: int
    failed: list[dict] = Field(default_factory=list, description="List of failed generations with error details")
