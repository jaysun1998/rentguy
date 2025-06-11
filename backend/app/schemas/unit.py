from pydantic import BaseModel, Field, validator
from typing import Optional
from datetime import datetime

# Shared properties
class UnitBase(BaseModel):
    unit_number: Optional[str] = None
    floor: Optional[int] = None
    bedrooms: Optional[int] = 0
    bathrooms: Optional[int] = 0
    square_meters: Optional[float] = None
    current_rent: Optional[float] = 0.0
    currency_iso: Optional[str] = "EUR"
    deposit_amount: Optional[float] = 0.0
    is_vacant: Optional[bool] = True

    @validator('currency_iso')
    def validate_currency_iso(cls, v):
        if v and len(v) != 3:
            raise ValueError('Currency ISO code must be 3 characters')
        return v.upper() if v else v

    @validator('current_rent', 'deposit_amount')
    def validate_amounts(cls, v):
        if v is not None and v < 0:
            raise ValueError('Amount must be non-negative')
        return v

# Properties to receive via API on creation
class UnitCreate(UnitBase):
    property_id: int
    unit_number: str = Field(..., min_length=1, max_length=50)
    bedrooms: int = Field(0, ge=0, le=20)
    bathrooms: int = Field(0, ge=0, le=20)
    current_rent: float = Field(0.0, ge=0)
    currency_iso: str = Field("EUR", min_length=3, max_length=3)
    deposit_amount: float = Field(0.0, ge=0)

# Properties to receive via API on update
class UnitUpdate(UnitBase):
    pass

# Properties shared by models stored in DB
class UnitInDBBase(UnitBase):
    id: int
    property_id: int
    unit_number: str
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Properties to return to client
class Unit(UnitInDBBase):
    pass

# Properties stored in DB
class UnitInDB(UnitInDBBase):
    pass