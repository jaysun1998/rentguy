from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime, date
from enum import Enum

class LeaseStatus(str, Enum):
    PENDING_SIGNATURE = "pending_signature"
    ACTIVE = "active"
    EXPIRED = "expired"
    TERMINATED = "terminated"

# Shared properties
class LeaseBase(BaseModel):
    lease_start_date: Optional[date] = None
    lease_end_date: Optional[date] = None
    rent_amount: Optional[float] = None
    currency_iso: Optional[str] = "EUR"
    security_deposit: Optional[float] = 0.0
    deposit_currency_iso: Optional[str] = "EUR"
    vat_rate: Optional[float] = 0.0
    status: Optional[LeaseStatus] = LeaseStatus.PENDING_SIGNATURE

    @validator('currency_iso', 'deposit_currency_iso')
    def validate_currency_iso(cls, v):
        if v and len(v) != 3:
            raise ValueError('Currency ISO code must be 3 characters')
        return v.upper() if v else v

    @validator('rent_amount', 'security_deposit')
    def validate_amounts(cls, v):
        if v is not None and v < 0:
            raise ValueError('Amount must be non-negative')
        return v

    @validator('vat_rate')
    def validate_vat_rate(cls, v):
        if v is not None and (v < 0 or v > 100):
            raise ValueError('VAT rate must be between 0 and 100')
        return v

class LeaseCreate(LeaseBase):
    unit_id: int
    tenant_id: int
    lease_start_date: date
    lease_end_date: date
    rent_amount: float = Field(..., gt=0)
    currency_iso: str = Field("EUR", min_length=3, max_length=3)
    security_deposit: float = Field(0.0, ge=0)
    deposit_currency_iso: str = Field("EUR", min_length=3, max_length=3)
    vat_rate: float = Field(0.0, ge=0, le=100)

class LeaseUpdate(LeaseBase):
    pass

class LeaseSign(BaseModel):
    """Schema for signing a lease"""
    pass

class LeaseInDBBase(LeaseBase):
    id: int
    unit_id: int
    tenant_id: int
    lease_start_date: date
    lease_end_date: date
    rent_amount: float
    status: LeaseStatus
    digital_signed_at: Optional[datetime] = None
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Lease(LeaseInDBBase):
    pass

class LeaseInDB(LeaseInDBBase):
    pass