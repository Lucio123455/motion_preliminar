from typing import Optional, List
from sqlalchemy.orm import Session
from app.models.routine import Routine
from app.models.routine_day import RoutineDay
from app.models.day_exercise import DayExercise
from app.schemas.routine import RoutineCreate, RoutineUpdate, DayCreate, DayUpdate, DayExerciseAdd, DayExerciseUpdate


# --- Routine ---

def get_routine(db: Session, routine_id: int) -> Optional[Routine]:
    return db.get(Routine, routine_id)

def list_routines(db: Session, user_id: Optional[int] = None, principal: Optional[bool] = None) -> List[Routine]:
    q = db.query(Routine)
    if user_id is not None:
        q = q.filter(Routine.user_id == user_id)
    if principal is not None:
        q = q.filter(Routine.principal == principal)
    return q.all()

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


# --- DayExercise ---

def get_day_exercise(db: Session, day_exercise_id: int) -> Optional[DayExercise]:
    return db.get(DayExercise, day_exercise_id)

def add_exercise_to_day(db: Session, day_id: int, data: DayExerciseAdd) -> DayExercise:
    entry = DayExercise(day_id=day_id, **data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry

def update_day_exercise(db: Session, day_exercise_id: int, data: DayExerciseUpdate) -> Optional[DayExercise]:
    entry = db.get(DayExercise, day_exercise_id)
    if not entry:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)
    db.commit()
    db.refresh(entry)
    return entry

def remove_exercise_from_day(db: Session, day_exercise_id: int) -> bool:
    entry = db.get(DayExercise, day_exercise_id)
    if not entry:
        return False
    db.delete(entry)
    db.commit()
    return True
