from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class DayExercise(Base):
    __tablename__ = "day_exercises"

    id = Column(Integer, primary_key=True, index=True)
    day_id = Column(Integer, ForeignKey("routine_days.id"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
    sets = Column(Integer, nullable=False)
    reps = Column(Integer, nullable=False)
    exercise_order = Column(Integer, nullable=False, default=1)

    day = relationship("RoutineDay", back_populates="day_exercises")
    exercise = relationship("Exercise")
