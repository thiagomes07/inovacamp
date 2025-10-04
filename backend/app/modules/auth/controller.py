from fastapi import APIRouter, Depends, status, HTTPException, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database import get_db
from .service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Registra novo usuário ou investidor.
    
    **Body JSON:**
    ```json
    {
        "email": "user@example.com",
        "password": "Password123!",
        "confirm_password": "Password123!",
        "full_name": "João Silva",
        "cpf_cnpj": "12345678901",
        "phone": "+5511999999999",
        "date_of_birth": "1990-01-01",
        "is_investor": false
    }
    ```
    
    Para investidores, adicionar:
    ```json
    {
        "is_investor": true,
        "investor_type": "individual",
        "risk_profile": "moderate",
        "investment_capacity": 50000.00
    }
    ```
    
    **Retorna:**
    - tokens: access_token e refresh_token
    - user: dados do usuário/investidor criado
    """
    service = AuthService(db)
    tokens, user_data = service.register(data)
    
    return {
        "message": "Registration successful",
        "tokens": tokens,
        "user": user_data
    }


@router.post("/login")
def login(
    data: Dict[str, str] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Autentica usuário e retorna tokens de acesso.
    
    **Body JSON:**
    ```json
    {
        "email": "user@example.com",
        "password": "Password123!"
    }
    ```
    
    **Retorna:**
    - tokens: access_token e refresh_token
    - user: dados do usuário/investidor autenticado
    """
    email = data.get("email")
    password = data.get("password")
    
    if not email or not password:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required"
        )
    
    service = AuthService(db)
    tokens, user_data = service.login(email, password)
    
    return {
        "message": "Login successful",
        "tokens": tokens,
        "user": user_data
    }


@router.post("/refresh")
def refresh_token(
    data: Dict[str, str] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Gera novo access token usando refresh token.
    
    **Body JSON:**
    ```json
    {
        "refresh_token": "eyJhbGc..."
    }
    ```
    
    **Retorna:**
    - Novo access_token (refresh_token permanece o mesmo)
    """
    refresh_token = data.get("refresh_token")
    
    if not refresh_token:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Refresh token is required"
        )
    
    service = AuthService(db)
    tokens = service.refresh_access_token(refresh_token)
    
    return tokens


@router.get("/me")
def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
):
    """
    Obtém informações do usuário autenticado atual.
    
    **Requer:**
    - Header: Authorization: Bearer <access_token>
    
    **Retorna:**
    - Dados do usuário ou investidor autenticado
    """
    service = AuthService(db)
    token = credentials.credentials
    user_data = service.get_current_user(token)
    
    return user_data


@router.post("/logout", status_code=status.HTTP_200_OK)
def logout():
    """
    Logout do usuário (remoção de tokens no client-side).
    
    **Nota:** Em uma implementação JWT stateless, o logout é feito no cliente
    removendo os tokens. Para maior segurança em produção, considere
    implementar uma blacklist de tokens ou usar Redis para rastrear tokens invalidados.
    """
    return {
        "message": "Logout successful. Please remove tokens from client."
    }
