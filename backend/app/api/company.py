from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Company
from app.schemas import CompanyCreate, CompanyUpdate, CompanyResponse

router = APIRouter()


@router.post("/companies", response_model=CompanyResponse, status_code=status.HTTP_201_CREATED)
async def create_company(
    company: CompanyCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new company entry."""
    company_data = company.model_dump()
    db_company = Company(**company_data)

    db.add(db_company)
    await db.commit()
    await db.refresh(db_company)

    return db_company


@router.get("/companies", response_model=list[CompanyResponse])
async def list_companies(
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """List all companies with pagination."""
    result = await db.execute(select(Company).offset(skip).limit(limit))
    companies = result.scalars().all()

    return companies


@router.get("/companies/{company_id}", response_model=CompanyResponse)
async def get_company(
    company_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific company by ID."""
    result = await db.execute(select(Company).where(Company.id == company_id))
    company = result.scalar_one_or_none()

    if not company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with ID {company_id} not found"
        )

    return company


@router.put("/companies/{company_id}", response_model=CompanyResponse)
async def update_company(
    company_id: int,
    company_update: CompanyUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update an existing company."""
    result = await db.execute(select(Company).where(Company.id == company_id))
    db_company = result.scalar_one_or_none()

    if not db_company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with ID {company_id} not found"
        )

    # Update only provided fields
    update_data = company_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_company, field, value)

    await db.commit()
    await db.refresh(db_company)

    return db_company


@router.delete("/companies/{company_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_company(
    company_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete a company."""
    result = await db.execute(select(Company).where(Company.id == company_id))
    db_company = result.scalar_one_or_none()

    if not db_company:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Company with ID {company_id} not found"
        )

    await db.delete(db_company)
    await db.commit()

    return None
