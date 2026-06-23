from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.profile import ProfileCreate, ProfileUpdate, ProfileResponse
from app.crud.users import get_user
import app.crud.profile as crud

router = APIRouter(prefix="/users/{user_id}/profile", tags=["profile"])


@router.get("/", response_model=ProfileResponse)
def get_profile(user_id: int, db: Session = Depends(get_db)):
    profile = crud.get_profile(db, user_id)
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return profile


@router.post("/", response_model=ProfileResponse, status_code=201)
def create_profile(user_id: int, data: ProfileCreate, db: Session = Depends(get_db)):
    if not get_user(db, user_id):
        raise HTTPException(status_code=404, detail="Usuario no encontrado")
    if crud.get_profile(db, user_id):
        raise HTTPException(status_code=400, detail="El usuario ya tiene un perfil")
    return crud.create_profile(db, user_id, data)


@router.put("/", response_model=ProfileResponse)
def update_profile(user_id: int, data: ProfileUpdate, db: Session = Depends(get_db)):
    profile = crud.update_profile(db, user_id, data)
    if not profile:
        raise HTTPException(status_code=404, detail="Perfil no encontrado")
    return profile
