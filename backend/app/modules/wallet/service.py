from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Dict, List, Any

from .repository import WalletRepository


class WalletService:
    """Service layer para lógica de negócio de carteira."""
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = WalletRepository(db)
    
    def get_user_wallets(self, owner_id: str, owner_type: str) -> List[dict]:
        """Lista carteiras de um usuário/investidor."""
        wallets = self.repository.get_wallet_by_owner(owner_id, owner_type)
        return [self._to_dict(w) for w in wallets]
    
    def _to_dict(self, entity: Any) -> dict:
        """Converte entidade para dicionário."""
        return {
            "wallet_id": entity.wallet_id,
            "owner_id": entity.owner_id,
            "owner_type": entity.owner_type.value if hasattr(entity.owner_type, 'value') else entity.owner_type,
            "currency": entity.currency.value if hasattr(entity.currency, 'value') else entity.currency,
            "balance": float(entity.balance) if entity.balance else 0.0,
            "created_at": entity.created_at.isoformat() if entity.created_at else None
        }
