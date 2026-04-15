from pydantic import BaseModel


class ActivityItemOut(BaseModel):
    id: int
    label: str
    emoji: str
    user_id: int | None

    model_config = {"from_attributes": True}


class ActivityCategoryOut(BaseModel):
    id: int
    name: str
    items: list[ActivityItemOut] = []

    model_config = {"from_attributes": True}


class ActivityItemCreate(BaseModel):
    category_id: int
    label: str
    emoji: str
