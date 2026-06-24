from pydantic import BaseModel

_cfg = {"from_attributes": True}


class UserCreate(BaseModel):
    name: str
    password: str


class UserLogin(BaseModel):
    name: str
    password: str


class UserUpdate(BaseModel):
    name: str


class UserResponse(BaseModel):
    id: int
    name: str

    model_config = _cfg
