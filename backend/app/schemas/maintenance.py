from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime
from enum import Enum

class MaintenanceStatus(str, Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class MaintenancePriority(str, Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

class MaintenanceCategory(str, Enum):
    PLUMBING = "plumbing"
    ELECTRICAL = "electrical"
    HVAC = "hvac"
    APPLIANCES = "appliances"
    CLEANING = "cleaning"
    PAINTING = "painting"
    FLOORING = "flooring"
    WINDOWS = "windows"
    DOORS = "doors"
    OTHER = "other"

# Shared properties
class MaintenanceRequestBase(BaseModel):
    category: Optional[MaintenanceCategory] = MaintenanceCategory.OTHER
    priority: Optional[MaintenancePriority] = MaintenancePriority.NORMAL
    status: Optional[MaintenanceStatus] = MaintenanceStatus.OPEN
    title: Optional[str] = None
    description: Optional[str] = None
    estimated_cost: Optional[str] = None
    actual_cost: Optional[str] = None

class MaintenanceRequestCreate(MaintenanceRequestBase):
    unit_id: int
    category: MaintenanceCategory = MaintenanceCategory.OTHER
    priority: MaintenancePriority = MaintenancePriority.NORMAL
    title: str = Field(..., min_length=1, max_length=200)
    description: str = Field(..., min_length=1, max_length=2000)

class MaintenanceRequestUpdate(MaintenanceRequestBase):
    assigned_to: Optional[int] = None
    status: Optional[MaintenanceStatus] = None
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None

class MaintenanceRequestAssign(BaseModel):
    assigned_to: int

class MaintenanceRequestResolve(BaseModel):
    actual_cost: Optional[str] = None

class MaintenanceRequestInDBBase(MaintenanceRequestBase):
    id: int
    unit_id: int
    reported_by: int
    assigned_to: Optional[int] = None
    title: str
    description: str
    category: MaintenanceCategory
    priority: MaintenancePriority
    status: MaintenanceStatus
    reported_at: datetime
    assigned_at: Optional[datetime] = None
    resolved_at: Optional[datetime] = None
    closed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class MaintenanceRequest(MaintenanceRequestInDBBase):
    pass

class MaintenanceRequestInDB(MaintenanceRequestInDBBase):
    pass