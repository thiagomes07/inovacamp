from pydantic import BaseModel, EmailStr, Field, field_validator
from typing import Optional
from datetime import date
from app.core.security import validate_cpf, validate_cnpj


class RegisterUserRequest(BaseModel):
    """DTO for user registration."""
    email: EmailStr
    password: str = Field(..., min_length=8, description="Password must be at least 8 characters")
    full_name: str = Field(..., min_length=3, max_length=255)
    phone: Optional[str] = Field(None, max_length=20)
    cpf_cnpj: str = Field(..., min_length=11, max_length=14, description="CPF (11 digits) or CNPJ (14 digits)")
    document_type: str = Field(..., pattern="^(cpf|cnpj)$")
    date_of_birth: Optional[date] = None
    user_type: str = Field(..., pattern="^(user|investor)$", description="user for borrowers, investor for lenders")
    
    @field_validator('cpf_cnpj')
    @classmethod
    def validate_cpf_cnpj(cls, v, info):
        # Remove non-digit characters
        clean_value = ''.join(filter(str.isdigit, v))
        
        document_type = info.data.get('document_type')
        
        if document_type == 'cpf':
            if len(clean_value) != 11:
                raise ValueError('CPF must have 11 digits')
            if not validate_cpf(clean_value):
                raise ValueError('Invalid CPF')
        elif document_type == 'cnpj':
            if len(clean_value) != 14:
                raise ValueError('CNPJ must have 14 digits')
            if not validate_cnpj(clean_value):
                raise ValueError('Invalid CNPJ')
        
        return clean_value
    
    @field_validator('password')
    @classmethod
    def validate_password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(char.islower() for char in v):
            raise ValueError('Password must contain at least one lowercase letter')
        return v


class LoginRequest(BaseModel):
    """DTO for user login."""
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    """DTO for authentication token response."""
    access_token: str
    refresh_token: str
    token_type: str = "bearer"
    expires_in: int


class UserResponse(BaseModel):
    """DTO for user response."""
    user_id: str
    email: str
    full_name: str
    phone: Optional[str]
    cpf_cnpj: str
    document_type: str
    date_of_birth: Optional[date]
    credit_score: int
    kyc_approved: bool
    
    class Config:
        from_attributes = True


class InvestorResponse(BaseModel):
    """DTO for investor response."""
    investor_id: str
    email: str
    full_name: str
    phone: Optional[str]
    cpf_cnpj: str
    document_type: str
    date_of_birth: Optional[date]
    kyc_approved: bool
    
    class Config:
        from_attributes = True


class RefreshTokenRequest(BaseModel):
    """DTO for refresh token request."""
    refresh_token: str


class PasswordResetRequest(BaseModel):
    """DTO for password reset request."""
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    """DTO for password reset confirmation."""
    token: str
    new_password: str = Field(..., min_length=8)
    
    @field_validator('new_password')
    @classmethod
    def validate_password_strength(cls, v):
        if len(v) < 8:
            raise ValueError('Password must be at least 8 characters long')
        if not any(char.isdigit() for char in v):
            raise ValueError('Password must contain at least one digit')
        if not any(char.isupper() for char in v):
            raise ValueError('Password must contain at least one uppercase letter')
        if not any(char.islower() for char in v):
            raise ValueError('Password must contain at least one lowercase letter')
        return v
