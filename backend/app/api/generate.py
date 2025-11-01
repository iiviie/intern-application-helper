from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import UserProfile, Company
from app.schemas import (
    GenerationRequest,
    GenerationResponse,
    BulkGenerationRequest,
    BulkGenerationResponse,
)
from app.services.ai_service import ai_service

router = APIRouter()


@router.post("/generate", response_model=GenerationResponse)
async def generate_content(
    request: GenerationRequest,
    db: AsyncSession = Depends(get_db)
):
    """Generate personalized content for a specific company."""
    # Fetch user profile
    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.id == request.user_profile_id)
    )
    profile = profile_result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User profile with ID {request.user_profile_id} not found"
        )

    # Fetch company
    company_result = await db.execute(
        select(Company).where(Company.id == request.company_id)
    )
    company = company_result.scalar_one_or_none()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with ID {request.company_id} not found"
        )

    try:
        # Generate content using AI service
        generated_content = await ai_service.generate_content(
            profile=profile,
            company=company,
            generation_type=request.generation_type,
            tone=request.tone,
            max_length=request.max_length,
            additional_context=request.additional_context,
        )

        return GenerationResponse(
            generated_content=generated_content,
            generation_type=request.generation_type,
            user_profile_id=request.user_profile_id,
            company_id=request.company_id,
            metadata={
                "company_name": company.name,
                "user_name": profile.name,
                "tone": request.tone,
                "max_length": request.max_length,
            }
        )

    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Error generating content: {str(e)}"
        )


@router.post("/generate/bulk", response_model=BulkGenerationResponse)
async def generate_bulk_content(
    request: BulkGenerationRequest,
    db: AsyncSession = Depends(get_db)
):
    """Generate personalized content for multiple companies."""
    # Fetch user profile
    profile_result = await db.execute(
        select(UserProfile).where(UserProfile.id == request.user_profile_id)
    )
    profile = profile_result.scalar_one_or_none()

    if not profile:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"User profile with ID {request.user_profile_id} not found"
        )

    results = []
    failed = []

    for company_id in request.company_ids:
        try:
            # Fetch company
            company_result = await db.execute(
                select(Company).where(Company.id == company_id)
            )
            company = company_result.scalar_one_or_none()

            if not company:
                failed.append({
                    "company_id": company_id,
                    "error": f"Company with ID {company_id} not found"
                })
                continue

            # Generate content
            generated_content = await ai_service.generate_content(
                profile=profile,
                company=company,
                generation_type=request.generation_type,
                tone=request.tone,
                max_length=request.max_length,
                additional_context=request.additional_context,
            )

            results.append(GenerationResponse(
                generated_content=generated_content,
                generation_type=request.generation_type,
                user_profile_id=request.user_profile_id,
                company_id=company_id,
                metadata={
                    "company_name": company.name,
                    "user_name": profile.name,
                    "tone": request.tone,
                    "max_length": request.max_length,
                }
            ))

        except Exception as e:
            failed.append({
                "company_id": company_id,
                "error": str(e)
            })

    return BulkGenerationResponse(
        results=results,
        total_generated=len(results),
        failed=failed
    )


@router.post("/generate/cold-email", response_model=GenerationResponse)
async def generate_cold_email(
    user_profile_id: int,
    company_id: int,
    tone: str = "professional",
    max_length: int = 500,
    additional_context: str | None = None,
    db: AsyncSession = Depends(get_db)
):
    """Shortcut endpoint for generating cold emails."""
    from app.schemas.generation import GenerationType

    request = GenerationRequest(
        user_profile_id=user_profile_id,
        company_id=company_id,
        generation_type=GenerationType.COLD_EMAIL,
        tone=tone,
        max_length=max_length,
        additional_context=additional_context,
    )

    return await generate_content(request, db)


@router.post("/generate/cold-dm", response_model=GenerationResponse)
async def generate_cold_dm(
    user_profile_id: int,
    company_id: int,
    tone: str = "professional",
    max_length: int = 300,
    additional_context: str | None = None,
    db: AsyncSession = Depends(get_db)
):
    """Shortcut endpoint for generating cold DMs."""
    from app.schemas.generation import GenerationType

    request = GenerationRequest(
        user_profile_id=user_profile_id,
        company_id=company_id,
        generation_type=GenerationType.COLD_DM,
        tone=tone,
        max_length=max_length,
        additional_context=additional_context,
    )

    return await generate_content(request, db)


@router.post("/generate/application", response_model=GenerationResponse)
async def generate_application(
    user_profile_id: int,
    company_id: int,
    tone: str = "professional",
    max_length: int = 500,
    additional_context: str | None = None,
    db: AsyncSession = Depends(get_db)
):
    """Shortcut endpoint for generating application responses."""
    from app.schemas.generation import GenerationType

    request = GenerationRequest(
        user_profile_id=user_profile_id,
        company_id=company_id,
        generation_type=GenerationType.APPLICATION,
        tone=tone,
        max_length=max_length,
        additional_context=additional_context,
    )

    return await generate_content(request, db)
