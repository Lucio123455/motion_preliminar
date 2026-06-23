from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.routine import Routine
from app.models.routine_day import RoutineDay
from app.models.routine_exercise import RoutineExercise
from app.models.day_exercise_link import DayExerciseLink
from app.schemas.routine import RoutineCreate, RoutineUpdate, DayCreate, DayUpdate, ExerciseCreate, ExerciseUpdate


# --- Routine ---

def get_routine(db: Session, routine_id: int) -> Optional[Routine]:
    return db.get(Routine, routine_id)

def list_routines(db: Session) -> List[Routine]:
    return db.query(Routine).all()

def create_routine(db: Session, data: RoutineCreate) -> Routine:
    routine = Routine(**data.model_dump())
    db.add(routine)
    db.commit()
    db.refresh(routine)
    return routine

def update_routine(db: Session, routine_id: int, data: RoutineUpdate) -> Optional[Routine]:
    routine = db.get(Routine, routine_id)
    if not routine:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(routine, field, value)
    db.commit()
    db.refresh(routine)
    return routine

def delete_routine(db: Session, routine_id: int) -> bool:
    routine = db.get(Routine, routine_id)
    if not routine:
        return False
    db.delete(routine)
    db.commit()
    return True


# --- Day ---

def get_day(db: Session, day_id: int) -> Optional[RoutineDay]:
    return db.get(RoutineDay, day_id)

def list_days(db: Session, routine_id: int) -> List[RoutineDay]:
    return db.query(RoutineDay).filter(RoutineDay.routine_id == routine_id).order_by(RoutineDay.day_order).all()

def create_day(db: Session, routine_id: int, data: DayCreate) -> RoutineDay:
    day = RoutineDay(routine_id=routine_id, **data.model_dump())
    db.add(day)
    db.commit()
    db.refresh(day)
    return day

def update_day(db: Session, day_id: int, data: DayUpdate) -> Optional[RoutineDay]:
    day = db.get(RoutineDay, day_id)
    if not day:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(day, field, value)
    db.commit()
    db.refresh(day)
    return day

def delete_day(db: Session, day_id: int) -> bool:
    day = db.get(RoutineDay, day_id)
    if not day:
        return False
    db.delete(day)
    db.commit()
    return True


# --- Exercise (standalone) ---

def get_exercise(db: Session, exercise_id: int) -> Optional[RoutineExercise]:
    return db.get(RoutineExercise, exercise_id)

def list_exercises(db: Session) -> List[RoutineExercise]:
    return db.query(RoutineExercise).all()

def create_exercise(db: Session, data: ExerciseCreate) -> RoutineExercise:
    exercise = RoutineExercise(**data.model_dump())
    db.add(exercise)
    db.commit()
    db.refresh(exercise)
    return exercise

def update_exercise(db: Session, exercise_id: int, data: ExerciseUpdate) -> Optional[RoutineExercise]:
    exercise = db.get(RoutineExercise, exercise_id)
    if not exercise:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(exercise, field, value)
    db.commit()
    db.refresh(exercise)
    return exercise

def delete_exercise(db: Session, exercise_id: int) -> bool:
    exercise = db.get(RoutineExercise, exercise_id)
    if not exercise:
        return False
    db.delete(exercise)
    db.commit()
    return True


# --- Day ↔ Exercise links ---

def add_exercise_to_day(db: Session, day_id: int, exercise_id: int, exercise_order: int = 1) -> bool:
    exists = db.query(DayExerciseLink).filter_by(day_id=day_id, exercise_id=exercise_id).first()
    if exists:
        return False
    link = DayExerciseLink(day_id=day_id, exercise_id=exercise_id, exercise_order=exercise_order)
    db.add(link)
    db.commit()
    return True

def remove_exercise_from_day(db: Session, day_id: int, exercise_id: int) -> bool:
    link = db.query(DayExerciseLink).filter_by(day_id=day_id, exercise_id=exercise_id).first()
    if not link:
        return False
    db.delete(link)
    db.commit()
    return True
