from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database import get_db
from .service import OpenFinanceService

router = APIRouter(prefix="/open-finance", tags=["Open Finance"])


@router.post("/authorize")
def authorize_bank_connection(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Autoriza conexão com banco via Open Finance.
    
    **Ainda não implementado - Placeholder**
    """
    service = OpenFinanceService(db)
    result = service.authorize_bank_connection(data)
    return result


@router.get("/accounts/{user_id}")
def get_bank_accounts(
    user_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtém contas bancárias conectadas do usuário.
    
    **Ainda não implementado - Placeholder**
    """
    service = OpenFinanceService(db)
    result = service.get_bank_accounts(user_id)
    return result


@router.get("/transactions/{account_id}")
def get_transactions_history(
    account_id: str,
    db: Session = Depends(get_db)
):
    """
    Obtém histórico de transações de uma conta bancária.
    
    **Ainda não implementado - Placeholder**
    """
    service = OpenFinanceService(db)
    result = service.get_transactions_history(account_id)
    return result
