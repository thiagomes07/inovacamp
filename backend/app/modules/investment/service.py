from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Dict, List, Any

from .repository import InvestmentRepository


class InvestmentService:
    """Service layer para lógica de negócio de investimento."""
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = InvestmentRepository(db)
    
    def create_investment(self, data: dict) -> dict:
        """Cria novo investimento."""
        # TODO: Implementar validação de saldo
        # TODO: Implementar lógica de alocação
        investment = self.repository.create_investment(data)
        return self._to_dict(investment)
    
    def get_investor_investments(self, investor_id: str) -> List[dict]:
        """Lista investimentos de um investidor."""
        investments = self.repository.get_investments_by_investor(investor_id)
        return [self._to_dict(inv) for inv in investments]
    
    def _to_dict(self, entity: Any) -> dict:
        """Converte entidade para dicionário."""
        return {
            "investment_id": entity.investment_id,
            "pool_id": entity.pool_id,
            "investor_id": entity.investor_id,
            "amount_invested": float(entity.amount_invested) if entity.amount_invested else None,
            "created_at": entity.created_at.isoformat() if entity.created_at else None
        }
