from pydantic import BaseModel


class ProfileCreate(BaseModel):
    weight_kg: float
    height_cm: float


class ProfileUpdate(BaseModel):
    weight_kg: float
    height_cm: float


class ProfileResponse(BaseModel):
    id: int
    user_id: int
    weight_kg: float
    height_cm: float

    model_config = {"from_attributes": True}
