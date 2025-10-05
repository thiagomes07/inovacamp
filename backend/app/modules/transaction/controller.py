from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from .service import TransactionService

router = APIRouter(prefix="/transaction", tags=["Transactions"])


@router.get("/wallet/{wallet_id}")
def get_wallet_transactions(
    wallet_id: str,
    db: Session = Depends(get_db)
):
    """
    Lista transações de uma carteira específica.
    
    Retorna todas as transações onde a carteira é remetente ou destinatário.
    """
    service = TransactionService(db)
    transactions = service.get_wallet_transactions(wallet_id)
    return transactions


@router.get("/{transaction_id}")
def get_transaction_detail(
    transaction_id: str,
    db: Session = Depends(get_db)
):
    """
    Obtém detalhes de uma transação específica.
    """
    service = TransactionService(db)
    transaction = service.get_transaction_detail(transaction_id)
    return transaction if transaction else {"error": "Transaction not found"}
