# app/schemas.py
from datetime import datetime
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator

class SlideCreate(BaseModel):
    title: str = Field(..., max_length=200)
    content: str = Field(..., min_length=1)
    order: int = Field(..., ge=0)  # allow 0 for the first slide

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Slide title cannot be empty")
        return v

class SlideRead(SlideCreate):
    id: int
    presentation_id: int
    order: int
    created_at: datetime
    updated_at: datetime

class SlideUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    content: Optional[str] = Field(None, min_length=1)
    order: Optional[int] = Field(None, ge=0)

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("Slide title cannot be empty")
        return v

class PresentationCreate(BaseModel):
    title: str = Field(..., max_length=200)
    description: Optional[str] = None

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: str) -> str:
        if not v.strip():
            raise ValueError("Presentation title cannot be empty")
        return v

class PresentationRead(PresentationCreate):
    id: int
    created_at: datetime
    updated_at: datetime
    slides: List[SlideRead] = []

class PresentationUpdate(BaseModel):
    title: Optional[str] = Field(None, max_length=200)
    description: Optional[str] = None

    @field_validator("title")
    @classmethod
    def title_not_empty(cls, v: Optional[str]) -> Optional[str]:
        if v is not None and not v.strip():
            raise ValueError("Presentation title cannot be empty")
        return v