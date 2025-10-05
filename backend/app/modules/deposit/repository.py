from sqlalchemy.orm import Session
from app.models.models import Transaction, Wallet


class DepositRepository:
    """Repository para operações de depósito no banco de dados."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def create_deposit_transaction(self, data: dict) -> Transaction:
        """Cria transação de depósito."""
        transaction = Transaction(**data)
        self.db.add(transaction)
        self.db.commit()
        self.db.refresh(transaction)
        return transaction
    
    def update_wallet_balance(self, wallet_id: int, amount: float):
        """Atualiza saldo da carteira."""
        wallet = self.db.query(Wallet).filter(Wallet.id == wallet_id).first()
        if wallet:
            wallet.balance += amount
            self.db.commit()
            self.db.refresh(wallet)
        return wallet
