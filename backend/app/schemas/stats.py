from pydantic import BaseModel


class MoodStat(BaseModel):
    mood_id: int
    count: int


class ActivityStat(BaseModel):
    activity_item_id: int
    label: str
    emoji: str
    count: int


class MoodStatsOut(BaseModel):
    month: int
    year: int
    stats: list[MoodStat]


class ActivityStatsOut(BaseModel):
    month: int
    year: int
    stats: list[ActivityStat]
