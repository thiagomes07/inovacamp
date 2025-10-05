from fastapi import APIRouter, Depends, status, Body
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database import get_db
from .service import CreditService

router = APIRouter(prefix="/credit", tags=["Credit"])


@router.post("/request", status_code=status.HTTP_201_CREATED)
def create_credit_request(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Cria nova solicitação de crédito.
    
    **Ainda não implementado - Placeholder**
    """
    service = CreditService(db)
    result = service.create_credit_request(data)
    
    return {
        "message": "Credit request created successfully",
        "data": result
    }


@router.get("/{request_id}")
def get_credit_request(
    request_id: str,
    db: Session = Depends(get_db)
):
    """
    Busca solicitação de crédito por ID.
    
    **Ainda não implementado - Placeholder**
    """
    service = CreditService(db)
    result = service.get_credit_request(request_id)
    
    return result


@router.get("/user/{user_id}")
def get_user_credit_requests(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Lista todas as solicitações de crédito de um usuário.
    
    **Ainda não implementado - Placeholder**
    """
    service = CreditService(db)
    result = service.get_user_credit_requests(user_id)
    
    return result


@router.get("/dashboard/{user_id}")
def get_borrower_dashboard(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Retorna dados consolidados do dashboard do tomador de crédito.
    
    Inclui:
    - Empréstimos ativos
    - Histórico de transações
    - Estatísticas gerais
    """
    service = CreditService(db)
    result = service.get_borrower_dashboard(user_id)
    
    return result


@router.get("/approved/{user_id}")
def get_approved_credit(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Retorna o total de crédito aprovado para um usuário.
    
    Soma todos os credit_requests com status APPROVED.
    """
    service = CreditService(db)
    result = service.get_approved_credit(user_id)
    
    return result
