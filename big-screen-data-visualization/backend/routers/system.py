from fastapi import APIRouter, Depends
import random
import time
from sqlalchemy.orm import Session
from database import SessionLocal
import models
import schemas

router = APIRouter()


def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


@router.get("/stats")
async def get_system_stats(db: Session = Depends(get_db)):
    # Simulate real-time data
    cpu_usage = round(random.uniform(20.0, 95.0), 1)
    mem_usage = round(random.uniform(30.0, 90.0), 1)

    # Trigger alarm if CPU > 90%
    if cpu_usage > 90.0:
        alarm = models.Alarm(
            level="critical",
            message=f"CPU usage critically high: {cpu_usage}%",
            source="system_monitor",
        )
        db.add(alarm)
        db.commit()
    elif cpu_usage > 80.0:
        alarm = models.Alarm(
            level="warning",
            message=f"CPU usage high: {cpu_usage}%",
            source="system_monitor",
        )
        db.add(alarm)
        db.commit()

    return {
        "cpu": {"usage": cpu_usage, "cores": 8, "load_average": [1.5, 1.2, 1.1]},
        "memory": {
            "total": 16384,
            "used": round(16384 * mem_usage / 100, 0),
            "usage_percent": mem_usage,
        },
        "disk": {"total": 512000, "used": 320000, "usage_percent": 62.5},
        "timestamp": int(time.time()),
    }
