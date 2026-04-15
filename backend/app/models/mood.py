from sqlalchemy import Column, Integer, String
from app.core.db import Base


class Mood(Base):
    __tablename__ = "moods"

    id = Column(Integer, primary_key=True, index=True)
    label = Column(String, nullable=False)
    emoji = Column(String, nullable=False)
    color = Column(String, nullable=False)
    sort_order = Column(Integer, nullable=False)
