from sqlalchemy import (
    Column,
    Integer,
    String,
    Text,
    DateTime,
    JSON,
    ForeignKey,
    Boolean,
)
from sqlalchemy.orm import relationship
from database import Base
from datetime import datetime


class DataSource(Base):
    __tablename__ = "datasources"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    type = Column(String(50), nullable=False)  # mysql, postgresql, api, file
    connection_config = Column(JSON, nullable=False)
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    datasets = relationship("Dataset", back_populates="datasource")


class Dataset(Base):
    __tablename__ = "datasets"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    datasource_id = Column(Integer, ForeignKey("datasources.id"), nullable=False)
    query_config = Column(JSON, nullable=False)
    refresh_interval = Column(Integer, default=300)  # seconds
    description = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    datasource = relationship("DataSource", back_populates="datasets")


class Dashboard(Base):
    __tablename__ = "dashboards"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String(100), nullable=False)
    title = Column(String(200), nullable=False)
    layout_config = Column(JSON, nullable=False)
    is_public = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    widgets = relationship("Widget", back_populates="dashboard")


class Widget(Base):
    __tablename__ = "widgets"

    id = Column(Integer, primary_key=True, index=True)
    dashboard_id = Column(Integer, ForeignKey("dashboards.id"), nullable=False)
    dataset_id = Column(Integer, ForeignKey("datasets.id"))
    type = Column(String(50), nullable=False)  # map, chart, table, metric
    config = Column(JSON, nullable=False)
    position = Column(JSON, nullable=False)  # x, y, width, height
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    dashboard = relationship("Dashboard", back_populates="widgets")


class Alarm(Base):
    __tablename__ = "alarms"

    id = Column(Integer, primary_key=True, index=True)
    level = Column(String(20), nullable=False)  # critical, warning, info
    message = Column(Text, nullable=False)
    source = Column(String(100))
    is_read = Column(Boolean, default=False)
    created_at = Column(DateTime, default=datetime.utcnow)
