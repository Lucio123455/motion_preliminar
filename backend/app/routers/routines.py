from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.routine import (
    RoutineCreate, RoutineUpdate, RoutineResponse,
    DayCreate, DayUpdate, DayResponse,
    ExerciseCreate, ExerciseUpdate, ExerciseResponse,
)
import app.crud.routines as crud

router = APIRouter(tags=["routines"])


# --- Exercises (standalone) ---

@router.get("/exercises/", response_model=List[ExerciseResponse])
def list_exercises(db: Session = Depends(get_db)):
    return crud.list_exercises(db)

@router.get("/exercises/{exercise_id}", response_model=ExerciseResponse)
def get_exercise(exercise_id: int, db: Session = Depends(get_db)):
    exercise = crud.get_exercise(db, exercise_id)
    if not exercise:
        raise HTTPException(status_code=404, detail="Ejercicio no encontrado")
    return exercise

@router.post("/exercises/", response_model=ExerciseResponse, status_code=201)
def create_exercise(data: ExerciseCreate, db: Session = Depends(get_db)):
    return crud.create_exercise(db, data)

@router.put("/exercises/{exercise_id}", response_model=ExerciseResponse)
def update_exercise(exercise_id: int, data: ExerciseUpdate, db: Session = Depends(get_db)):
    exercise = crud.update_exercise(db, exercise_id, data)
    if not exercise:
        raise HTTPException(status_code=404, detail="Ejercicio no encontrado")
    return exercise

@router.delete("/exercises/{exercise_id}", status_code=204)
def delete_exercise(exercise_id: int, db: Session = Depends(get_db)):
    if not crud.delete_exercise(db, exercise_id):
        raise HTTPException(status_code=404, detail="Ejercicio no encontrado")


# --- Routines ---

@router.get("/routines/", response_model=List[RoutineResponse])
def list_routines(db: Session = Depends(get_db)):
    return crud.list_routines(db)

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


# --- Day ↔ Exercise links ---

@router.post("/routines/{routine_id}/days/{day_id}/exercises/{exercise_id}", status_code=204)
def add_exercise_to_day(routine_id: int, day_id: int, exercise_id: int, order: int = 1, db: Session = Depends(get_db)):
    day = crud.get_day(db, day_id)
    if not day or day.routine_id != routine_id:
        raise HTTPException(status_code=404, detail="Día no encontrado")
    if not crud.get_exercise(db, exercise_id):
        raise HTTPException(status_code=404, detail="Ejercicio no encontrado")
    if not crud.add_exercise_to_day(db, day_id, exercise_id, order):
        raise HTTPException(status_code=400, detail="El ejercicio ya está en el día")

@router.delete("/routines/{routine_id}/days/{day_id}/exercises/{exercise_id}", status_code=204)
def remove_exercise_from_day(routine_id: int, day_id: int, exercise_id: int, db: Session = Depends(get_db)):
    day = crud.get_day(db, day_id)
    if not day or day.routine_id != routine_id:
        raise HTTPException(status_code=404, detail="Día no encontrado")
    if not crud.remove_exercise_from_day(db, day_id, exercise_id):
        raise HTTPException(status_code=404, detail="El ejercicio no está en el día")
