from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.models import Wallet


class WalletRepository:
    """Repository para operações de carteira no banco de dados."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_wallet_by_owner(self, owner_id: str, owner_type: str) -> List[Wallet]:
        """Busca carteiras por dono."""
        return self.db.query(Wallet).filter(
            Wallet.owner_id == owner_id,
            Wallet.owner_type == owner_type
        ).all()
    
    def get_wallet_by_id(self, wallet_id: str) -> Optional[Wallet]:
        """Busca carteira por ID."""
        return self.db.query(Wallet).filter(Wallet.wallet_id == wallet_id).first()
    
    def create_wallet(self, data: dict) -> Wallet:
        """Cria nova carteira."""
        wallet = Wallet(**data)
        self.db.add(wallet)
        self.db.commit()
        self.db.refresh(wallet)
        return wallet
    
    def update_balance(self, wallet_id: str, new_balance: float) -> Optional[Wallet]:
        """Atualiza saldo da carteira."""
        wallet = self.get_wallet_by_id(wallet_id)
        if wallet:
            wallet.balance = new_balance
            self.db.commit()
            self.db.refresh(wallet)
        return wallet
