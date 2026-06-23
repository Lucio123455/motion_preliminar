from typing import Optional
from datetime import date
from pydantic import BaseModel


class BodyMeasurementCreate(BaseModel):
    user_id: int
    weight_kg: float
    height_cm: float
    date: date


class BodyMeasurementUpdate(BaseModel):
    weight_kg: Optional[float] = None
    height_cm: Optional[float] = None
    date: Optional[date] = None


class BodyMeasurementResponse(BaseModel):
    id: int
    user_id: int
    weight_kg: float
    height_cm: float
    date: date

    model_config = {"from_attributes": True}
