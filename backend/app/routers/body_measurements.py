from typing import List, Optional
from datetime import date
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.schemas.body_measurement import BodyMeasurementCreate, BodyMeasurementUpdate, BodyMeasurementResponse
import app.crud.body_measurements as crud

router = APIRouter(prefix="/body-measurements", tags=["body measurements"])


@router.post("/", response_model=BodyMeasurementResponse, status_code=201)
def create(data: BodyMeasurementCreate, db: Session = Depends(get_db)):
    return crud.create(db, data)


@router.get("/", response_model=List[BodyMeasurementResponse])
def list_measurements(
    user_id: int,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
    db: Session = Depends(get_db),
):
    return crud.list_by_user(db, user_id, from_date, to_date)


@router.get("/{measurement_id}", response_model=BodyMeasurementResponse)
def get_measurement(measurement_id: int, db: Session = Depends(get_db)):
    entry = crud.get(db, measurement_id)
    if not entry:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    return entry


@router.put("/{measurement_id}", response_model=BodyMeasurementResponse)
def update_measurement(measurement_id: int, data: BodyMeasurementUpdate, db: Session = Depends(get_db)):
    entry = crud.update(db, measurement_id, data)
    if not entry:
        raise HTTPException(status_code=404, detail="Registro no encontrado")
    return entry


@router.delete("/{measurement_id}", status_code=204)
def delete_measurement(measurement_id: int, db: Session = Depends(get_db)):
    if not crud.delete(db, measurement_id):
        raise HTTPException(status_code=404, detail="Registro no encontrado")
