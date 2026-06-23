from typing import Optional
from datetime import date
from pydantic import BaseModel


class ProgressCreate(BaseModel):
    user_id: int
    exercise_id: int
    weight_kg: float
    reps: int
    set_number: int
    date: date


class ProgressUpdate(BaseModel):
    weight_kg: Optional[float] = None
    reps: Optional[int] = None
    set_number: Optional[int] = None
    date: Optional[date] = None


class ProgressResponse(BaseModel):
    id: int
    user_id: int
    exercise_id: int
    weight_kg: float
    reps: int
    set_number: int
    date: date

    model_config = {"from_attributes": True}
