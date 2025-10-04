from sqlalchemy.orm import Session
from typing import List, Dict

from .repository import TransactionRepository


class TransactionService:
    """Service layer para lógica de negócio de transações."""
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = TransactionRepository(db)
    
    def _entity_to_dict(self, transaction) -> dict:
        """Converte entidade Transaction para dicionário."""
        return {
            "id": transaction.id,
            "type": transaction.type,
            "amount": float(transaction.amount),
            "from_wallet_id": transaction.from_wallet_id,
            "to_wallet_id": transaction.to_wallet_id,
            "status": transaction.status,
            "created_at": transaction.created_at.isoformat() if transaction.created_at else None
        }
    
    def get_wallet_transactions(self, wallet_id: int) -> List[dict]:
        """Lista transações de uma carteira."""
        transactions = self.repository.get_by_wallet(wallet_id)
        return [self._entity_to_dict(t) for t in transactions]
    
    def get_transaction_detail(self, transaction_id: int) -> dict:
        """Obtém detalhes de uma transação."""
        transaction = self.repository.get_by_id(transaction_id)
        return self._entity_to_dict(transaction) if transaction else None
