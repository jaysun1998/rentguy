from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, func, Enum
from sqlalchemy.orm import relationship
import enum

from app.db.base import Base

class MaintenanceStatus(str, enum.Enum):
    OPEN = "open"
    IN_PROGRESS = "in_progress"
    RESOLVED = "resolved"
    CLOSED = "closed"

class MaintenancePriority(str, enum.Enum):
    LOW = "low"
    NORMAL = "normal"
    HIGH = "high"
    URGENT = "urgent"

class MaintenanceCategory(str, enum.Enum):
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

class MaintenanceRequest(Base):
    __tablename__ = "maintenance_requests"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)
    reported_by = Column(Integer, ForeignKey("users.id"), nullable=False)  # User who reported (tenant or property manager)
    assigned_to = Column(Integer, ForeignKey("users.id"), nullable=True)  # Maintenance worker
    category = Column(String, nullable=False, default=MaintenanceCategory.OTHER)
    priority = Column(String, nullable=False, default=MaintenancePriority.NORMAL)
    status = Column(String, nullable=False, default=MaintenanceStatus.OPEN)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=False)
    reported_at = Column(DateTime, server_default=func.now())
    assigned_at = Column(DateTime, nullable=True)
    resolved_at = Column(DateTime, nullable=True)
    closed_at = Column(DateTime, nullable=True)
    estimated_cost = Column(String, nullable=True)  # Can be "0-100", "100-500", etc.
    actual_cost = Column(String, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    unit = relationship("Unit", back_populates="maintenance_requests")
    reporter = relationship("User", foreign_keys=[reported_by])
    assignee = relationship("User", foreign_keys=[assigned_to])

    def __repr__(self):
        return f"<MaintenanceRequest {self.title} - {self.status}>"

    @property
    def is_urgent(self) -> bool:
        return self.priority == MaintenancePriority.URGENT

    @property
    def is_overdue(self) -> bool:
        from datetime import datetime, timedelta
        if self.status in [MaintenanceStatus.RESOLVED, MaintenanceStatus.CLOSED]:
            return False
        # Consider urgent requests overdue after 24 hours, normal after 7 days
        threshold = timedelta(hours=24) if self.is_urgent else timedelta(days=7)
        return datetime.now() - self.reported_at > threshold