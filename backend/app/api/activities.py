from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.db import get_db
from app.models.activity import ActivityCategory, ActivityItem
from app.models.user import User
from app.schemas.activity import ActivityCategoryOut, ActivityItemCreate, ActivityItemOut

router = APIRouter(prefix="/activities", tags=["activities"])


@router.get("/categories", response_model=list[ActivityCategoryOut])
def get_categories(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    categories = db.query(ActivityCategory).order_by(ActivityCategory.id).all()
    result = []
    for cat in categories:
        items = (
            db.query(ActivityItem)
            .filter(
                ActivityItem.category_id == cat.id,
                (ActivityItem.user_id == None) | (ActivityItem.user_id == current_user.id),
            )
            .all()
        )
        result.append(ActivityCategoryOut(id=cat.id, name=cat.name, items=items))
    return result


@router.post("/custom", response_model=ActivityItemOut, status_code=status.HTTP_201_CREATED)
def create_custom_activity(
    body: ActivityItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    item = ActivityItem(
        category_id=body.category_id,
        user_id=current_user.id,
        label=body.label,
        emoji=body.emoji,
    )
    db.add(item)
    db.commit()
    db.refresh(item)
    return item
