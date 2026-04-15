from sqlalchemy import Column, Integer, String, ForeignKey
from app.core.db import Base


class ActivityCategory(Base):
    __tablename__ = "activity_categories"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)


class ActivityItem(Base):
    __tablename__ = "activity_items"

    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("activity_categories.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=True)  # NULL = системный
    label = Column(String, nullable=False)
    emoji = Column(String, nullable=False)
