# schemas.py

from pydantic import BaseModel, EmailStr
from typing import List, Optional
from datetime import datetime, timedelta

# Token model for JWT
class Token(BaseModel):
    access_token: str
    token_type: str

# User model for request and response
class User(BaseModel):
    username: str
    email: str
    password: str
    role: str = "Guest"  # Default role

# User model with hashed password for internal DB use
class UserInDB(User):
    password: str

# File model for file upload
class File(BaseModel):
    file_name: str

# Login response model
class LoginResponse(BaseModel):
    message: str

# Profile response model
class ProfileResponse(BaseModel):
    message: str

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LoginResponse(BaseModel):
    access_token: str
    token_type: str
    username: str
    email: str
    message: str
    mfa_required: Optional[bool] = False
    role: str

class OtpRequest(BaseModel):
    otp: str
    email: str

class RegisterResponse(BaseModel):
    message: str
    username: str
    email: str
    role: str

class FileMetadata(BaseModel):
    id: int
    file_name: str
    permission: Optional[str]

    class Config:
        orm_mode = True  # Tells Pydantic to treat ORM models as dicts


# Create a ShareLink Pydantic model
class ShareLinkRequest(BaseModel):
    file_id: int
    user_ids: List[int]
    permission: str  # 'view' or 'download'
    expiration_minutes: int  # Expiration time in minutes

class ShareLinkResponse(BaseModel):
    link: str
    expiration_time: datetime
    permission: str
    file_id: int