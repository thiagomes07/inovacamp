from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter(prefix="/currencies", tags=["Currency Exchange"])


@router.post("/swap", status_code=status.HTTP_201_CREATED)
def execute_currency_swap(db: Session = Depends(get_db)):
    """
    Executar swap de moedas (cripto ↔ fiat).
    
    TODO: Implementar lógica de negócio.
    """
    return {"message": "Endpoint not implemented yet"}


@router.get("/rates")
def get_currency_rates(db: Session = Depends(get_db)):
    """
    Cotações de moedas em tempo real.
    
    TODO: Implementar lógica de negócio.
    """
    return {"message": "Endpoint not implemented yet"}
