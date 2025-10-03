from typing import Optional, Tuple
from datetime import timedelta
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from app.repositories.auth_repository import AuthRepository
from app.schemas.auth_schemas import (
    RegisterUserRequest, 
    LoginRequest, 
    TokenResponse,
    UserResponse,
    InvestorResponse
)
from app.core.security import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    create_refresh_token,
    decode_token
)
from app.core.config import settings


class AuthService:
    """Service layer for authentication business logic."""
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = AuthRepository(db)
    
    def register(self, request: RegisterUserRequest) -> Tuple[TokenResponse, dict]:
        """
        Register a new user or investor.
        
        Returns:
            Tuple of (TokenResponse, UserResponse/InvestorResponse)
        """
        # Check if email already exists
        if request.user_type == "user":
            existing_user = self.repository.get_user_by_email(request.email)
            if existing_user:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            
            existing_document = self.repository.get_user_by_cpf_cnpj(request.cpf_cnpj)
            if existing_document:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="CPF/CNPJ already registered"
                )
        else:  # investor
            existing_investor = self.repository.get_investor_by_email(request.email)
            if existing_investor:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            
            existing_document = self.repository.get_investor_by_cpf_cnpj(request.cpf_cnpj)
            if existing_document:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="CPF/CNPJ already registered"
                )
        
        # Hash password
        password_hash = get_password_hash(request.password)
        
        # Prepare data
        user_data = {
            "email": request.email,
            "password_hash": password_hash,
            "full_name": request.full_name,
            "phone": request.phone,
            "cpf_cnpj": request.cpf_cnpj,
            "document_type": request.document_type,
            "date_of_birth": request.date_of_birth,
        }
        
        # Create user or investor
        if request.user_type == "user":
            user = self.repository.create_user(user_data)
            user_id = user.user_id
            response_data = UserResponse.model_validate(user)
        else:
            investor = self.repository.create_investor(user_data)
            user_id = investor.investor_id
            response_data = InvestorResponse.model_validate(investor)
        
        # Generate tokens
        token_data = {
            "sub": user_id,
            "email": request.email,
            "type": request.user_type
        }
        
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        tokens = TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
        
        return tokens, response_data
    
    def login(self, request: LoginRequest) -> Tuple[TokenResponse, dict]:
        """
        Authenticate user and return tokens.
        
        Returns:
            Tuple of (TokenResponse, UserResponse/InvestorResponse)
        """
        # Try to find user
        user = self.repository.get_user_by_email(request.email)
        investor = self.repository.get_investor_by_email(request.email)
        
        if not user and not investor:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verify password
        if user:
            if not verify_password(request.password, user.password_hash):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )
            user_id = user.user_id
            user_type = "user"
            response_data = UserResponse.model_validate(user)
        else:
            if not verify_password(request.password, investor.password_hash):
                raise HTTPException(
                    status_code=status.HTTP_401_UNAUTHORIZED,
                    detail="Invalid email or password"
                )
            user_id = investor.investor_id
            user_type = "investor"
            response_data = InvestorResponse.model_validate(investor)
        
        # Generate tokens
        token_data = {
            "sub": user_id,
            "email": request.email,
            "type": user_type
        }
        
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        tokens = TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,
            token_type="bearer",
            expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
        
        return tokens, response_data
    
    def refresh_access_token(self, refresh_token: str) -> TokenResponse:
        """
        Generate new access token from refresh token.
        """
        payload = decode_token(refresh_token)
        
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )
        
        if payload.get("type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        # Generate new access token
        token_data = {
            "sub": payload.get("sub"),
            "email": payload.get("email"),
            "type": payload.get("type", "user")
        }
        
        access_token = create_access_token(token_data)
        
        return TokenResponse(
            access_token=access_token,
            refresh_token=refresh_token,  # Keep the same refresh token
            token_type="bearer",
            expires_in=settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
        )
    
    def get_current_user(self, token: str) -> dict:
        """
        Get current authenticated user from token.
        """
        payload = decode_token(token)
        
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials",
                headers={"WWW-Authenticate": "Bearer"},
            )
        
        user_id = payload.get("sub")
        user_type = payload.get("type", "user")
        
        if not user_id:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Could not validate credentials"
            )
        
        if user_type == "user":
            user = self.repository.get_user_by_id(user_id)
            if not user:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
            return UserResponse.model_validate(user)
        else:
            investor = self.repository.get_investor_by_id(user_id)
            if not investor:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Investor not found"
                )
            return InvestorResponse.model_validate(investor)
