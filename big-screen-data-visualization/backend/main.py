from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List, Optional
import uvicorn
import os
from fastapi.staticfiles import StaticFiles

from database import SessionLocal, engine
import models
import schemas
from routers import (
    datasources,
    datasets as datasets_router,
    dashboards as dashboards_router,
    system as system_router,
    alarms as alarms_router,
    users as users_router,
    assets as assets_router,
)

models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="态势大屏 API", version="1.0.0")

# Serve static files
UPLOAD_DIR = os.path.join(os.path.dirname(os.path.abspath(__file__)), "uploads")
if not os.path.exists(UPLOAD_DIR):
    os.makedirs(UPLOAD_DIR)
app.mount("/uploads", StaticFiles(directory=UPLOAD_DIR), name="uploads")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(datasources.router, prefix="/api/datasources", tags=["datasources"])
app.include_router(datasets_router.router, prefix="/api/datasets", tags=["datasets"])
app.include_router(
    dashboards_router.router, prefix="/api/dashboards", tags=["dashboards"]
)
app.include_router(system_router.router, prefix="/api/system", tags=["system"])
app.include_router(alarms_router.router, prefix="/api/alarms", tags=["alarms"])
app.include_router(users_router.router, prefix="/api/users", tags=["users"])
app.include_router(assets_router.router, prefix="/api/assets", tags=["assets"])


@app.get("/")
async def root():
    return {"message": "态势大屏 API"}


@app.get("/health")
async def health_check():
    return {"status": "healthy"}


if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)
