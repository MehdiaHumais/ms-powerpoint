from datetime import datetime
from typing import List, Optional
from sqlmodel import Field, Relationship, SQLModel

class SlideBase(SQLModel):
    title: str = Field(..., max_length=200, description="Slide title")
    content: str = Field(..., description="Slide content (HTML or plain text)")

class Slide(SlideBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    presentation_id: Optional[int] = Field(
        default=None, foreign_key="presentation.id", index=True
    )
    order: int = Field(..., description="Position of the slide within the presentation")
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    presentation: Optional["Presentation"] = Relationship(back_populates="slides")

class PresentationBase(SQLModel):
    title: str = Field(..., max_length=200, description="Presentation title")
    description: Optional[str] = Field(None, description="Optional description")

class Presentation(PresentationBase, table=True):
    id: Optional[int] = Field(default=None, primary_key=True)
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)

    slides: List[Slide] = Relationship(
        back_populates="presentation", sa_relationship_kwargs={"order_by": "Slide.order"}
    )