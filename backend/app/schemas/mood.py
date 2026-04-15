from pydantic import BaseModel


class MoodOut(BaseModel):
    id: int
    label: str
    emoji: str
    color: str
    sort_order: int

    model_config = {"from_attributes": True}
