from pydantic import BaseModel, EmailStr, Field, ConfigDict
from datetime import datetime


class ExperienceItem(BaseModel):
    """Schema for a single experience item."""
    company: str
    role: str
    duration: str
    description: str | None = None


class ProjectItem(BaseModel):
    """Schema for a single project item."""
    name: str
    description: str
    tech_stack: list[str] = Field(default_factory=list)
    link: str | None = None


class EducationItem(BaseModel):
    """Schema for a single education item."""
    institution: str
    degree: str
    year: str
    gpa: str | None = None


class CertificationItem(BaseModel):
    """Schema for a single certification item."""
    name: str
    issuer: str
    date: str


class LinksDict(BaseModel):
    """Schema for social and professional links."""
    github: str | None = None
    linkedin: str | None = None
    portfolio: str | None = None
    twitter: str | None = None
    other: dict[str, str] = Field(default_factory=dict)


class UserProfileBase(BaseModel):
    """Base schema for UserProfile."""
    name: str = Field(..., min_length=1, max_length=255)
    email: EmailStr
    phone: str | None = None
    location: str | None = None
    bio: str | None = None
    skills: list[str] = Field(default_factory=list)
    experience: list[ExperienceItem] = Field(default_factory=list)
    projects: list[ProjectItem] = Field(default_factory=list)
    education: list[EducationItem] = Field(default_factory=list)
    links: dict = Field(default_factory=dict)
    resume_url: str | None = None
    achievements: list[str] = Field(default_factory=list)
    certifications: list[CertificationItem] = Field(default_factory=list)
    languages: list[str] = Field(default_factory=list)
    interests: str | None = None


class UserProfileCreate(UserProfileBase):
    """Schema for creating a new user profile."""
    pass


class UserProfileUpdate(BaseModel):
    """Schema for updating user profile (all fields optional)."""
    name: str | None = None
    email: EmailStr | None = None
    phone: str | None = None
    location: str | None = None
    bio: str | None = None
    skills: list[str] | None = None
    experience: list[ExperienceItem] | None = None
    projects: list[ProjectItem] | None = None
    education: list[EducationItem] | None = None
    links: dict | None = None
    resume_url: str | None = None
    achievements: list[str] | None = None
    certifications: list[CertificationItem] | None = None
    languages: list[str] | None = None
    interests: str | None = None


class UserProfileResponse(UserProfileBase):
    """Schema for user profile response."""
    id: int
    created_at: datetime
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
