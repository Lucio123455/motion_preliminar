from typing import Optional, List
from pydantic import BaseModel

_cfg = {"from_attributes": True}


# --- Exercise (standalone) ---

class ExerciseCreate(BaseModel):
    name: str
    sets: int
    reps: int
    rest_seconds: Optional[int] = None
    notes: Optional[str] = None


class ExerciseUpdate(BaseModel):
    name: Optional[str] = None
    sets: Optional[int] = None
    reps: Optional[int] = None
    rest_seconds: Optional[int] = None
    notes: Optional[str] = None


class ExerciseResponse(BaseModel):
    id: int
    name: str
    sets: int
    reps: int
    rest_seconds: Optional[int]
    notes: Optional[str]
    model_config = _cfg


# --- Day ---

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
    exercises: List[ExerciseResponse] = []
    model_config = _cfg


# --- Routine ---

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
