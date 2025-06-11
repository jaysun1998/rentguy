from sqlalchemy import Column, Integer, String, Float, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship

from app.db.base import Base

class Unit(Base):
    __tablename__ = "units"

    id = Column(Integer, primary_key=True, index=True)
    property_id = Column(Integer, ForeignKey("properties.id"), nullable=False)
    unit_number = Column(String, nullable=False)
    floor = Column(Integer, nullable=True)
    bedrooms = Column(Integer, nullable=False, default=0)
    bathrooms = Column(Integer, nullable=False, default=0)
    square_meters = Column(Float, nullable=True)
    current_rent = Column(Float, nullable=False, default=0.0)
    currency_iso = Column(String(3), nullable=False, default="EUR")
    deposit_amount = Column(Float, nullable=False, default=0.0)
    is_vacant = Column(Boolean, default=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    def __repr__(self):
        return f"<Unit {self.unit_number}>"

    @property
    def status(self) -> str:
        return "vacant" if self.is_vacant else "occupied"

    # Relationships
    property = relationship("Property", back_populates="units")
    leases = relationship("Lease", back_populates="unit")
    maintenance_requests = relationship("MaintenanceRequest", back_populates="unit")