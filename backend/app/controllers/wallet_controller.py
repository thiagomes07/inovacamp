from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter(prefix="/wallet", tags=["Wallets"])


@router.get("/balances")
def get_wallet_balances(db: Session = Depends(get_db)):
    """
    Saldos multi-moeda da carteira.
    
    TODO: Implementar lógica de negócio.
    """
    return {"message": "Endpoint not implemented yet"}
