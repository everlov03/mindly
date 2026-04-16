from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.db import get_db
from app.models.mood import Mood
from app.models.user import User
from app.schemas.mood import MoodOut

router = APIRouter(prefix="/moods", tags=["moods"])


@router.get("", response_model=list[MoodOut])
def get_moods(
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    return db.query(Mood).order_by(Mood.sort_order).all()
