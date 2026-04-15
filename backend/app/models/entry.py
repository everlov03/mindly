from sqlalchemy import (
    Column, Integer, String, Date, Text, DateTime,
    ForeignKey, UniqueConstraint, func,
)
from app.core.db import Base


class Entry(Base):
    __tablename__ = "entries"
    __table_args__ = (UniqueConstraint("user_id", "date", name="uq_user_date"),)

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    date = Column(Date, nullable=False)
    mood_id = Column(Integer, ForeignKey("moods.id"), nullable=True)
    note = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())


class EntryActivity(Base):
    __tablename__ = "entry_activities"

    entry_id = Column(Integer, ForeignKey("entries.id"), primary_key=True)
    activity_item_id = Column(Integer, ForeignKey("activity_items.id"), primary_key=True)


class EntryPhoto(Base):
    __tablename__ = "entry_photos"

    id = Column(Integer, primary_key=True, index=True)
    entry_id = Column(Integer, ForeignKey("entries.id"), nullable=False)
    file_path = Column(String, nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
