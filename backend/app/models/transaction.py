from datetime import datetime
from enum import Enum
from sqlalchemy import Column, String, Numeric, DateTime, ForeignKey, JSON, Enum as SQLAlchemyEnum
from sqlalchemy.orm import relationship
from app.db.base_class import Base


class TransactionType(str, Enum):
    INCOME = "income"
    EXPENSE = "expense"
    TRANSFER = "transfer"


class TransactionStatus(str, Enum):
    PENDING = "pending"
    COMPLETED = "completed"
    FAILED = "failed"
    CANCELLED = "cancelled"


class Transaction(Base):
    __tablename__ = "transactions"

    id = Column(String, primary_key=True, index=True)
    user_id = Column(String, ForeignKey("users.id"), nullable=False)
    bank_connection_id = Column(String, ForeignKey("bank_connections.id"), nullable=True)
    
    # Transaction details
    amount = Column(Numeric(10, 2), nullable=False)
    currency = Column(String(3), default="GBP")
    description = Column(String)
    reference = Column(String)
    
    # Categorization
    type = Column(SQLAlchemyEnum(TransactionType), nullable=False)
    category = Column(String)
    subcategory = Column(String)
    
    # Status and timing
    status = Column(SQLAlchemyEnum(TransactionStatus), default=TransactionStatus.COMPLETED)
    booking_date = Column(DateTime, nullable=False)
    value_date = Column(DateTime, nullable=False)
    
    # Bank metadata
    bank_transaction_id = Column(String, unique=True)
    bank_account_id = Column(String)
    raw_data = Column(JSON)  # Store raw bank data
    
    # Relationships
    user = relationship("User", back_populates="transactions")
    bank_connection = relationship("BankConnection", back_populates="transactions")
    
    # Timestamps
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    def to_dict(self):
        return {
            "id": self.id,
            "amount": float(self.amount) if self.amount else None,
            "currency": self.currency,
            "description": self.description,
            "reference": self.reference,
            "type": self.type.value,
            "category": self.category,
            "subcategory": self.subcategory,
            "status": self.status.value,
            "booking_date": self.booking_date.isoformat(),
            "value_date": self.value_date.isoformat() if self.value_date else None,
            "bank_account_id": self.bank_account_id,
            "created_at": self.created_at.isoformat(),
            "updated_at": self.updated_at.isoformat()
        }
