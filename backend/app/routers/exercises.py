from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.exercise import ExerciseCreate, ExerciseUpdate, ExerciseResponse
import app.crud.exercises as crud

router = APIRouter(prefix="/exercises", tags=["exercises"])


@router.get("/", response_model=List[ExerciseResponse])
def list_exercises(db: Session = Depends(get_db)):
    return crud.list_exercises(db)

@router.get("/{exercise_id}", response_model=ExerciseResponse)
def get_exercise(exercise_id: int, db: Session = Depends(get_db)):
    exercise = crud.get_exercise(db, exercise_id)
    if not exercise:
        raise HTTPException(status_code=404, detail="Ejercicio no encontrado")
    return exercise

@router.post("/", response_model=ExerciseResponse, status_code=201)
def create_exercise(data: ExerciseCreate, db: Session = Depends(get_db)):
    return crud.create_exercise(db, data)

@router.put("/{exercise_id}", response_model=ExerciseResponse)
def update_exercise(exercise_id: int, data: ExerciseUpdate, db: Session = Depends(get_db)):
    exercise = crud.update_exercise(db, exercise_id, data)
    if not exercise:
        raise HTTPException(status_code=404, detail="Ejercicio no encontrado")
    return exercise

@router.delete("/{exercise_id}", status_code=204)
def delete_exercise(exercise_id: int, db: Session = Depends(get_db)):
    if not crud.delete_exercise(db, exercise_id):
        raise HTTPException(status_code=404, detail="Ejercicio no encontrado")
