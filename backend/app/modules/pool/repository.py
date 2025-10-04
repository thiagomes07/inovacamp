from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.models import Pool


class PoolRepository:
    """Repository para operações de pool no banco de dados."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_pool_by_id(self, pool_id: str) -> Optional[Pool]:
        """Busca pool por ID."""
        return self.db.query(Pool).filter(Pool.pool_id == pool_id).first()
    
    def get_all_pools(self, status: str = None) -> List[Pool]:
        """Lista todos os pools."""
        query = self.db.query(Pool)
        if status:
            query = query.filter(Pool.status == status)
        return query.all()
    
    def create_pool(self, data: dict) -> Pool:
        """Cria novo pool."""
        pool = Pool(**data)
        self.db.add(pool)
        self.db.commit()
        self.db.refresh(pool)
        return pool
