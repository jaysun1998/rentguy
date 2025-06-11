from sqlalchemy import Column, Integer, String, Float, Date, DateTime, ForeignKey, func, Enum
from sqlalchemy.orm import relationship
import enum

from app.db.base import Base

class LeaseStatus(str, enum.Enum):
    PENDING_SIGNATURE = "pending_signature"
    ACTIVE = "active"
    EXPIRED = "expired"
    TERMINATED = "terminated"

class Lease(Base):
    __tablename__ = "leases"

    id = Column(Integer, primary_key=True, index=True)
    unit_id = Column(Integer, ForeignKey("units.id"), nullable=False)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    lease_start_date = Column(Date, nullable=False)
    lease_end_date = Column(Date, nullable=False)
    rent_amount = Column(Float, nullable=False)
    currency_iso = Column(String(3), nullable=False, default="EUR")
    security_deposit = Column(Float, nullable=False, default=0.0)
    deposit_currency_iso = Column(String(3), nullable=False, default="EUR")
    vat_rate = Column(Float, nullable=False, default=0.0)
    status = Column(String, nullable=False, default=LeaseStatus.PENDING_SIGNATURE)
    digital_signed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    unit = relationship("Unit", back_populates="leases")
    tenant = relationship("Tenant", back_populates="leases")
    invoices = relationship("Invoice", back_populates="lease")

    def __repr__(self):
        return f"<Lease {self.unit.unit_number if self.unit else 'Unknown'} - {self.tenant.full_name if self.tenant else 'Unknown'}>"

    @property
    def is_active(self) -> bool:
        return self.status == LeaseStatus.ACTIVE

    @property
    def total_deposit(self) -> float:
        return self.security_deposit