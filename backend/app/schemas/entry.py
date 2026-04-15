from pydantic import BaseModel
from datetime import date, datetime


class PhotoOut(BaseModel):
    id: int
    file_path: str
    created_at: datetime

    model_config = {"from_attributes": True}


class EntryCreate(BaseModel):
    date: date
    mood_id: int | None = None
    note: str | None = None
    activity_ids: list[int] = []


class EntryUpdate(BaseModel):
    mood_id: int | None = None
    note: str | None = None
    activity_ids: list[int] | None = None


class EntryOut(BaseModel):
    id: int
    date: date
    mood_id: int | None
    note: str | None
    activity_ids: list[int] = []
    photos: list[PhotoOut] = []
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
