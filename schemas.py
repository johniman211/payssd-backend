# 📁 schemas.py
from pydantic import BaseModel, EmailStr

class UserCreate(BaseModel):
    email: EmailStr
    full_name: str
    password: str

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class UserResponse(BaseModel):
    id: int
    email: EmailStr
    full_name: str
    is_admin: bool
    is_verified: bool

    class Config:
        orm_mode = True

class KYCSubmit(BaseModel):
    user_id: int
    national_id: str
    photo: str  # This can be a file path or URL

class KYCResponse(BaseModel):
    id: int
    user_id: int
    national_id: str
    photo: str
    status: str

    class Config:
        orm_mode = True
