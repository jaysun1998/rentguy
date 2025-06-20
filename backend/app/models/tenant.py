from sqlalchemy import Column, Integer, String, Date, DateTime, ForeignKey, func, Enum, Text
from sqlalchemy.orm import relationship
import enum

from app.db.base_class import Base

class ScreeningStatus(str, enum.Enum):
    NOT_SUBMITTED = "not_submitted"
    PENDING = "pending"
    APPROVED = "approved"
    DENIED = "denied"

class Tenant(Base):
    __tablename__ = "tenants"

    id = Column(Integer, primary_key=True, index=True)
    first_name = Column(String, nullable=False)
    last_name = Column(String, nullable=False)
    email = Column(String, nullable=False, index=True)
    phone_number = Column(String, nullable=True)
    date_of_birth = Column(Date, nullable=True)
    nationality_iso = Column(String(2), nullable=True)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    owner = relationship("User")
    screening_results = relationship("ScreeningResult", back_populates="tenant", uselist=False)
    leases = relationship("Lease", back_populates="tenant")

    def __repr__(self):
        return f"<Tenant {self.first_name} {self.last_name}>"

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}"

class ScreeningResult(Base):
    __tablename__ = "screening_results"

    id = Column(Integer, primary_key=True, index=True)
    tenant_id = Column(Integer, ForeignKey("tenants.id"), nullable=False)
    screening_provider = Column(String, nullable=False, default="internal")
    status = Column(String, nullable=False, default=ScreeningStatus.NOT_SUBMITTED)
    result_data = Column(Text, nullable=True)  # JSON data from screening provider
    requested_at = Column(DateTime, server_default=func.now())
    completed_at = Column(DateTime, nullable=True)

    # Relationships
    tenant = relationship("Tenant", back_populates="screening_results")

    def __repr__(self):
        return f"<ScreeningResult {self.tenant.full_name if self.tenant else 'Unknown'} - {self.status}>"