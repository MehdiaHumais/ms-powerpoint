# app/routers/presentations.py
from __future__ import annotations

from datetime import datetime
from typing import List

from fastapi import APIRouter, Depends, HTTPException, Response, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select

from app import models, schemas
from app.database import get_db

router = APIRouter(prefix="/presentations", tags=["presentations"])

@router.post(
    "/",
    response_model=schemas.PresentationRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_presentation(
    payload: schemas.PresentationCreate,
    db: AsyncSession = Depends(get_db),
) -> schemas.PresentationRead:
    """Create a new presentation."""
    try:
        presentation = models.Presentation(**payload.model_dump())
        db.add(presentation)
        await db.commit()
        await db.refresh(presentation)
        await db.refresh(presentation, attribute_names=["slides"])
        return presentation
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )

@router.get(
    "/",
    response_model=List[schemas.PresentationRead],
    status_code=status.HTTP_200_OK,
)
async def list_presentations(db: AsyncSession = Depends(get_db)) -> List[schemas.PresentationRead]:
    """List all presentations with their slides."""
    try:
        result = await db.execute(select(models.Presentation))
        presentations = result.scalars().all()
        # Load slides for each presentation
        for pres in presentations:
            await db.refresh(pres, attribute_names=["slides"])
        return presentations
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )

@router.get(
    "/{presentation_id}",
    response_model=schemas.PresentationRead,
    status_code=status.HTTP_200_OK,
)
async def get_presentation(
    presentation_id: int,
    db: AsyncSession = Depends(get_db),
) -> schemas.PresentationRead:
    """Retrieve a single presentation by ID."""
    try:
        presentation = await db.get(models.Presentation, presentation_id)
        if not presentation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Presentation not found",
            )
        await db.refresh(presentation, attribute_names=["slides"])
        return presentation
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )

@router.put(
    "/{presentation_id}",
    response_model=schemas.PresentationRead,
    status_code=status.HTTP_200_OK,
)
async def update_presentation(
    presentation_id: int,
    payload: schemas.PresentationUpdate,
    db: AsyncSession = Depends(get_db),
) -> schemas.PresentationRead:
    """Update an existing presentation."""
    try:
        presentation = await db.get(models.Presentation, presentation_id)
        if not presentation:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Presentation not found",
            )
        for key, value in payload.model_dump(exclude_unset=True).items():
            setattr(presentation, key, value)
        presentation.updated_at = datetime.utcnow()
        db.add(presentation)
        await db.commit()
        await db.refresh(presentation)
        await db.refresh(presentation, attribute_names=["slides"])
        return presentation
    except HTTPException:
        raise
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )

@router.delete(
    "/{presentation_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def delete_presentation(
    presentation_id: int,
    db: AsyncSession = Depends(get_db),
) -> Response:
    """Delete a presentation and its associated slides."""
    presentation = await db.get(models.Presentation, presentation_id)
    if not presentation:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Presentation not found",
        )
    try:
        await db.delete(presentation)
        await db.commit()
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        await db.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=str(e),
        )