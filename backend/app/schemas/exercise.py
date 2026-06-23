from typing import Optional
from pydantic import BaseModel


class ExerciseCreate(BaseModel):
    name: str
    muscle_group: Optional[str] = None
    notes: Optional[str] = None


class ExerciseUpdate(BaseModel):
    name: Optional[str] = None
    muscle_group: Optional[str] = None
    notes: Optional[str] = None


class ExerciseResponse(BaseModel):
    id: int
    name: str
    muscle_group: Optional[str]
    notes: Optional[str]

    model_config = {"from_attributes": True}
