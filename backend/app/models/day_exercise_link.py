from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class DayExerciseLink(Base):
    __tablename__ = "day_exercise_links"

    day_id = Column(Integer, ForeignKey("routine_days.id"), primary_key=True)
    exercise_id = Column(Integer, ForeignKey("routine_exercises.id"), primary_key=True)
    exercise_order = Column(Integer, nullable=False, default=1)

    day = relationship("RoutineDay", back_populates="exercise_links")
    exercise = relationship("RoutineExercise", back_populates="day_links")
