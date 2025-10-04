# web-admin-backend/app/schemas.py
from pydantic import BaseModel, Field
from typing import Optional
from datetime import datetime

# --- Utility Schemas ---
class Status(BaseModel):
    status: str

# --- Account Schemas (User Management) ---
class AccountBase(BaseModel):
    username: str = Field(min_length=3, max_length=50)
    is_active: bool = True
    dedicated_ip: Optional[str] = None

class AccountCreate(AccountBase):
    # Password required for creation
    password: str = Field(min_length=8)

class AccountUpdate(AccountBase):
    # Only optional fields for updates
    username: Optional[str] = None
    is_active: Optional[bool] = None
    new_password: Optional[str] = None
    dedicated_ip: Optional[str] = None

class AccountOut(AccountBase):
    id: int
    created_at: datetime
    # Nested Quota (Optional)
    monthly_limit: Optional[int] = None
    monthly_sent: Optional[int] = None

    class Config:
        from_attributes = True

# --- Quota Schemas ---
class QuotaBase(BaseModel):
    monthly_limit: int = Field(ge=1) # greater than or equal to 1
    monthly_sent: int = Field(ge=0)
    rate_limit_per_minute: int = Field(ge=1)
    rate_limit_per_second: int = Field(ge=1)

class QuotaUpdate(QuotaBase):
    # For updates, all fields are optional
    monthly_limit: Optional[int] = None
    monthly_sent: Optional[int] = None
    rate_limit_per_minute: Optional[int] = None
    rate_limit_per_second: Optional[int] = None
    
# --- Blacklist Schemas ---
class BlacklistBase(BaseModel):
    entity_value: str
    entity_type: str = Field(pattern=r"^(domain|ip|keyword)$")
    is_active: bool = True

class BlacklistOut(BlacklistBase):
    id: int

    class Config:
        from_attributes = True