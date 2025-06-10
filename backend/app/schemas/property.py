from pydantic import BaseModel, Field, validator
from typing import Optional, List
from datetime import datetime
from enum import Enum

class PropertyType(str, Enum):
    RESIDENTIAL = "residential"
    COMMERCIAL = "commercial"
    MIXED = "mixed"

# Shared properties
class PropertyBase(BaseModel):
    name: Optional[str] = None
    address_line1: Optional[str] = None
    address_line2: Optional[str] = None
    city: Optional[str] = None
    postal_code: Optional[str] = None
    region: Optional[str] = None
    country_iso: Optional[str] = None
    property_type: Optional[PropertyType] = PropertyType.RESIDENTIAL
    default_vat_rate: Optional[float] = 0.0

    @validator('country_iso')
    def validate_country_iso(cls, v):
        if v and len(v) != 2:
            raise ValueError('Country ISO code must be 2 characters')
        return v.upper() if v else v

    @validator('default_vat_rate')
    def validate_vat_rate(cls, v):
        if v is not None and (v < 0 or v > 100):
            raise ValueError('VAT rate must be between 0 and 100')
        return v

# Properties to receive via API on creation
class PropertyCreate(PropertyBase):
    name: str = Field(..., min_length=1, max_length=200)
    address_line1: str = Field(..., min_length=1, max_length=200)
    city: str = Field(..., min_length=1, max_length=100)
    postal_code: str = Field(..., min_length=1, max_length=20)
    country_iso: str = Field(..., min_length=2, max_length=2)
    property_type: PropertyType = PropertyType.RESIDENTIAL
    default_vat_rate: float = Field(0.0, ge=0, le=100)

# Properties to receive via API on update
class PropertyUpdate(PropertyBase):
    pass

# Properties shared by models stored in DB
class PropertyInDBBase(PropertyBase):
    id: int
    name: str
    address_line1: str
    city: str
    postal_code: str
    country_iso: str
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

# Properties to return to client
class Property(PropertyInDBBase):
    pass

# Properties to return to client with relationships
class PropertyWithStats(Property):
    unit_count: int = 0
    vacancy_rate: float = 0.0
    total_rent: float = 0.0

# Properties stored in DB
class PropertyInDB(PropertyInDBBase):
    pass