from sqlalchemy.orm import Session
from typing import Dict

from .repository import OpenFinanceRepository


class OpenFinanceService:
    """Service layer para lógica de negócio de Open Finance."""
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = OpenFinanceRepository(db)
    
    def authorize_bank_connection(self, data: dict) -> dict:
        """Autoriza conexão com banco via Open Finance."""
        # TODO: Implementar fluxo OAuth2 com banco
        # TODO: Armazenar consentimento do usuário
        return {"message": "Authorization pending", "status": "pending"}
    
    def get_bank_accounts(self, user_id: int) -> dict:
        """Obtém contas bancárias conectadas."""
        # TODO: Buscar contas do usuário via API Open Finance
        return {"accounts": []}
    
    def get_transactions_history(self, account_id: str) -> dict:
        """Obtém histórico de transações de uma conta."""
        # TODO: Buscar transações via API Open Finance
        return {"transactions": []}
