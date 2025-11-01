from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime


class CompanyBase(BaseModel):
    """Base schema for Company."""
    name: str = Field(..., min_length=1, max_length=255)
    founder_name: str | None = None
    description: str = Field(..., min_length=1)
    industry: str | None = None
    size: str | None = None
    website: str | None = None
    location: str | None = None
    culture_notes: str | None = None
    values: list[str] = Field(default_factory=list)
    tech_stack: list[str] = Field(default_factory=list)
    job_role: str | None = None
    job_description: str | None = None
    requirements: list[str] = Field(default_factory=list)
    recent_news: str | None = None
    why_interested: str | None = None
    contact_info: dict = Field(default_factory=dict)


class CompanyCreate(CompanyBase):
    """Schema for creating a new company."""
    pass


class CompanyUpdate(BaseModel):
    """Schema for updating company (all fields optional)."""
    name: str | None = None
    founder_name: str | None = None
    description: str | None = None
    industry: str | None = None
    size: str | None = None
    website: str | None = None
    location: str | None = None
    culture_notes: str | None = None
    values: list[str] | None = None
    tech_stack: list[str] | None = None
    job_role: str | None = None
    job_description: str | None = None
    requirements: list[str] | None = None
    recent_news: str | None = None
    why_interested: str | None = None
    contact_info: dict | None = None


class CompanyResponse(CompanyBase):
    """Schema for company response."""
    id: int
    created_at: datetime
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
