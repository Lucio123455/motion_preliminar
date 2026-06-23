from sqlalchemy import Column, Integer, Float, Date, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base


class Progress(Base):
    __tablename__ = "progress"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    exercise_id = Column(Integer, ForeignKey("exercises.id"), nullable=False)
    weight_kg = Column(Float, nullable=False)
    reps = Column(Integer, nullable=False)
    set_number = Column(Integer, nullable=False)
    date = Column(Date, nullable=False)

    user = relationship("User")
    exercise = relationship("Exercise")
