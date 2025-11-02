from sqlalchemy import Column, Integer, String, Text, Float, DateTime, Enum as SQLEnum
from sqlalchemy.sql import func
from app.database import Base
import enum


class ExampleType(str, enum.Enum):
    """Types of example content."""
    COLD_EMAIL = "cold_email"
    COLD_DM = "cold_dm"
    APPLICATION = "application"


class Example(Base):
    """Example content model for few-shot learning."""

    __tablename__ = "examples"

    id = Column(Integer, primary_key=True, index=True)

    # Type of example
    generation_type = Column(SQLEnum(ExampleType), nullable=False, index=True)

    # The actual example content
    content = Column(Text, nullable=False)

    # Quality rating (1-5) - higher is better
    quality_rating = Column(Float, default=5.0, nullable=False)

    # Title/description of the example
    title = Column(String(255), nullable=True)

    # Why this example is good / what makes it effective
    notes = Column(Text, nullable=True)

    # Metadata
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    def __repr__(self):
        return f"<Example(id={self.id}, type='{self.generation_type}', rating={self.quality_rating})>"
