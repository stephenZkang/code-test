from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime


class DataSourceBase(BaseModel):
    name: str
    type: str
    connection_config: Dict[str, Any]
    description: Optional[str] = None


class DataSourceCreate(DataSourceBase):
    pass


class DataSourceUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    connection_config: Optional[Dict[str, Any]] = None
    description: Optional[str] = None


class DataSource(DataSourceBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class UserBase(BaseModel):
    username: str
    email: str
    full_name: Optional[str] = None
    is_active: Optional[bool] = True
    is_admin: Optional[bool] = False


class UserCreate(UserBase):
    password: str


class UserUpdate(BaseModel):
    email: Optional[str] = None
    full_name: Optional[str] = None
    is_active: Optional[bool] = None
    is_admin: Optional[bool] = None


class UserPasswordChange(BaseModel):
    old_password: str
    new_password: str


class User(UserBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class Token(BaseModel):
    access_token: str
    token_type: str


class TokenData(BaseModel):
    username: Optional[str] = None


class DatasetBase(BaseModel):
    name: str
    datasource_id: int
    query_config: Dict[str, Any]
    refresh_interval: int = 300
    description: Optional[str] = None


class DatasetCreate(DatasetBase):
    pass


class DatasetUpdate(BaseModel):
    name: Optional[str] = None
    datasource_id: Optional[int] = None
    query_config: Optional[Dict[str, Any]] = None
    refresh_interval: Optional[int] = None
    description: Optional[str] = None


class Dataset(DatasetBase):
    id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class WidgetBase(BaseModel):
    type: str
    config: Dict[str, Any]
    position: Dict[str, Any]
    dataset_id: Optional[int] = None


class WidgetCreate(WidgetBase):
    pass


class WidgetUpdate(BaseModel):
    type: Optional[str] = None
    config: Optional[Dict[str, Any]] = None
    position: Optional[Dict[str, Any]] = None
    dataset_id: Optional[int] = None


class Widget(WidgetBase):
    id: int
    dashboard_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True


class DashboardBase(BaseModel):
    name: str
    title: str
    layout_config: Dict[str, Any]
    is_public: bool = False


class DashboardCreate(DashboardBase):
    pass


class DashboardUpdate(BaseModel):
    name: Optional[str] = None
    title: Optional[str] = None
    layout_config: Optional[Dict[str, Any]] = None
    is_public: Optional[bool] = None


class Dashboard(DashboardBase):
    id: int
    created_at: datetime
    updated_at: datetime
    widgets: List[Widget] = []

    class Config:
        from_attributes = True


class AlarmBase(BaseModel):
    level: str
    message: str
    source: Optional[str] = None
    is_read: bool = False


class AlarmCreate(AlarmBase):
    pass


class Alarm(AlarmBase):
    id: int
    created_at: datetime

    class Config:
        from_attributes = True
