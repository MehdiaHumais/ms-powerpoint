# app/routers/api_slides.py
from datetime import datetime
from typing import List

from fastapi import APIRouter, status

from .. import schemas

router = APIRouter(prefix="/slides", tags=["slides"])

@router.get("/", response_model=List[schemas.SlideRead], status_code=status.HTTP_200_OK)
async def get_static_slides() -> List[schemas.SlideRead]:
    """
    Return a static list of slides for the demo.
    """
    now = datetime.utcnow()
    return [
        schemas.SlideRead(
            id=1,
            presentation_id=1,
            order=0,
            title="Welcome",
            content="Welcome to the presentation.",
            created_at=now,
            updated_at=now,
        ),
        schemas.SlideRead(
            id=2,
            presentation_id=1,
            order=1,
            title="Agenda",
            content="1. Introduction\n2. Overview\n3. Q&A",
            created_at=now,
            updated_at=now,
        ),
    ]