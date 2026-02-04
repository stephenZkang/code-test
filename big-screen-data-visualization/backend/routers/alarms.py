from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from database import SessionLocal
import models
import schemas
from datetime import datetime

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/", response_model=List[schemas.Alarm])
async def get_alarms(limit: int = 20, db: Session = Depends(get_db)):
    return (
        db.query(models.Alarm)
        .order_by(models.Alarm.created_at.desc())
        .limit(limit)
        .all()
    )


@router.post("/", response_model=schemas.Alarm)
async def create_alarm(alarm: schemas.AlarmCreate, db: Session = Depends(get_db)):
    db_alarm = models.Alarm(**alarm.dict())
    db.add(db_alarm)
    db.commit()
    db.refresh(db_alarm)
    return db_alarm


@router.put("/{alarm_id}/read", response_model=schemas.Alarm)
async def mark_alarm_as_read(alarm_id: int, db: Session = Depends(get_db)):
    db_alarm = db.query(models.Alarm).filter(models.Alarm.id == alarm_id).first()
    if not db_alarm:
        raise HTTPException(status_code=404, detail="Alarm not found")
    db_alarm.is_read = True
    db.commit()
    db.refresh(db_alarm)
    return db_alarm
