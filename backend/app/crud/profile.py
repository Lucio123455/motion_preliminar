from typing import Optional
from sqlalchemy.orm import Session
from app.models.profile import UserProfile
from app.schemas.profile import ProfileCreate, ProfileUpdate


def get_profile(db: Session, user_id: int) -> Optional[UserProfile]:
    return db.query(UserProfile).filter(UserProfile.user_id == user_id).first()


def create_profile(db: Session, user_id: int, data: ProfileCreate) -> UserProfile:
    profile = UserProfile(user_id=user_id, **data.model_dump())
    db.add(profile)
    db.commit()
    db.refresh(profile)
    return profile


def update_profile(db: Session, user_id: int, data: ProfileUpdate) -> Optional[UserProfile]:
    profile = get_profile(db, user_id)
    if not profile:
        return None
    profile.weight_kg = data.weight_kg
    profile.height_cm = data.height_cm
    db.commit()
    db.refresh(profile)
    return profile
