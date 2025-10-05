from sqlalchemy.orm import Session
from typing import List, Dict
from app.models.models import Transaction

from .repository import TransactionRepository


class TransactionService:
    """Service layer para lógica de negócio de transações."""
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = TransactionRepository(db)
    
    def _entity_to_dict(self, transaction: Transaction) -> dict:
        """Converte entidade Transaction para dicionário."""
        return {
            "transaction_id": transaction.transaction_id,
            "type": transaction.type.value if hasattr(transaction.type, 'value') else transaction.type,
            "amount": float(transaction.amount) if transaction.amount else 0,
            "sender_id": transaction.sender_id,
            "receiver_id": transaction.receiver_id,
            "wallet_id": transaction.wallet_id,
            "currency": transaction.currency.value if hasattr(transaction.currency, 'value') else transaction.currency,
            "status": transaction.status.value if hasattr(transaction.status, 'value') else transaction.status,
            "description": transaction.description,
            "created_at": transaction.created_at.isoformat() if transaction.created_at else None
        }
    
    def get_wallet_transactions(self, wallet_id: str) -> List[dict]:
        """
        Lista transações de uma carteira.
        
        Busca todas as transações onde wallet_id corresponde.
        """
        transactions = self.db.query(Transaction).filter(
            Transaction.wallet_id == wallet_id
        ).order_by(Transaction.created_at.desc()).limit(50).all()
        
        return [self._entity_to_dict(t) for t in transactions]
    
    def get_transaction_detail(self, transaction_id: str) -> dict:
        """Obtém detalhes de uma transação."""
        transaction = self.db.query(Transaction).filter(
            Transaction.transaction_id == transaction_id
        ).first()
        
        return self._entity_to_dict(transaction) if transaction else None
