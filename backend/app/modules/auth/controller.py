from fastapi import APIRouter, Depends, status, HTTPException, Body
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session
from typing import Dict, Any
import logging

from app.database import get_db
from .service import AuthService

router = APIRouter(prefix="/auth", tags=["Authentication"])
security = HTTPBearer()

# Configuração básica de logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def is_valid_cpf(cpf: str) -> bool:
    """Valida o CPF verificando os dígitos verificadores."""
    # Hackathon: Aceitar qualquer CPF
    return True


@router.post("/register", status_code=status.HTTP_201_CREATED)
def register(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    logger.info("[Auth/Register] Dados recebidos: %s", data)

    # Validação dos campos obrigatórios
    required_fields = ["name", "email", "password", "cpf_cnpj", "document_type"]
    for field in required_fields:
        if not data.get(field):
            logger.error(f"[Auth/Register] Campo obrigatório ausente: {field}")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"O campo '{field}' é obrigatório."
            )

    # Validação do CPF/CNPJ
    cpf_cnpj = data["cpf_cnpj"].replace(".", "").replace("-", "").replace("/", "")
    document_type = data["document_type"]

    if document_type == "CPF":
        if len(cpf_cnpj) < 11:  # Aceitar CPF com pelo menos 11 caracteres
            logger.error("[Auth/Register] CPF inválido")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CPF inválido."
            )
    elif document_type == "CNPJ":
        if len(cpf_cnpj) < 14:  # Aceitar CNPJ com pelo menos 14 caracteres
            logger.error("[Auth/Register] CNPJ inválido")
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="CNPJ inválido."
            )
    else:
        logger.error("[Auth/Register] Tipo de documento inválido")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Tipo de documento inválido. Deve ser 'CPF' ou 'CNPJ'."
        )

    service = AuthService(db)
    try:
        tokens, user_data = service.register(data)
        logger.info("[Auth/Register] Registro bem-sucedido para o usuário: %s", user_data["email"])
        return {
            "message": "Registration successful",
            "tokens": tokens,
            "user": user_data
        }
    except Exception as e:
        logger.error("[Auth/Register] Erro ao registrar usuário: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )


@router.post("/login")
def login(
    data: Dict[str, str] = Body(...),
    db: Session = Depends(get_db)
):
    logger.info("[Auth/Login] Dados recebidos: %s", data)

    email = data.get("email")
    password = data.get("password")

    if not email or not password:
        logger.warning("[Auth/Login] Email ou senha ausentes")
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email and password are required"
        )

    service = AuthService(db)
    try:
        tokens, user_data = service.login(email, password)
        logger.info("[Auth/Login] Login bem-sucedido para o usuário: %s", email)
        return {
            "message": "Login successful",
            "tokens": tokens,
            "user": user_data
        }
    except Exception as e:
        logger.error("[Auth/Login] Erro ao autenticar usuário: %s", str(e))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=str(e)
        )


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
