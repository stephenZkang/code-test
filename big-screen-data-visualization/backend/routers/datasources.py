from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List

from database import get_db
import models
import schemas
from utils.db_engine import test_connection

router = APIRouter()


@router.get("/", response_model=List[schemas.DataSource])
async def get_datasources(
    skip: int = 0, limit: int = 100, db: Session = Depends(get_db)
):
    datasources = db.query(models.DataSource).offset(skip).limit(limit).all()
    return datasources


@router.post("/test")
async def test_datasource_connection(datasource: schemas.DataSourceCreate):
    if datasource.type in ["mysql", "postgresql", "sqlite"]:
        success = test_connection(datasource.type, datasource.connection_config)
        if not success:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Connection test failed. Please check your configuration.",
            )
        return {"message": "Connection successful"}
    elif datasource.type == "api":
        # Mock API test for now
        return {"message": "API endpoint configured (test skipped)"}
    else:
        return {"message": f"Connection test for {datasource.type} not implemented"}


@router.post("/", response_model=schemas.DataSource)
async def create_datasource(
    datasource: schemas.DataSourceCreate, db: Session = Depends(get_db)
):
    db_datasource = models.DataSource(**datasource.dict())
    db.add(db_datasource)
    db.commit()
    db.refresh(db_datasource)
    return db_datasource


@router.get("/{datasource_id}", response_model=schemas.DataSource)
async def get_datasource(datasource_id: int, db: Session = Depends(get_db)):
    datasource = (
        db.query(models.DataSource)
        .filter(models.DataSource.id == datasource_id)
        .first()
    )
    if datasource is None:
        raise HTTPException(status_code=404, detail="DataSource not found")
    return datasource


@router.put("/{datasource_id}", response_model=schemas.DataSource)
async def update_datasource(
    datasource_id: int,
    datasource: schemas.DataSourceUpdate,
    db: Session = Depends(get_db),
):
    db_datasource = (
        db.query(models.DataSource)
        .filter(models.DataSource.id == datasource_id)
        .first()
    )
    if db_datasource is None:
        raise HTTPException(status_code=404, detail="DataSource not found")

    update_data = datasource.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_datasource, key, value)

    db.commit()
    db.refresh(db_datasource)
    return db_datasource


@router.delete("/{datasource_id}")
async def delete_datasource(datasource_id: int, db: Session = Depends(get_db)):
    db_datasource = (
        db.query(models.DataSource)
        .filter(models.DataSource.id == datasource_id)
        .first()
    )
    if db_datasource is None:
        raise HTTPException(status_code=404, detail="DataSource not found")

    db.delete(db_datasource)
    db.commit()
    return {"message": "DataSource deleted successfully"}
