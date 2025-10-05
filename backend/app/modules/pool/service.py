from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Dict, List, Any

from .repository import PoolRepository


class PoolService:
    """Service layer para lógica de negócio de pool."""
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = PoolRepository(db)
    
    def create_pool(self, data: dict) -> dict:
        """Cria novo pool de investimento."""
        # TODO: Validar parâmetros do pool
        # TODO: Implementar regras de negócio
        pool = self.repository.create_pool(data)
        return self._to_dict(pool)
    
    def list_pools(self, status: str = None) -> List[dict]:
        """Lista pools disponíveis."""
        pools = self.repository.get_all_pools(status)
        return [self._to_dict(p) for p in pools]
    
    def _to_dict(self, entity: Any) -> dict:
        """Converte entidade para dicionário."""
        return {
            "pool_id": entity.pool_id,
            "pool_name": entity.pool_name,
            "target_amount": float(entity.target_amount) if entity.target_amount else None,
            "current_amount": float(entity.current_amount) if entity.current_amount else None,
            "status": entity.status.value if hasattr(entity.status, 'value') else entity.status,
            "created_at": entity.created_at.isoformat() if entity.created_at else None
        }
