import os
import uuid
from datetime import date

from fastapi import APIRouter, Depends, HTTPException, UploadFile, File, status
from sqlalchemy.orm import Session

from app.api.deps import get_current_user
from app.core.config import settings
from app.core.db import get_db
from app.models.entry import Entry, EntryActivity, EntryPhoto
from app.models.user import User
from app.schemas.entry import EntryCreate, EntryOut, EntryUpdate, PhotoOut

router = APIRouter(prefix="/entries", tags=["entries"])


def _entry_to_out(entry: Entry) -> EntryOut:
    return EntryOut(
        id=entry.id,
        date=entry.date,
        mood_id=entry.mood_id,
        note=entry.note,
        activity_ids=[ea.activity_item_id for ea in entry.activities],
        photos=[PhotoOut.model_validate(p) for p in entry.photos],
        created_at=entry.created_at,
        updated_at=entry.updated_at,
    )


def _load_entry(entry: Entry, db: Session) -> Entry:
    from sqlalchemy.orm import joinedload
    return (
        db.query(Entry)
        .filter(Entry.id == entry.id)
        .options(joinedload(Entry.activities), joinedload(Entry.photos))
        .first()
    )


@router.get("", response_model=list[EntryOut])
def list_entries(
    month: int | None = None,
    year: int | None = None,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    q = db.query(Entry).filter(Entry.user_id == current_user.id)
    if month and year:
        from sqlalchemy import extract
        q = q.filter(
            extract("month", Entry.date) == month,
            extract("year", Entry.date) == year,
        )
    entries = q.order_by(Entry.date.desc()).all()
    result = []
    for e in entries:
        loaded = _load_entry(e, db)
        result.append(_entry_to_out(loaded))
    return result


@router.post("", response_model=EntryOut, status_code=status.HTTP_201_CREATED)
def create_entry(
    body: EntryCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.query(Entry).filter(
        Entry.user_id == current_user.id, Entry.date == body.date
    ).first()
    if existing:
        raise HTTPException(status_code=409, detail="Entry for this date already exists")
    entry = Entry(
        user_id=current_user.id,
        date=body.date,
        mood_id=body.mood_id,
        note=body.note,
    )
    db.add(entry)
    db.flush()
    for activity_id in body.activity_ids:
        db.add(EntryActivity(entry_id=entry.id, activity_item_id=activity_id))
    db.commit()
    return _entry_to_out(_load_entry(entry, db))


@router.get("/{entry_date}", response_model=EntryOut)
def get_entry_by_date(
    entry_date: date,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = db.query(Entry).filter(
        Entry.user_id == current_user.id, Entry.date == entry_date
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    return _entry_to_out(_load_entry(entry, db))


@router.patch("/{entry_id}", response_model=EntryOut)
def update_entry(
    entry_id: int,
    body: EntryUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = db.query(Entry).filter(
        Entry.id == entry_id, Entry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    if body.mood_id is not None:
        entry.mood_id = body.mood_id
    if body.note is not None:
        entry.note = body.note
    if body.activity_ids is not None:
        db.query(EntryActivity).filter(EntryActivity.entry_id == entry.id).delete()
        for activity_id in body.activity_ids:
            db.add(EntryActivity(entry_id=entry.id, activity_item_id=activity_id))
    db.commit()
    return _entry_to_out(_load_entry(entry, db))


@router.post("/{entry_id}/photos", response_model=PhotoOut, status_code=status.HTTP_201_CREATED)
async def upload_photo(
    entry_id: int,
    file: UploadFile = File(...),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    entry = db.query(Entry).filter(
        Entry.id == entry_id, Entry.user_id == current_user.id
    ).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Entry not found")
    ext = os.path.splitext(file.filename or "")[1].lower() or ".jpg"
    filename = f"{uuid.uuid4().hex}{ext}"
    upload_dir = settings.UPLOAD_DIR
    os.makedirs(upload_dir, exist_ok=True)
    file_path = os.path.join(upload_dir, filename)
    content = await file.read()
    with open(file_path, "wb") as f:
        f.write(content)
    photo = EntryPhoto(entry_id=entry.id, file_path=filename)
    db.add(photo)
    db.commit()
    db.refresh(photo)
    return photo
