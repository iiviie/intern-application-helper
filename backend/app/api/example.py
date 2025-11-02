from fastapi import APIRouter, Depends, HTTPException, status, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import Example
from app.schemas import ExampleCreate, ExampleUpdate, ExampleResponse

router = APIRouter()


@router.post("/examples", response_model=ExampleResponse, status_code=status.HTTP_201_CREATED)
async def create_example(
    example: ExampleCreate,
    db: AsyncSession = Depends(get_db)
):
    """Create a new example for few-shot learning."""
    example_data = example.model_dump()
    db_example = Example(**example_data)

    db.add(db_example)
    await db.commit()
    await db.refresh(db_example)

    return db_example


@router.get("/examples", response_model=list[ExampleResponse])
async def list_examples(
    generation_type: str | None = Query(None, description="Filter by generation type"),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, ge=1, le=100),
    db: AsyncSession = Depends(get_db)
):
    """List all examples with optional filtering by type."""
    query = select(Example)

    if generation_type:
        query = query.where(Example.generation_type == generation_type)

    query = query.order_by(Example.quality_rating.desc()).offset(skip).limit(limit)

    result = await db.execute(query)
    examples = result.scalars().all()

    return examples


@router.get("/examples/{example_id}", response_model=ExampleResponse)
async def get_example(
    example_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Get a specific example by ID."""
    result = await db.execute(select(Example).where(Example.id == example_id))
    example = result.scalar_one_or_none()

    if not example:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Example with ID {example_id} not found"
        )

    return example


@router.put("/examples/{example_id}", response_model=ExampleResponse)
async def update_example(
    example_id: int,
    example_update: ExampleUpdate,
    db: AsyncSession = Depends(get_db)
):
    """Update an existing example."""
    result = await db.execute(select(Example).where(Example.id == example_id))
    db_example = result.scalar_one_or_none()

    if not db_example:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Example with ID {example_id} not found"
        )

    # Update only provided fields
    update_data = example_update.model_dump(exclude_unset=True)
    for field, value in update_data.items():
        setattr(db_example, field, value)

    await db.commit()
    await db.refresh(db_example)

    return db_example


@router.delete("/examples/{example_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_example(
    example_id: int,
    db: AsyncSession = Depends(get_db)
):
    """Delete an example."""
    result = await db.execute(select(Example).where(Example.id == example_id))
    db_example = result.scalar_one_or_none()

    if not db_example:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail=f"Example with ID {example_id} not found"
        )

    await db.delete(db_example)
    await db.commit()

    return None
