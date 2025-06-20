from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, DateTime, ForeignKey, JSON, Boolean
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class BankConnectionStatus(str, Enum):
    CONNECTED = "connected"
    DISCONNECTED = "disconnected"
    ERROR = "error"
    PENDING = "pending"


class BankConnection(Base):
    __tablename__ = "bank_connections"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    
    # Bank connection details
    institution_id = Column(String, nullable=False)  # e.g., "santander_uk"
    institution_name = Column(String, nullable=False)  # e.g., "Santander UK"
    status = Column(String, default=BankConnectionStatus.PENDING)
    last_synced_at = Column(DateTime)
    
    # OAuth/API credentials (encrypted in production)
    access_token = Column(String)
    refresh_token = Column(String)
    expires_at = Column(DateTime)
    
    # Additional metadata
    consent_id = Column(String)  # Reference to Open Banking consent
    raw_data = Column(JSON)  # Store raw bank connection data
    
    # Relationships
    user = relationship("User", back_populates="bank_connections")
    accounts = relationship("BankAccount", back_populates="connection", cascade="all, delete-orphan")
    transactions = relationship("Transaction", back_populates="bank_connection", cascade="all, delete-orphan")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "institution_id": self.institution_id,
            "institution_name": self.institution_name,
            "status": self.status,
            "last_synced_at": self.last_synced_at.isoformat() if self.last_synced_at else None,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat(),
            "accounts": [account.to_dict() for account in self.accounts] if self.accounts else []
        }


class BankAccount(Base):
    __tablename__ = "bank_accounts"
    
    id = Column(String, primary_key=True, index=True)
    connection_id = Column(String, ForeignKey("bank_connections.id"), nullable=False)
    
    # Account details
    account_id = Column(String, nullable=False)  # ID from the bank
    account_name = Column(String)
    account_number = Column(String)
    sort_code = Column(String)
    iban = Column(String)
    currency = Column(String, default="GBP")
    account_type = Column(String)  # e.g., "current", "savings"
    
    # Balance information
    current_balance = Column(String)
    available_balance = Column(String)
    credit_limit = Column(String)
    
    # Additional metadata
    is_primary = Column(Boolean, default=False)
    raw_data = Column(JSON)  # Store raw account data
    
    # Relationships
    connection = relationship("BankConnection", back_populates="accounts")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "account_id": self.account_id,
            "account_name": self.account_name,
            "account_number": self.account_number,
            "sort_code": self.sort_code,
            "iban": self.iban,
            "currency": self.currency,
            "account_type": self.account_type,
            "current_balance": self.current_balance,
            "available_balance": self.available_balance,
            "is_primary": self.is_primary,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
