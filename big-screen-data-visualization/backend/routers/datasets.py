from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from typing import List, Optional, Any, Dict, cast

from database import get_db
import models
import schemas
from utils.db_engine import execute_query

router = APIRouter()


@router.get("/", response_model=List[schemas.Dataset])
async def get_datasets(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    datasets = db.query(models.Dataset).offset(skip).limit(limit).all()
    return datasets


@router.post("/preview")
async def preview_dataset(
    dataset: schemas.DatasetCreate, db: Session = Depends(get_db)
):
    datasource = (
        db.query(models.DataSource)
        .filter(models.DataSource.id == dataset.datasource_id)
        .first()
    )
    if not datasource:
        raise HTTPException(status_code=404, detail="DataSource not found")

    query = dataset.query_config.get("query")
    if not query:
        raise HTTPException(status_code=400, detail="No query provided")

    try:
        if str(datasource.type) in ["mysql", "postgresql", "sqlite"]:
            data = execute_query(
                str(datasource.type),
                cast(Dict[str, Any], datasource.connection_config),
                query,
            )
            # Limit to 10 rows for preview
            return data[:10]
        else:
            return {"message": f"Preview for {datasource.type} not implemented"}
    except Exception as e:
        raise HTTPException(status_code=400, detail=f"Query execution failed: {str(e)}")


@router.post("/", response_model=schemas.Dataset)
async def create_dataset(dataset: schemas.DatasetCreate, db: Session = Depends(get_db)):
    db_dataset = models.Dataset(**dataset.dict())
    db.add(db_dataset)
    db.commit()
    db.refresh(db_dataset)
    return db_dataset


@router.get("/{dataset_id}", response_model=schemas.Dataset)
async def get_dataset(dataset_id: int, db: Session = Depends(get_db)):
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found")
    return dataset


@router.put("/{dataset_id}", response_model=schemas.Dataset)
async def update_dataset(
    dataset_id: int, dataset: schemas.DatasetUpdate, db: Session = Depends(get_db)
):
    db_dataset = (
        db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    )
    if db_dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found")

    update_data = dataset.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(db_dataset, key, value)

    db.commit()
    db.refresh(db_dataset)
    return db_dataset


@router.delete("/{dataset_id}")
async def delete_dataset(dataset_id: int, db: Session = Depends(get_db)):
    db_dataset = (
        db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    )
    if db_dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found")

    db.delete(db_dataset)
    db.commit()
    return {"message": "Dataset deleted successfully"}


import random


@router.get("/{dataset_id}/data")
async def get_dataset_data(
    dataset_id: int, region: Optional[str] = None, db: Session = Depends(get_db)
):
    dataset = db.query(models.Dataset).filter(models.Dataset.id == dataset_id).first()
    if dataset is None:
        raise HTTPException(status_code=404, detail="Dataset not found")

    datasource = dataset.datasource
    query = dataset.query_config.get("query")

    if str(datasource.type) in ["mysql", "postgresql", "sqlite"] and query:
        try:
            # Replace placeholder if region is provided
            final_query = query
            if region:
                final_query = query.replace(":region", f"'{region}'")

            return execute_query(
                str(datasource.type),
                cast(Dict[str, Any], datasource.connection_config),
                final_query,
            )
        except Exception as e:
            # Fallback to mock if real query fails (maybe for demo purposes)
            print(f"Real query failed, falling back to mock: {e}")

    # Generate mock data based on query_config['type']
    data_type = dataset.query_config.get("type", "list")
    mock_data = dataset.query_config.get("mock_data")

    # Simple multiplier based on region for mock linkage
    multiplier = 1.0
    if region:
        # Generate a semi-deterministic multiplier based on region name
        # Sum ASCII values to make it more variable
        region_sum = sum(ord(c) for c in region)
        multiplier = (region_sum % 10 + 5) / 10.0  # Range 0.5 to 1.4

    if mock_data:
        # Apply multiplier to mock data if region is provided
        if region:
            if isinstance(mock_data, list):
                new_mock = []
                for item in mock_data:
                    new_item = item.copy()
                    if "value" in new_item:
                        val = new_item["value"]
                        if isinstance(val, list):
                            new_item["value"] = [
                                int(v * multiplier)
                                if isinstance(v, (int, float))
                                else v
                                for v in val
                            ]
                        elif isinstance(val, (int, float)):
                            new_item["value"] = int(val * multiplier)
                    new_mock.append(new_item)
                return new_mock
            elif isinstance(mock_data, dict):
                new_mock = mock_data.copy()
                if "value" in new_mock and isinstance(new_mock["value"], (int, float)):
                    new_mock["value"] = int(new_mock["value"] * multiplier)
                return new_mock
        return mock_data

    if data_type == "chart":
        labels = ["Mon", "Tue", "Wed", "Thu", "Fri"]
        return [
            {"label": label, "value": int(random.randint(10, 100) * multiplier)}
            for label in labels
        ]
    elif data_type == "map" or data_type == "echarts_map":
        # Mock China map data
        provinces = [
            "北京",
            "上海",
            "广东",
            "江苏",
            "浙江",
            "山东",
            "河南",
            "湖北",
            "四川",
            "福建",
        ]
        return [{"name": p, "value": random.randint(100, 1000)} for p in provinces]
    elif data_type == "table":
        return [
            {
                "id": 1,
                "name": f"Event A ({region or 'Global'})",
                "status": "Active",
                "time": "10:00",
            },
            {
                "id": 2,
                "name": f"Event B ({region or 'Global'})",
                "status": "Pending",
                "time": "10:05",
            },
            {
                "id": 3,
                "name": f"Event C ({region or 'Global'})",
                "status": "Resolved",
                "time": "10:10",
            },
        ]
    elif data_type == "metric":
        return {
            "value": int(random.randint(1000, 9999) * multiplier),
            "label": region or "总计",
        }

    return []
