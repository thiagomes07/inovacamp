from sqlalchemy.orm import Session
from app.models.models import Transaction
from typing import List


class TransactionRepository:
    """Repository para operações de transação no banco de dados."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_by_wallet(self, wallet_id: int) -> List[Transaction]:
        """Busca transações de uma carteira."""
        return self.db.query(Transaction).filter(
            (Transaction.from_wallet_id == wallet_id) | 
            (Transaction.to_wallet_id == wallet_id)
        ).all()
    
    def get_by_id(self, transaction_id: int) -> Transaction:
        """Busca transação por ID."""
        return self.db.query(Transaction).filter(
            Transaction.id == transaction_id
        ).first()
