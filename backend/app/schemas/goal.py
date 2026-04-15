from pydantic import BaseModel
from datetime import datetime
from typing import Literal


class GoalCreate(BaseModel):
    title: str


class GoalUpdate(BaseModel):
    status: Literal["in_progress", "done", "dropped"]


class GoalOut(BaseModel):
    id: int
    title: str
    status: str
    created_at: datetime
    updated_at: datetime

    model_config = {"from_attributes": True}
