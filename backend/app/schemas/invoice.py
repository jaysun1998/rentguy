from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime, date
from enum import Enum

class InvoiceStatus(str, Enum):
    PENDING = "pending"
    PAID = "paid"
    OVERDUE = "overdue"
    CANCELLED = "cancelled"

# Shared properties
class InvoiceBase(BaseModel):
    issue_date: Optional[date] = None
    due_date: Optional[date] = None
    amount: Optional[float] = None
    vat_amount: Optional[float] = 0.0
    total_amount: Optional[float] = None
    currency_iso: Optional[str] = "EUR"
    status: Optional[InvoiceStatus] = InvoiceStatus.PENDING

    @validator('currency_iso')
    def validate_currency_iso(cls, v):
        if v and len(v) != 3:
            raise ValueError('Currency ISO code must be 3 characters')
        return v.upper() if v else v

    @validator('amount', 'vat_amount', 'total_amount')
    def validate_amounts(cls, v):
        if v is not None and v < 0:
            raise ValueError('Amount must be non-negative')
        return v

class InvoiceCreate(BaseModel):
    lease_id: int

class InvoiceUpdate(InvoiceBase):
    status: Optional[InvoiceStatus] = None
    paid_at: Optional[datetime] = None

class InvoiceInDBBase(InvoiceBase):
    id: int
    lease_id: int
    invoice_number: str
    issue_date: date
    due_date: date
    amount: float
    vat_amount: float
    total_amount: float
    status: InvoiceStatus
    paid_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Invoice(InvoiceInDBBase):
    pass

class InvoiceInDB(InvoiceInDBBase):
    pass

# VAT Entry schemas
class VATEntryBase(BaseModel):
    vat_rate: float
    net_amount: float
    vat_amount: float
    gross_amount: float
    country_iso: str

class VATEntryCreate(VATEntryBase):
    invoice_id: int

class VATEntryInDBBase(VATEntryBase):
    id: int
    invoice_id: int
    created_at: datetime

    class Config:
        from_attributes = True

class VATEntry(VATEntryInDBBase):
    pass

class VATEntryInDB(VATEntryInDBBase):
    pass