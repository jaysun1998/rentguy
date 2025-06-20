from sqlalchemy import Boolean, Column, Integer, String, DateTime, func
from sqlalchemy.orm import relationship

from app.db.base_class import Base
from app.models.enums import UserRole

class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    is_active = Column(Boolean(), default=True)
    is_superuser = Column(Boolean(), default=False, nullable=False, index=True)
    role = Column(String, default=UserRole.USER, nullable=False)
    created_at = Column(DateTime, server_default=func.now())
    updated_at = Column(DateTime, server_default=func.now(), onupdate=func.now())
    last_login = Column(DateTime, nullable=True)
    phone_number = Column(String, nullable=True)
    profile_picture = Column(String, nullable=True)
    
    # Relationships (using string reference to avoid circular imports)
    properties = relationship("Property", back_populates="owner")
    bank_connections = relationship("BankConnection", back_populates="user")
    transactions = relationship("Transaction", back_populates="user")

    def __repr__(self):
        return f"<User {self.email} (ID: {self.id})>"

    @property
    def full_name(self) -> str:
        """Return the full name of the user."""
        return f"{self.first_name} {self.last_name}" if self.first_name and self.last_name else self.email
    
    @property
    def is_admin(self) -> bool:
        """Check if the user has admin role."""
        return self.role == "admin" or self.is_superuser
    
    def set_password(self, password: str):
        """
        Set the user's password (hashed).
        This should be called with the plaintext password, which will be hashed.
        """
        from app.core.security import get_password_hash
        self.hashed_password = get_password_hash(password)
    
    def check_password(self, password: str) -> bool:
        """
        Check if the provided password matches the user's hashed password.
        """
        from app.core.security import verify_password
        return verify_password(password, self.hashed_password)
