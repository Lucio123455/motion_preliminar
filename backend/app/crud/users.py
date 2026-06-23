from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate, UserUpdate


def list_users(db: Session) -> List[User]:
    return db.query(User).all()


def create_user(db: Session, data: UserCreate) -> User:
    user = User(name=data.name)
    db.add(user)
    db.commit()
    db.refresh(user)
    return user


def get_user(db: Session, user_id: int) -> Optional[User]:
    return db.get(User, user_id)


def update_user(db: Session, user_id: int, data: UserUpdate) -> Optional[User]:
    user = db.get(User, user_id)
    if not user:
        return None
    user.name = data.name
    db.commit()
    db.refresh(user)
    return user


def delete_user(db: Session, user_id: int) -> bool:
    user = db.get(User, user_id)
    if not user:
        return False
    db.delete(user)
    db.commit()
    return True
