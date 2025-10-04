from typing import Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime

from .repository import AuthRepository
from app.core.security import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    create_refresh_token,
    decode_token
)
from app.core.config import settings


class AuthService:
    """Service layer para lógica de negócio de autenticação."""
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = AuthRepository(db)
    
    def register(self, data: dict) -> Tuple[dict, dict]:
        """
        Registra novo usuário ou investidor.
        
        Args:
            data: Dicionário com dados de registro contendo:
                - email: str
                - password: str
                - confirm_password: str
                - full_name: str
                - cpf_cnpj: str
                - phone: str (opcional)
                - date_of_birth: str ou date (opcional)
                - is_investor: bool
                - investor_type: str (se is_investor=True)
                - risk_profile: str (se is_investor=True)
                - investment_capacity: float (se is_investor=True)
        
        Returns:
            Tuple[tokens_dict, user_data_dict]
        """
        # Validação básica
        if data.get('password') != data.get('confirm_password'):
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Passwords do not match"
            )
        
        is_investor = data.get('is_investor', False)
        
        # Verificar se email já existe
        if is_investor:
            existing = self.repository.get_investor_by_email(data['email'])
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            existing_doc = self.repository.get_investor_by_cpf_cnpj(data['cpf_cnpj'])
            if existing_doc:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="CPF/CNPJ already registered"
                )
        else:
            existing = self.repository.get_user_by_email(data['email'])
            if existing:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="Email already registered"
                )
            existing_doc = self.repository.get_user_by_cpf_cnpj(data['cpf_cnpj'])
            if existing_doc:
                raise HTTPException(
                    status_code=status.HTTP_400_BAD_REQUEST,
                    detail="CPF/CNPJ already registered"
                )
        
        # Hash da senha
        password_hash = get_password_hash(data['password'])
        
        # Determinar tipo de documento
        document_type = 'CNPJ' if len(data['cpf_cnpj']) == 14 else 'CPF'
        
        # Preparar dados para o banco
        entity_data = {
            "email": data['email'],
            "password_hash": password_hash,
            "full_name": data['full_name'],
            "phone": data.get('phone'),
            "cpf_cnpj": data['cpf_cnpj'],
            "document_type": document_type,
            "date_of_birth": data.get('date_of_birth'),
        }
        
        # Criar entidade
        if is_investor:
            entity = self.repository.create_investor(entity_data)
            entity_id = entity.investor_id
            user_type = "investor"
        else:
            entity = self.repository.create_user(entity_data)
            entity_id = entity.user_id
            user_type = "user"
        
        # Gerar tokens
        tokens = self._generate_tokens(entity_id, data['email'], user_type)
        
        # Preparar resposta
        user_response = self._entity_to_dict(entity, user_type)
        
        return tokens, user_response
    
    def login(self, email: str, password: str) -> Tuple[dict, dict]:
        """
        Autentica usuário e retorna tokens.
        
        Args:
            email: Email do usuário
            password: Senha do usuário
        
        Returns:
            Tuple[tokens_dict, user_data_dict]
        """
        # Tentar encontrar usuário ou investidor
        user = self.repository.get_user_by_email(email)
        investor = self.repository.get_investor_by_email(email)
        
        if not user and not investor:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Verificar senha
        entity = user if user else investor
        if not verify_password(password, entity.password_hash):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid email or password"
            )
        
        # Determinar tipo
        if user:
            entity_id = user.user_id
            user_type = "user"
        else:
            entity_id = investor.investor_id
            user_type = "investor"
        
        # Gerar tokens
        tokens = self._generate_tokens(entity_id, email, user_type)
        
        # Preparar resposta
        user_response = self._entity_to_dict(entity, user_type)
        
        return tokens, user_response
    
    def refresh_access_token(self, refresh_token: str) -> dict:
        """
        Gera novo access token a partir do refresh token.
        
        Args:
            refresh_token: Token de refresh válido
        
        Returns:
            dict com novo access_token e refresh_token
        """
        payload = decode_token(refresh_token)
        
        if not payload:
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid or expired refresh token"
            )
        
        if payload.get("token_type") != "refresh":
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token type"
            )
        
        # Gerar novo access token
        tokens = self._generate_tokens(
            payload.get("sub"),
            payload.get("email"),
            payload.get("type", "user")
        )
        
        return tokens
    
    def get_current_user(self, token: str) -> dict:
        """
        Obtém usuário autenticado atual a partir do token.
        
        Args:
            token: JWT token
        
        Returns:
            dict com dados do usuário
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
        
        # Buscar entidade
        if user_type == "user":
            entity = self.repository.get_user_by_id(user_id)
            if not entity:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="User not found"
                )
        else:
            entity = self.repository.get_investor_by_id(user_id)
            if not entity:
                raise HTTPException(
                    status_code=status.HTTP_404_NOT_FOUND,
                    detail="Investor not found"
                )
        
        return self._entity_to_dict(entity, user_type)
    
    def _generate_tokens(self, entity_id: str, email: str, user_type: str) -> dict:
        """Gera access e refresh tokens."""
        token_data = {
            "sub": entity_id,
            "email": email,
            "type": user_type
        }
        
        access_token = create_access_token(token_data)
        refresh_token = create_refresh_token(token_data)
        
        return {
            "access_token": access_token,
            "refresh_token": refresh_token,
            "token_type": "bearer",
            "expires_in": settings.JWT_ACCESS_TOKEN_EXPIRE_MINUTES * 60
        }
    
    def _entity_to_dict(self, entity: Any, user_type: str) -> dict:
        """Converte entidade SQLAlchemy para dicionário."""
        if user_type == "user":
            return {
                "user_id": entity.user_id,
                "email": entity.email,
                "full_name": entity.full_name,
                "phone": entity.phone,
                "cpf_cnpj": entity.cpf_cnpj,
                "document_type": entity.document_type.value if hasattr(entity.document_type, 'value') else entity.document_type,
                "date_of_birth": entity.date_of_birth.isoformat() if entity.date_of_birth else None,
                "credit_score": entity.credit_score,
                "kyc_approved": entity.kyc_approved,
                "created_at": entity.created_at.isoformat() if entity.created_at else None,
                "updated_at": entity.updated_at.isoformat() if entity.updated_at else None
            }
        else:  # investor
            return {
                "investor_id": entity.investor_id,
                "email": entity.email,
                "full_name": entity.full_name,
                "phone": entity.phone,
                "cpf_cnpj": entity.cpf_cnpj,
                "document_type": entity.document_type.value if hasattr(entity.document_type, 'value') else entity.document_type,
                "date_of_birth": entity.date_of_birth.isoformat() if entity.date_of_birth else None,
                "kyc_approved": entity.kyc_approved,
                "created_at": entity.created_at.isoformat() if entity.created_at else None,
                "updated_at": entity.updated_at.isoformat() if entity.updated_at else None
            }
