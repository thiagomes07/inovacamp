from fastapi import APIRouter, Depends, status, HTTPException
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from app.database import get_db
from app.services.auth_service import AuthService
from app.schemas.auth_schemas import (
    RegisterUserRequest,
    LoginRequest,
    TokenResponse,
    RefreshTokenRequest,
    UserResponse,
    InvestorResponse
)
from typing import Union

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()


@router.post("/register", response_model=dict, status_code=status.HTTP_201_CREATED)
def register(
    request: RegisterUserRequest,
    db: Session = Depends(get_db)
):
    """
    Register a new user or investor.
    
    - **email**: Valid email address
    - **password**: Minimum 8 characters, must include uppercase, lowercase, and number
    - **full_name**: Full name (3-255 characters)
    - **phone**: Phone number (optional)
    - **cpf_cnpj**: CPF (11 digits) or CNPJ (14 digits)
    - **document_type**: 'cpf' or 'cnpj'
    - **date_of_birth**: Date of birth (optional)
    - **user_type**: 'user' for borrowers, 'investor' for lenders
    
    Returns authentication tokens and user/investor data.
    """
    service = AuthService(db)
    tokens, user_data = service.register(request)
    
    return {
        "message": "Registration successful",
        "tokens": tokens.model_dump(),
        "user": user_data.model_dump()
    }


@router.post("/login", response_model=dict)
def login(
    request: LoginRequest,
    db: Session = Depends(get_db)
):
    """
    Authenticate user and return access tokens.
    
    - **email**: Registered email address
    - **password**: User password
    
    Returns authentication tokens and user/investor data.
    """
    service = AuthService(db)
    tokens, user_data = service.login(request)
    
    return {
        "message": "Login successful",
        "tokens": tokens.model_dump(),
        "user": user_data.model_dump()
    }


@router.post("/refresh", response_model=TokenResponse)
def refresh_token(
    request: RefreshTokenRequest,
    db: Session = Depends(get_db)
):
    """
    Generate new access token using refresh token.
    
    - **refresh_token**: Valid refresh token
    
    Returns new access token (refresh token remains the same).
    """
    service = AuthService(db)
    return service.refresh_access_token(request.refresh_token)


@router.get("/me", response_model=Union[UserResponse, InvestorResponse])
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Get current authenticated user information.
    
    Requires valid JWT token in Authorization header:
    Authorization: Bearer <token>
    
    Returns user or investor data.
    """
    service = AuthService(db)
    token = credentials.credentials
    return service.get_current_user(token)


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout():
    """
    Logout user (client-side token removal).
    
    Note: In a stateless JWT implementation, logout is handled client-side
    by removing the tokens. For enhanced security in production, consider
    implementing a token blacklist or using Redis to track invalidated tokens.
    """
    return {
        "message": "Logout successful. Please remove tokens from client."
    }
