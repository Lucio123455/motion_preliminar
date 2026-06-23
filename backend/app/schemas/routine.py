from typing import Optional, List
from pydantic import BaseModel

_cfg = {"from_attributes": True}


class DayExerciseAdd(BaseModel):
    exercise_id: int
    sets: int
    reps: int
    exercise_order: int = 1


class DayExerciseUpdate(BaseModel):
    sets: Optional[int] = None
    reps: Optional[int] = None
    exercise_order: Optional[int] = None


class DayExerciseResponse(BaseModel):
    id: int
    exercise_id: int
    sets: int
    reps: int
    exercise_order: int
    model_config = _cfg


class RoutineCreate(BaseModel):
    name: str
    description: Optional[str] = None


class RoutineUpdate(BaseModel):
    name: Optional[str] = None
    description: Optional[str] = None


class RoutineResponse(BaseModel):
    id: int
    name: str
    description: Optional[str]
    model_config = _cfg


class DayCreate(BaseModel):
    name: str
    day_order: int = 1


class DayUpdate(BaseModel):
    name: Optional[str] = None
    day_order: Optional[int] = None


class DayResponse(BaseModel):
    id: int
    routine_id: int
    name: str
    day_order: int
    day_exercises: List[DayExerciseResponse] = []
    model_config = _cfg
