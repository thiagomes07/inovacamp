from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from .service import TransactionService

router = APIRouter(prefix="/transactions", tags=["Transactions"])


@router.get("/wallet/{wallet_id}")
def get_wallet_transactions(
    wallet_id: int,
    db: Session = Depends(get_db)
):
    """
    Lista transações de uma carteira específica.
    """
    service = TransactionService(db)
    transactions = service.get_wallet_transactions(wallet_id)
    return {"transactions": transactions}


@router.get("/{transaction_id}")
def get_transaction_detail(
    transaction_id: int,
    db: Session = Depends(get_db)
):
    """
    Obtém detalhes de uma transação.
    """
    service = TransactionService(db)
    transaction = service.get_transaction_detail(transaction_id)
    return transaction if transaction else {"error": "Transaction not found"}
