from pydantic import BaseModel, Field, ConfigDict
from datetime import datetime
from enum import Enum


class ExampleType(str, Enum):
    """Types of example content."""
    COLD_EMAIL = "cold_email"
    COLD_DM = "cold_dm"
    APPLICATION = "application"


class ExampleBase(BaseModel):
    """Base schema for Example."""
    generation_type: ExampleType
    content: str = Field(..., min_length=10)
    quality_rating: float = Field(default=5.0, ge=1.0, le=5.0)
    title: str | None = Field(None, max_length=255)
    notes: str | None = None


class ExampleCreate(ExampleBase):
    """Schema for creating a new example."""
    pass


class ExampleUpdate(BaseModel):
    """Schema for updating an example."""
    generation_type: ExampleType | None = None
    content: str | None = None
    quality_rating: float | None = Field(None, ge=1.0, le=5.0)
    title: str | None = None
    notes: str | None = None


class ExampleResponse(ExampleBase):
    """Schema for example response."""
    id: int
    created_at: datetime
    updated_at: datetime | None = None

    model_config = ConfigDict(from_attributes=True)
