from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.exercise import Exercise
from app.schemas.exercise import ExerciseCreate, ExerciseUpdate


def get_exercise(db: Session, exercise_id: int) -> Optional[Exercise]:
    return db.get(Exercise, exercise_id)

def list_exercises(db: Session) -> List[Exercise]:
    return db.query(Exercise).all()

def create_exercise(db: Session, data: ExerciseCreate) -> Exercise:
    exercise = Exercise(**data.model_dump())
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise

def update_exercise(db: Session, exercise_id: int, data: ExerciseUpdate) -> Optional[Exercise]:
    exercise = db.get(Exercise, exercise_id)
    if not exercise:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(exercise, field, value)
    db.commit()
    db.refresh(exercise)
    return exercise

def delete_exercise(db: Session, exercise_id: int) -> bool:
    exercise = db.get(Exercise, exercise_id)
    if not exercise:
        return False
    db.delete(exercise)
    db.commit()
    return True
