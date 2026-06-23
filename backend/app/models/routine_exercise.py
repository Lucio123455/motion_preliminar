from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base


class RoutineExercise(Base):
    __tablename__ = "routine_exercises"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    sets = Column(Integer, nullable=False)
    reps = Column(Integer, nullable=False)
    rest_seconds = Column(Integer, nullable=True)
    notes = Column(String, nullable=True)

    day_links = relationship("DayExerciseLink", back_populates="exercise", cascade="all, delete-orphan")
