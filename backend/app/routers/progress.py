from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.progress import ProgressCreate, ProgressUpdate, ProgressResponse
import app.crud.progress as crud

router = APIRouter(prefix="/progress", tags=["progress"])


@router.post("/", response_model=ProgressResponse, status_code=201)
def create_progress(data: ProgressCreate, db: Session = Depends(get_db)):
    return crud.create_progress(db, data)


@router.get("/", response_model=List[ProgressResponse])
def list_progress(
    user_id: int,
    exercise_id: Optional[int] = None,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    db: Session = Depends(get_db),
):
    return crud.list_progress(db, user_id, exercise_id, from_date, to_date)


@router.get("/{progress_id}", response_model=ProgressResponse)
def get_progress(progress_id: int, db: Session = Depends(get_db)):
    entry = crud.get_progress(db, progress_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    return entry


@router.put("/{progress_id}", response_model=ProgressResponse)
def update_progress(progress_id: int, data: ProgressUpdate, db: Session = Depends(get_db)):
    entry = crud.update_progress(db, progress_id, data)
    if not entry:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    return entry


@router.delete("/{progress_id}", status_code=204)
def delete_progress(progress_id: int, db: Session = Depends(get_db)):
    if not crud.delete_progress(db, progress_id):
        raise HTTPException(status_code=404, detail="Registro no encontrado")
