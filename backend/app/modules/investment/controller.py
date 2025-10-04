from fastapi import APIRouter, Depends, status, Body
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database import get_db
from .service import InvestmentService

router = APIRouter(prefix="/investment", tags=["Investment"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_investment(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Cria novo investimento em um pool.
    
    **Ainda não implementado - Placeholder**
    """
    service = InvestmentService(db)
    result = service.create_investment(data)
    return {"message": "Investment created", "data": result}


@router.get("/investor/{investor_id}")
def get_investor_investments(
    investor_id: str,
    db: Session = Depends(get_db)
):
    """
    Lista todos os investimentos de um investidor.
    
    **Ainda não implementado - Placeholder**
    """
    service = InvestmentService(db)
    result = service.get_investor_investments(investor_id)
    return result
