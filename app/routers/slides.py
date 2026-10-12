# app/routers/slides.py
from __future__ import annotations

from typing import List

from fastapi import APIRouter, Depends, HTTPException, Path, Query, Response, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app import models, schemas
from app.database import get_db

router = APIRouter(
    prefix="/presentations/{presentation_id}/slides",
    tags=["slides"],
)

@router.post(
    "/",
    response_model=schemas.SlideRead,
    status_code=status.HTTP_201_CREATED,
)
async def create_slide(
    presentation_id: int = Path(..., gt=0),
    slide: schemas.SlideCreate = ...,
    db: AsyncSession = Depends(get_db),
) -> schemas.SlideRead:
    """Create a new slide inside a presentation."""
    # Verify parent presentation exists
    pres_stmt = select(models.Presentation).where(models.Presentation.id == presentation_id)
    pres_res = await db.execute(pres_stmt)
    if not pres_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Presentation not found")

    db_slide = models.Slide(presentation_id=presentation_id, **slide.model_dump())
    db.add(db_slide)
    try:
        await db.commit()
        await db.refresh(db_slide)
        return db_slide
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.get(
    "/",
    response_model=List[schemas.SlideRead],
    status_code=status.HTTP_200_OK,
)
async def list_slides(
    presentation_id: int = Path(..., gt=0),
    skip: int = Query(0, ge=0),
    limit: int = Query(100, gt=0),
    db: AsyncSession = Depends(get_db),
) -> List[schemas.SlideRead]:
    """List slides for a given presentation with pagination."""
    # Verify presentation exists
    pres_stmt = select(models.Presentation).where(models.Presentation.id == presentation_id)
    pres_res = await db.execute(pres_stmt)
    if not pres_res.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Presentation not found")

    stmt = (
        select(models.Slide)
        .where(models.Slide.presentation_id == presentation_id)
        .order_by(models.Slide.order)
        .offset(skip)
        .limit(limit)
    )
    result = await db.execute(stmt)
    slides = result.scalars().all()
    return slides

@router.get(
    "/{slide_id}",
    response_model=schemas.SlideRead,
    status_code=status.HTTP_200_OK,
)
async def get_slide(
    presentation_id: int = Path(..., gt=0),
    slide_id: int = Path(..., gt=0),
    db: AsyncSession = Depends(get_db),
) -> schemas.SlideRead:
    """Retrieve a single slide."""
    stmt = select(models.Slide).where(
        models.Slide.id == slide_id, models.Slide.presentation_id == presentation_id
    )
    result = await db.execute(stmt)
    slide = result.scalar_one_or_none()
    if not slide:
        raise HTTPException(status_code=404, detail="Slide not found")
    return slide

@router.put(
    "/{slide_id}",
    response_model=schemas.SlideRead,
    status_code=status.HTTP_200_OK,
)
async def update_slide(
    presentation_id: int = Path(..., gt=0),
    slide_id: int = Path(..., gt=0),
    payload: schemas.SlideUpdate = ...,
    db: AsyncSession = Depends(get_db),
) -> schemas.SlideRead:
    """Update an existing slide."""
    stmt = select(models.Slide).where(
        models.Slide.id == slide_id, models.Slide.presentation_id == presentation_id
    )
    result = await db.execute(stmt)
    slide = result.scalar_one_or_none()
    if not slide:
        raise HTTPException(status_code=404, detail="Slide not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(slide, field, value)

    try:
        await db.commit()
        await db.refresh(slide)
        return slide
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))

@router.delete(
    "/{slide_id}",
    status_code=status.HTTP_204_NO_CONTENT,
    response_class=Response,
)
async def delete_slide(
    presentation_id: int = Path(..., gt=0),
    slide_id: int = Path(..., gt=0),
    db: AsyncSession = Depends(get_db),
) -> Response:
    """Delete a slide."""
    stmt = select(models.Slide).where(
        models.Slide.id == slide_id, models.Slide.presentation_id == presentation_id
    )
    result = await db.execute(stmt)
    slide = result.scalar_one_or_none()
    if not slide:
        raise HTTPException(status_code=404, detail="Slide not found")
    try:
        await db.delete(slide)
        await db.commit()
        return Response(status_code=status.HTTP_204_NO_CONTENT)
    except Exception as e:
        await db.rollback()
        raise HTTPException(status_code=500, detail=str(e))