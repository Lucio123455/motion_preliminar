from typing import Optional, List
from datetime import date
from sqlalchemy.orm import Session
from app.models.body_measurement import BodyMeasurement
from app.schemas.body_measurement import BodyMeasurementCreate, BodyMeasurementUpdate


def create(db: Session, data: BodyMeasurementCreate) -> BodyMeasurement:
    entry = BodyMeasurement(**data.model_dump())
    db.add(entry)
    db.commit()
    db.refresh(entry)
    return entry


def get(db: Session, measurement_id: int) -> Optional[BodyMeasurement]:
    return db.get(BodyMeasurement, measurement_id)


def list_by_user(
    db: Session,
    user_id: int,
    from_date: Optional[date] = None,
    to_date: Optional[date] = None,
) -> List[BodyMeasurement]:
    q = db.query(BodyMeasurement).filter(BodyMeasurement.user_id == user_id)
    if from_date:
        q = q.filter(BodyMeasurement.date >= from_date)
    if to_date:
        q = q.filter(BodyMeasurement.date <= to_date)
    return q.order_by(BodyMeasurement.date.desc()).all()


def update(db: Session, measurement_id: int, data: BodyMeasurementUpdate) -> Optional[BodyMeasurement]:
    entry = db.get(BodyMeasurement, measurement_id)
    if not entry:
        return None
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(entry, field, value)
    db.commit()
    db.refresh(entry)
    return entry


def delete(db: Session, measurement_id: int) -> bool:
    entry = db.get(BodyMeasurement, measurement_id)
    if not entry:
        return False
    db.delete(entry)
    db.commit()
    return True
