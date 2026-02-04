from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas

router = APIRouter()


@router.get("/", response_model=List[schemas.Dashboard])
async def get_dashboards(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    dashboards = db.query(models.Dashboard).offset(skip).limit(limit).all()
    return dashboards


@router.post("/", response_model=schemas.Dashboard)
async def create_dashboard(
    dashboard: schemas.DashboardCreate, db: Session = Depends(get_db)
):
    db_dashboard = models.Dashboard(**dashboard.dict())
    db.add(db_dashboard)
    db.commit()
    db.refresh(db_dashboard)
    return db_dashboard


@router.get("/{dashboard_id}", response_model=schemas.Dashboard)
async def get_dashboard(dashboard_id: int, db: Session = Depends(get_db)):
    dashboard = (
        db.query(models.Dashboard).filter(models.Dashboard.id == dashboard_id).first()
    )
    if dashboard is None:
        raise HTTPException(status_code=404, detail="Dashboard not found")
    return dashboard


@router.put("/{dashboard_id}", response_model=schemas.Dashboard)
async def update_dashboard(
    dashboard_id: int, dashboard: schemas.DashboardUpdate, db: Session = Depends(get_db)
):
    db_dashboard = (
        db.query(models.Dashboard).filter(models.Dashboard.id == dashboard_id).first()
    )
    if db_dashboard is None:
        raise HTTPException(status_code=404, detail="Dashboard not found")

    update_data = dashboard.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_dashboard, key, value)

    db.commit()
    db.refresh(db_dashboard)
    return db_dashboard


@router.delete("/{dashboard_id}")
async def delete_dashboard(dashboard_id: int, db: Session = Depends(get_db)):
    db_dashboard = (
        db.query(models.Dashboard).filter(models.Dashboard.id == dashboard_id).first()
    )
    if db_dashboard is None:
        raise HTTPException(status_code=404, detail="Dashboard not found")

    db.delete(db_dashboard)
    db.commit()
    return {"message": "Dashboard deleted successfully"}


@router.get("/{dashboard_id}/widgets", response_model=List[schemas.Widget])
async def get_dashboard_widgets(dashboard_id: int, db: Session = Depends(get_db)):
    widgets = (
        db.query(models.Widget).filter(models.Widget.dashboard_id == dashboard_id).all()
    )
    return widgets


@router.post("/{dashboard_id}/widgets", response_model=schemas.Widget)
async def create_widget(
    dashboard_id: int, widget: schemas.WidgetCreate, db: Session = Depends(get_db)
):
    db_widget = models.Widget(dashboard_id=dashboard_id, **widget.dict())
    db.add(db_widget)
    db.commit()
    db.refresh(db_widget)
    return db_widget


@router.put("/widgets/{widget_id}", response_model=schemas.Widget)
async def update_widget(
    widget_id: int, widget: schemas.WidgetUpdate, db: Session = Depends(get_db)
):
    db_widget = db.query(models.Widget).filter(models.Widget.id == widget_id).first()
    if db_widget is None:
        raise HTTPException(status_code=404, detail="Widget not found")

    update_data = widget.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_widget, key, value)

    db.commit()
    db.refresh(db_widget)
    return db_widget


@router.delete("/widgets/{widget_id}")
async def delete_widget(widget_id: int, db: Session = Depends(get_db)):
    db_widget = db.query(models.Widget).filter(models.Widget.id == widget_id).first()
    if db_widget is None:
        raise HTTPException(status_code=404, detail="Widget not found")

    db.delete(db_widget)
    db.commit()
    return {"message": "Widget deleted successfully"}
