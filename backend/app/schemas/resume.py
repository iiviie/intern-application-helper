from pydantic import BaseModel


class ResumeParseRequest(BaseModel):
    """Schema for resume parsing request (text-based)."""
    resume_text: str


class ResumeParseResponse(BaseModel):
    """Schema for resume parsing response."""
    parsed_data: dict
    message: str = "Resume parsed successfully"
