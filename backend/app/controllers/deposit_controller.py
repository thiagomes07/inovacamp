from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter(prefix="/deposits", tags=["Deposits"])


@router.get("/methods")
def get_deposit_methods(db: Session = Depends(get_db)):
    """
    Métodos de depósito disponíveis (PIX, TED, Open Finance).
    
    TODO: Implementar lógica de negócio.
    """
    return {"message": "Endpoint not implemented yet"}


@router.post("/execute", status_code=status.HTTP_201_CREATED)
def execute_deposit(db: Session = Depends(get_db)):
    """
    Executar depósito.
    
    TODO: Implementar lógica de negócio.
    """
    return {"message": "Endpoint not implemented yet"}
