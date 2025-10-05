from typing import Optional, Tuple, Dict, Any
from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from datetime import datetime
import logging
import uuid

from .repository import AuthRepository
from app.core.security import (
    verify_password, 
    get_password_hash, 
    create_access_token,
    create_refresh_token,
    decode_token
)
from app.core.config import settings
from app.models.models import Wallet, OwnerType, Currency

# Configuração básica do logger
logger = logging.getLogger(__name__)
logging.basicConfig(level=logging.INFO)


class AuthService:
    """Service layer para lógica de negócio de autenticação."""
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = AuthRepository(db)
    
    def register(self, data: dict) -> Tuple[dict, dict]:
        logger.info("[AuthService/Register] Iniciando registro")

        data["full_name"] = data.pop("name", None)
        
        # ✅ NORMALIZAÇÃO: Traduz LENDER para INVESTOR
        profile_type_from_request = data.pop("profileType", "BORROWER").upper()
        if profile_type_from_request == "LENDER":
            profile_type = "INVESTOR"
        else:
            profile_type = profile_type_from_request

        # Adiciona o user_type se não for um investidor
        if profile_type != "INVESTOR":
            data["user_type"] = data.pop("userType", "individual").upper()

        if not data.get("date_of_birth"):
            data["date_of_birth"] = None

        # --- LÓGICA DE VALIDAÇÃO E CRIAÇÃO ATUALIZADA ---
        
        # 1. Verifica duplicidade em ambas as tabelas
        email = data["email"]
        cpf_cnpj = data["cpf_cnpj"]
        if self.repository.get_user_by_email(email) or self.repository.get_investor_by_email(email):
            logger.error("[AuthService/Register] Email já está em uso")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email já está em uso."
            )
        if self.repository.get_user_by_cpf_cnpj(cpf_cnpj) or self.repository.get_investor_by_cpf_cnpj(cpf_cnpj):
            logger.error("[AuthService/Register] CPF ou CNPJ já está em uso")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CPF ou CNPJ já está em uso."
            )

        data["password_hash"] = get_password_hash(data.pop("password"))

        # 2. Direciona para o repositório correto baseado no profile_type normalizado
        entity = None
        entity_type_for_token = ""
        try:
            if profile_type == "INVESTOR":
                logger.info("[AuthService/Register] Criando um INVESTIDOR")
                # Remove campos que não existem na tabela investors
                data.pop("userType", None) # Remove userType se ainda existir
                
                entity = self.repository.create_investor(data)
                entity_type_for_token = "investor"
                logger.info("[AuthService/Register] Investidor criado com sucesso: %s", entity.email)
                
                # Criar carteira inicial para investidor com R$ 50.000
                self._create_initial_wallet(
                    owner_id=entity.investor_id,
                    owner_type=OwnerType.INVESTOR,
                    initial_balance=50000.0
                )
                
            else: # Padrão é BORROWER (User)
                logger.info("[AuthService/Register] Criando um USUÁRIO (Tomador)")
                # Garante que o profile_type correto seja salvo para o usuário
                data["profile_type"] = profile_type
                entity = self.repository.create_user(data)
                entity_type_for_token = "user"
                logger.info("[AuthService/Register] Usuário criado com sucesso: %s", entity.email)
                
                # Criar carteira inicial para tomador com R$ 5.000
                self._create_initial_wallet(
                    owner_id=entity.user_id,
                    owner_type=OwnerType.USER,
                    initial_balance=5000.0
                )

        except Exception as e:
            logger.error("[AuthService/Register] Erro ao criar no banco de dados: %s", str(e))
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Erro ao criar usuário no banco de dados."
            )

        # 3. Gera tokens e resposta com base na entidade criada
        entity_id = entity.user_id if hasattr(entity, 'user_id') else entity.investor_id
        tokens = self._generate_tokens(entity_id, entity.email, entity_type_for_token)
        
        user_response = self._entity_to_dict(entity, entity_type_for_token)

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
    
    def _create_initial_wallet(self, owner_id: str, owner_type: OwnerType, initial_balance: float):
        """Cria carteira inicial com saldo em BRL para novos usuários."""
        try:
            wallet_data = {
                "wallet_id": str(uuid.uuid4()),
                "owner_id": owner_id,
                "owner_type": owner_type,
                "currency": Currency.BRL,
                "balance": initial_balance
            }
            
            wallet = Wallet(**wallet_data)
            self.db.add(wallet)
            self.db.commit()
            
            logger.info(
                f"[AuthService] Carteira inicial criada: owner_id={owner_id}, "
                f"owner_type={owner_type.value}, balance=R$ {initial_balance:,.2f}"
            )
        except Exception as e:
            logger.error(f"[AuthService] Erro ao criar carteira inicial: {str(e)}")
            self.db.rollback()
            # Não falha o registro se a carteira não for criada
            # O usuário pode criar manualmente depois
    
    def _entity_to_dict(self, entity: Any, user_type: str) -> dict:
        if user_type == "user":
            # Usar calculated_score como fonte principal
            final_score = entity.calculated_score if entity.calculated_score is not None else entity.credit_score
            
            return {
                "user_id": entity.user_id,
                "email": entity.email,
                "full_name": entity.full_name,
                "phone": entity.phone,
                # ✅ ADICIONADO: Lendo os tipos diretamente da entidade User
                "profile_type": entity.profile_type.value if hasattr(entity.profile_type, 'value') else entity.profile_type,
                "user_type": entity.user_type.value if hasattr(entity.user_type, 'value') else entity.user_type,
                "cpf_cnpj": entity.cpf_cnpj,
                "document_type": entity.document_type.value if hasattr(entity.document_type, 'value') else entity.document_type,
                "date_of_birth": entity.date_of_birth.isoformat() if entity.date_of_birth else None,
                "credit_score": final_score,  # Usa calculated_score
                "kyc_approved": entity.kyc_approved,
                "created_at": entity.created_at.isoformat() if entity.created_at else None,
                "updated_at": entity.updated_at.isoformat() if entity.updated_at else None
            }
        else:  # investor
            return {
                "user_id": entity.investor_id, # Padronizado para user_id para consistência no frontend
                "email": entity.email,
                "full_name": entity.full_name,
                "phone": entity.phone,
                # ✅ ADICIONADO: Tipo de perfil implícito para investidores
                "profile_type": "INVESTOR",
                "cpf_cnpj": entity.cpf_cnpj,
                "document_type": entity.document_type.value if hasattr(entity.document_type, 'value') else entity.document_type,
                "date_of_birth": entity.date_of_birth.isoformat() if entity.date_of_birth else None,
                "kyc_approved": entity.kyc_approved,
                "credit_score": 0,  # Investidores não têm score
                "created_at": entity.created_at.isoformat() if entity.created_at else None,
                "updated_at": entity.updated_at.isoformat() if entity.updated_at else None
            }
