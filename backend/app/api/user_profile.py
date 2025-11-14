from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import UserProfile
from app.schemas import UserProfileCreate, UserProfileUpdate, UserProfileResponse
from app.schemas.resume import ResumeParseRequest, ResumeParseResponse
from app.services.resume_parser import resume_parser

router = APIRouter()


@router.post("/profile", response_model=UserProfileResponse, status_code=status.HTTP_201_CREATED)
async def create_user_profile(
    profile: UserProfileCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new user profile."""
    # Check if profile with this email already exists
    result = await db.execute(select(UserProfile).where(UserProfile.email == profile.email))
    existing_profile = result.scalar_one_or_none()

    if existing_profile:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="A profile with this email already exists"
        )

    # Convert Pydantic model to dict and handle nested models
    profile_data = profile.model_dump()

    # Create new profile
    db_profile = UserProfile(**profile_data)
    db.add(db_profile)
    await db.commit()
    await db.refresh(db_profile)

    return db_profile


@router.get("/profile", response_model=UserProfileResponse)
async def get_user_profile(
    db: AsyncSession = Depends(get_db)
):
    """Get the user profile (assumes single user for now)."""
    result = await db.execute(select(UserProfile).limit(1))
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="No user profile found. Please create one first."
        )

    return profile


@router.get("/profile/{profile_id}", response_model=UserProfileResponse)
async def get_user_profile_by_id(
    profile_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific user profile by ID."""
    result = await db.execute(select(UserProfile).where(UserProfile.id == profile_id))
    profile = result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile with ID {profile_id} not found"
        )

    return profile


@router.put("/profile/{profile_id}", response_model=UserProfileResponse)
async def update_user_profile(
    profile_id: int,
    profile_update: UserProfileUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update an existing user profile."""
    result = await db.execute(select(UserProfile).where(UserProfile.id == profile_id))
    db_profile = result.scalar_one_or_none()

    if not db_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile with ID {profile_id} not found"
        )

    # Update only provided fields
    update_data = profile_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_profile, field, value)

    await db.commit()
    await db.refresh(db_profile)

    return db_profile


@router.post("/profile/parse-resume-text", response_model=ResumeParseResponse)
async def parse_resume_from_text(
    request: ResumeParseRequest,
    db: AsyncSession = Depends(get_db)
):
    """Parse resume from LaTeX or plain text and extract structured data."""
    try:
        parsed_data = await resume_parser.parse_resume(request.resume_text)
        return ResumeParseResponse(
            parsed_data=parsed_data,
            message="Resume parsed successfully"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse resume: {str(e)}"
        )


@router.post("/profile/parse-resume-pdf", response_model=ResumeParseResponse)
async def parse_resume_from_pdf(
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Parse resume from uploaded PDF file and extract structured data."""
    # Validate file type
    if not file.content_type == "application/pdf":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only PDF files are supported"
        )

    try:
        # Read PDF bytes
        pdf_bytes = await file.read()

        # Extract text from PDF
        resume_text = await resume_parser.extract_text_from_pdf(pdf_bytes)

        # Parse the extracted text
        parsed_data = await resume_parser.parse_resume(resume_text)

        return ResumeParseResponse(
            parsed_data=parsed_data,
            message="Resume parsed successfully from PDF"
        )
    except ValueError as e:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to parse PDF resume: {str(e)}"
        )


@router.delete("/profile/{profile_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user_profile(
    profile_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete a user profile."""
    result = await db.execute(select(UserProfile).where(UserProfile.id == profile_id))
    db_profile = result.scalar_one_or_none()

    if not db_profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Profile with ID {profile_id} not found"
        )

    await db.delete(db_profile)
    await db.commit()

    return None
