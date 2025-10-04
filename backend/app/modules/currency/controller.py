from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database import get_db
from .service import CurrencyService

router = APIRouter(prefix="/currency", tags=["Currency"])


@router.post("/convert")
def convert_currency(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Converte valor entre moedas.
    
    **Ainda não implementado - Placeholder**
    """
    service = CurrencyService(db)
    result = service.convert_currency(
        data.get("amount"),
        data.get("from_currency"),
        data.get("to_currency")
    )
    return result


@router.get("/rates")
def get_exchange_rates(db: Session = Depends(get_db)):
    """
    Retorna taxas de câmbio atuais.
    
    **Ainda não implementado - Placeholder**
    """
    return {"message": "Exchange rates not implemented"}
