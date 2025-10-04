from sqlalchemy.orm import Session
from typing import Dict

from .repository import DepositRepository


class DepositService:
    """Service layer para lógica de negócio de depósitos."""
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = DepositRepository(db)
    
    def process_deposit(self, data: dict) -> dict:
        """Processa depósito."""
        # TODO: Validar dados
        # TODO: Integrar com gateway de pagamento
        # TODO: Atualizar saldo da carteira
        wallet_id = data.get("wallet_id")
        amount = data.get("amount")
        
        # Placeholder - deveria validar e processar pagamento antes
        wallet = self.repository.update_wallet_balance(wallet_id, amount)
        
        return {
            "message": "Deposit processed",
            "wallet_id": wallet_id,
            "new_balance": float(wallet.balance)
        }
