from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("")
def get_transaction_history(db: Session = Depends(get_db)):
    """
    Histórico de transações do usuário.
    
    TODO: Implementar lógica de negócio.
    """
    return {"message": "Endpoint not implemented yet"}
