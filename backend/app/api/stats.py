from fastapi import APIRouter, Depends
from sqlalchemy import extract, func
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.db import get_db
from app.models.activity import ActivityItem
from app.models.entry import Entry, EntryActivity
from app.models.user import User
from app.schemas.stats import ActivityStat, ActivityStatsOut, MoodStat, MoodStatsOut

router = APIRouter(prefix="/stats", tags=["stats"])


@router.get("/moods", response_model=MoodStatsOut)
def mood_stats(
    month: int,
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(Entry.mood_id, func.count(Entry.id).label("cnt"))
        .filter(
            Entry.user_id == current_user.id,
            Entry.mood_id != None,
            extract("month", Entry.date) == month,
            extract("year", Entry.date) == year,
        )
        .group_by(Entry.mood_id)
        .all()
    )
    stats = [MoodStat(mood_id=r.mood_id, count=r.cnt) for r in rows]
    return MoodStatsOut(month=month, year=year, stats=stats)


@router.get("/activities", response_model=ActivityStatsOut)
def activity_stats(
    month: int,
    year: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    rows = (
        db.query(
            EntryActivity.activity_item_id,
            ActivityItem.label,
            ActivityItem.emoji,
            func.count(EntryActivity.entry_id).label("cnt"),
        )
        .join(Entry, Entry.id == EntryActivity.entry_id)
        .join(ActivityItem, ActivityItem.id == EntryActivity.activity_item_id)
        .filter(
            Entry.user_id == current_user.id,
            extract("month", Entry.date) == month,
            extract("year", Entry.date) == year,
        )
        .group_by(EntryActivity.activity_item_id, ActivityItem.label, ActivityItem.emoji)
        .order_by(func.count(EntryActivity.entry_id).desc())
        .all()
    )
    stats = [
        ActivityStat(activity_item_id=r.activity_item_id, label=r.label, emoji=r.emoji, count=r.cnt)
        for r in rows
    ]
    return ActivityStatsOut(month=month, year=year, stats=stats)
