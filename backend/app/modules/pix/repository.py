from sqlalchemy.orm import Session
from app.models.models import Transaction


class PIXRepository:
    """Repository para operações de PIX no banco de dados."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_pix_transaction(self, data: dict) -> Transaction:
        """Cria transação PIX."""
        transaction = Transaction(**data)
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction
