from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database import get_db
from .service import DepositService

router = APIRouter(prefix="/deposit", tags=["Deposit"])


@router.post("/process")
def process_deposit(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Processa um depósito.
    
    **Ainda não implementado - Placeholder**
    """
    service = DepositService(db)
    result = service.process_deposit(data)
    return result
