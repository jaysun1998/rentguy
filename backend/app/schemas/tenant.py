from pydantic import BaseModel, Field, EmailStr, validator
from typing import Optional
from datetime import datetime, date
from enum import Enum

class ScreeningStatus(str, Enum):
    NOT_SUBMITTED = "not_submitted"
    PENDING = "pending"
    APPROVED = "approved"
    DENIED = "denied"

# Tenant schemas
class TenantBase(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    email: Optional[EmailStr] = None
    phone_number: Optional[str] = None
    date_of_birth: Optional[date] = None
    nationality_iso: Optional[str] = None

    @validator('nationality_iso')
    def validate_nationality_iso(cls, v):
        if v and len(v) != 2:
            raise ValueError('Nationality ISO code must be 2 characters')
        return v.upper() if v else v

class TenantCreate(TenantBase):
    first_name: str = Field(..., min_length=1, max_length=100)
    last_name: str = Field(..., min_length=1, max_length=100)
    email: EmailStr
    phone_number: Optional[str] = Field(None, max_length=20)
    date_of_birth: Optional[date] = None
    nationality_iso: Optional[str] = Field(None, min_length=2, max_length=2)

class TenantUpdate(TenantBase):
    pass

class TenantInDBBase(TenantBase):
    id: int
    first_name: str
    last_name: str
    email: EmailStr
    owner_id: int
    created_at: datetime
    updated_at: datetime

    class Config:
        from_attributes = True

class Tenant(TenantInDBBase):
    pass

class TenantInDB(TenantInDBBase):
    pass

# Screening schemas
class ScreeningResultBase(BaseModel):
    screening_provider: Optional[str] = "internal"
    status: Optional[ScreeningStatus] = ScreeningStatus.NOT_SUBMITTED
    result_data: Optional[str] = None

class ScreeningResultCreate(BaseModel):
    tenant_id: int
    screening_provider: str = "internal"

class ScreeningResultUpdate(ScreeningResultBase):
    status: Optional[ScreeningStatus] = None
    result_data: Optional[str] = None
    completed_at: Optional[datetime] = None

class ScreeningResultInDBBase(ScreeningResultBase):
    id: int
    tenant_id: int
    status: ScreeningStatus
    requested_at: datetime
    completed_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class ScreeningResult(ScreeningResultInDBBase):
    pass

class ScreeningResultInDB(ScreeningResultInDBBase):
    pass

# Combined tenant with screening status
class TenantWithScreening(Tenant):
    screening_status: Optional[ScreeningStatus] = ScreeningStatus.NOT_SUBMITTED