from sqlalchemy import Boolean, Column, Integer, String, DateTime, func, Enum
from sqlalchemy.dialects.postgresql import ENUM as PgEnum
from sqlalchemy.orm import relationship

from app.db.base import Base

import enum

class UserRole(str, enum.Enum):
    USER = "user"
    PROPERTY_MANAGER = "property_manager"
    MAINTENANCE = "maintenance"
    ADMIN = "admin"

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    is_active = Column(Boolean(), default=True)
    role = Column(String, default=UserRole.USER, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    last_login = Column(DateTime, nullable=True)

    # Relationships (using string reference to avoid circular imports)
    properties = relationship("Property", back_populates="owner")

    def __repr__(self):
        return f"<User {self.email}>"

    @property
    def full_name(self) -> str:
        return f"{self.first_name} {self.last_name}" if self.first_name and self.last_name else self.email
