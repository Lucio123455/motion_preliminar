from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class RoutineDay(Base):
    __tablename__ = "routine_days"

    id = Column(Integer, primary_key=True, index=True)
    routine_id = Column(Integer, ForeignKey("routines.id"), nullable=False)
    name = Column(String, nullable=False)
    day_order = Column(Integer, nullable=False, default=1)

    routine = relationship("Routine", back_populates="days")
    exercise_links = relationship("DayExerciseLink", back_populates="day", cascade="all, delete-orphan")
    exercises = relationship("RoutineExercise", secondary="day_exercise_links", viewonly=True)
