from typing import Optional, List
from datetime import date
from sqlalchemy.orm import Session
from app.models.progress import Progress
from app.schemas.progress import ProgressCreate, ProgressUpdate


def create_progress(db: Session, data: ProgressCreate) -> Progress:
    entry = Progress(**data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get_progress(db: Session, progress_id: int) -> Optional[Progress]:
    return db.get(Progress, progress_id)


def list_progress(
    db: Session,
    user_id: int,
    exercise_id: Optional[int] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
) -> List[Progress]:
    q = db.query(Progress).filter(Progress.user_id == user_id)
    if exercise_id:
        q = q.filter(Progress.exercise_id == exercise_id)
    if from_date:
        q = q.filter(Progress.date >= from_date)
    if to_date:
        q = q.filter(Progress.date <= to_date)
    return q.order_by(Progress.date.desc(), Progress.set_number).all()


def update_progress(db: Session, progress_id: int, data: ProgressUpdate) -> Optional[Progress]:
    entry = db.get(Progress, progress_id)
    if not entry:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)
    db.commit()
    db.refresh(entry)
    return entry


def delete_progress(db: Session, progress_id: int) -> bool:
    entry = db.get(Progress, progress_id)
    if not entry:
        return False
    db.delete(entry)
    db.commit()
    return True
