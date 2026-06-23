from sqlalchemy import Column, Integer, String
from app.database import Base


class Exercise(Base):
    __tablename__ = "exercises"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, unique=True)
    muscle_group = Column(String, nullable=True)
    notes = Column(String, nullable=True)
