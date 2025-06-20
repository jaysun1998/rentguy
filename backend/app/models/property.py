from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, func, Enum
from sqlalchemy.orm import relationship
from sqlalchemy.dialects.postgresql import ENUM as PgEnum
import enum

from app.db.base_class import Base

class PropertyType(str, enum.Enum):
    RESIDENTIAL = "residential"
    COMMERCIAL = "commercial"
    MIXED = "mixed"

class Property(Base):
    __tablename__ = "properties"

    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False, index=True)
    address_line1 = Column(String, nullable=False)
    address_line2 = Column(String, nullable=True)
    city = Column(String, nullable=False)
    postal_code = Column(String, nullable=False)
    region = Column(String, nullable=True)
    country_iso = Column(String(2), nullable=False)
    property_type = Column(String, nullable=False, default=PropertyType.RESIDENTIAL)
    default_vat_rate = Column(Float, nullable=False, default=0.0)
    owner_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())

    # Relationships
    owner = relationship("User", back_populates="properties")
    units = relationship("Unit", back_populates="property", cascade="all, delete-orphan")

    def __repr__(self):
        return f"<Property {self.name}>"

    @property
    def full_address(self) -> str:
        parts = [self.address_line1]
        if self.address_line2:
            parts.append(self.address_line2)
        parts.extend([self.city, self.postal_code])
        return ", ".join(parts)