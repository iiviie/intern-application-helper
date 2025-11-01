from sqlalchemy import Column, Integer, String, Text, JSON, DateTime
from sqlalchemy.sql import func
from app.database import Base


class Company(Base):
    """Company model storing company information for personalized applications."""

    __tablename__ = "companies"

    id = Column(Integer, primary_key=True, index=True)

    # Basic Company Information
    name = Column(String(255), nullable=False, index=True)
    founder_name = Column(String(255), nullable=True)
    description = Column(Text, nullable=False)

    # Company Details
    industry = Column(String(255), nullable=True)
    size = Column(String(100), nullable=True)  # e.g., "1-10", "11-50", "51-200", etc.
    website = Column(String(500), nullable=True)
    location = Column(String(255), nullable=True)

    # Culture and Values
    culture_notes = Column(Text, nullable=True)
    values = Column(JSON, default=list, nullable=True)  # ["Innovation", "Diversity", ...]
    tech_stack = Column(JSON, default=list, nullable=True)  # ["Python", "React", ...]

    # Job-Specific Information
    job_role = Column(String(255), nullable=True)
    job_description = Column(Text, nullable=True)
    requirements = Column(JSON, default=list, nullable=True)  # ["Requirement 1", "Requirement 2", ...]

    # Additional Information
    recent_news = Column(Text, nullable=True)  # Recent company news or achievements
    why_interested = Column(Text, nullable=True)  # User's reason for interest in this company
    contact_info = Column(JSON, default=dict, nullable=True)  # {"email": "...", "linkedin": "...", "contact_person": "..."}

    # Timestamps
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Company(id={self.id}, name='{self.name}', industry='{self.industry}')>"
