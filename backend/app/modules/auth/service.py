from typing import Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime
import logging  # Adicione esta importação

from .repository import AuthRepository
from app.core.security import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    create_refresh_token,
    decode_token
)
from app.core.config import settings

# Configuração básica do logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


class AuthService:
    """Service layer para lógica de negócio de autenticação."""
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = AuthRepository(db)
    
    def register(self, data: dict) -> Tuple[dict, dict]:
        logger.info("[AuthService/Register] Iniciando registro do usuário")

        # Renomear o campo 'name' para 'full_name'
        data["full_name"] = data.pop("name", None)

        # Renomear o campo 'profileType' para 'profile_type' e garantir que esteja em maiúsculas
        data["profile_type"] = data.pop("profileType", "borrower").upper()

        # Renomear o campo 'userType' para 'user_type' e garantir que esteja em maiúsculas
        data["user_type"] = data.pop("userType", "individual").upper()

        # Substituir string vazia por None para 'date_of_birth'
        if not data.get("date_of_birth"):
            data["date_of_birth"] = None

        # Verifica se o email já está em uso
        if self.repository.get_user_by_email(data["email"]):
            logger.error("[AuthService/Register] Email já está em uso")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email já está em uso."
            )

        # Verifica se o CPF/CNPJ já está em uso
        if self.repository.get_user_by_cpf_cnpj(data["cpf_cnpj"]):
            logger.error("[AuthService/Register] CPF ou CNPJ já está em uso")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CPF ou CNPJ já está em uso."
            )

        # Cria o hash da senha e remove o campo 'password'
        data["password_hash"] = get_password_hash(data.pop("password"))

        # Cria o usuário no banco de dados
        try:
            user = self.repository.create_user(data)
            logger.info("[AuthService/Register] Usuário criado com sucesso: %s", user.email)
        except Exception as e:
            logger.error("[AuthService/Register] Erro ao criar usuário: %s", str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar usuário no banco de dados."
            )

        # Gera tokens de autenticação
        tokens = {
            "access_token": create_access_token({"sub": user.email}),
            "refresh_token": create_refresh_token({"sub": user.email}),
        }

        return tokens, user.to_dict()
    
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
