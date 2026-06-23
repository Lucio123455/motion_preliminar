from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.routine import (
    RoutineCreate, RoutineUpdate, RoutineResponse,
    DayCreate, DayUpdate, DayResponse,
    DayExerciseAdd, DayExerciseUpdate, DayExerciseResponse,
)
import app.crud.routines as crud

router = APIRouter(tags=["routines"])


# --- Routines ---

@router.get("/routines/", response_model=List[RoutineResponse])
def list_routines(user_id: int, db: Session = Depends(get_db)):
    return crud.list_routines(db, user_id)

@router.get("/routines/{routine_id}", response_model=RoutineResponse)
def get_routine(routine_id: int, db: Session = Depends(get_db)):
    routine = crud.get_routine(db, routine_id)
    if not routine:
        raise HTTPException(status_code=404, detail="Rutina no encontrada")
    return routine

@router.post("/routines/", response_model=RoutineResponse, status_code=201)
def create_routine(data: RoutineCreate, db: Session = Depends(get_db)):
    return crud.create_routine(db, data)

@router.put("/routines/{routine_id}", response_model=RoutineResponse)
def update_routine(routine_id: int, data: RoutineUpdate, db: Session = Depends(get_db)):
    routine = crud.update_routine(db, routine_id, data)
    if not routine:
        raise HTTPException(status_code=404, detail="Rutina no encontrada")
    return routine

@router.delete("/routines/{routine_id}", status_code=204)
def delete_routine(routine_id: int, db: Session = Depends(get_db)):
    if not crud.delete_routine(db, routine_id):
        raise HTTPException(status_code=404, detail="Rutina no encontrada")


# --- Days ---

@router.get("/routines/{routine_id}/days/", response_model=List[DayResponse])
def list_days(routine_id: int, db: Session = Depends(get_db)):
    if not crud.get_routine(db, routine_id):
        raise HTTPException(status_code=404, detail="Rutina no encontrada")
    return crud.list_days(db, routine_id)

@router.get("/routines/{routine_id}/days/{day_id}", response_model=DayResponse)
def get_day(routine_id: int, day_id: int, db: Session = Depends(get_db)):
    day = crud.get_day(db, day_id)
    if not day or day.routine_id != routine_id:
        raise HTTPException(status_code=404, detail="Día no encontrado")
    return day

@router.post("/routines/{routine_id}/days/", response_model=DayResponse, status_code=201)
def create_day(routine_id: int, data: DayCreate, db: Session = Depends(get_db)):
    if not crud.get_routine(db, routine_id):
        raise HTTPException(status_code=404, detail="Rutina no encontrada")
    return crud.create_day(db, routine_id, data)

@router.put("/routines/{routine_id}/days/{day_id}", response_model=DayResponse)
def update_day(routine_id: int, day_id: int, data: DayUpdate, db: Session = Depends(get_db)):
    day = crud.get_day(db, day_id)
    if not day or day.routine_id != routine_id:
        raise HTTPException(status_code=404, detail="Día no encontrado")
    return crud.update_day(db, day_id, data)

@router.delete("/routines/{routine_id}/days/{day_id}", status_code=204)
def delete_day(routine_id: int, day_id: int, db: Session = Depends(get_db)):
    day = crud.get_day(db, day_id)
    if not day or day.routine_id != routine_id:
        raise HTTPException(status_code=404, detail="Día no encontrado")
    crud.delete_day(db, day_id)


# --- Day exercises ---

@router.post("/routines/{routine_id}/days/{day_id}/exercises", response_model=DayExerciseResponse, status_code=201)
def add_exercise(routine_id: int, day_id: int, data: DayExerciseAdd, db: Session = Depends(get_db)):
    day = crud.get_day(db, day_id)
    if not day or day.routine_id != routine_id:
        raise HTTPException(status_code=404, detail="Día no encontrado")
    return crud.add_exercise_to_day(db, day_id, data)

@router.put("/routines/{routine_id}/days/{day_id}/exercises/{day_exercise_id}", response_model=DayExerciseResponse)
def update_exercise(routine_id: int, day_id: int, day_exercise_id: int, data: DayExerciseUpdate, db: Session = Depends(get_db)):
    entry = crud.get_day_exercise(db, day_exercise_id)
    if not entry or entry.day_id != day_id:
        raise HTTPException(status_code=404, detail="Ejercicio no encontrado en el día")
    return crud.update_day_exercise(db, day_exercise_id, data)

@router.delete("/routines/{routine_id}/days/{day_id}/exercises/{day_exercise_id}", status_code=204)
def remove_exercise(routine_id: int, day_id: int, day_exercise_id: int, db: Session = Depends(get_db)):
    entry = crud.get_day_exercise(db, day_exercise_id)
    if not entry or entry.day_id != day_id:
        raise HTTPException(status_code=404, detail="Ejercicio no encontrado en el día")
    crud.remove_exercise_from_day(db, day_exercise_id)
