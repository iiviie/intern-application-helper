from sqlalchemy import Column, Integer, String, Text, JSON, DateTime
from sqlalchemy.sql import func
from app.database import Base


class UserProfile(Base):
    """User profile model storing personal information for application generation."""

    __tablename__ = "user_profiles"

    id = Column(Integer, primary_key=True, index=True)

    # Basic Information
    name = Column(String(255), nullable=False)
    email = Column(String(255), unique=True, index=True, nullable=False)
    phone = Column(String(50), nullable=True)
    location = Column(String(255), nullable=True)
    bio = Column(Text, nullable=True)

    # Professional Information (stored as JSON for flexibility)
    skills = Column(JSON, default=list, nullable=True)  # ["Python", "FastAPI", ...]
    experience = Column(JSON, default=list, nullable=True)  # [{"company": "...", "role": "...", "duration": "...", "description": "..."}, ...]
    projects = Column(JSON, default=list, nullable=True)  # [{"name": "...", "description": "...", "tech_stack": [...], "link": "..."}, ...]
    education = Column(JSON, default=list, nullable=True)  # [{"institution": "...", "degree": "...", "year": "...", "gpa": "..."}, ...]

    # Links and Resources
    links = Column(JSON, default=dict, nullable=True)  # {"github": "...", "linkedin": "...", "portfolio": "...", "twitter": "..."}
    resume_url = Column(String(500), nullable=True)

    # Additional Information
    achievements = Column(JSON, default=list, nullable=True)  # ["Achievement 1", "Achievement 2", ...]
    certifications = Column(JSON, default=list, nullable=True)  # [{"name": "...", "issuer": "...", "date": "..."}, ...]
    languages = Column(JSON, default=list, nullable=True)  # ["English", "Spanish", ...]
    interests = Column(Text, nullable=True)

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<UserProfile(id={self.id}, name='{self.name}', email='{self.email}')>"
