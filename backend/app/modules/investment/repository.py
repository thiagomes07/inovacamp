from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.models import PoolInvestment


class InvestmentRepository:
    """Repository para operações de investimento no banco de dados."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_investment_by_id(self, investment_id: str) -> Optional[PoolInvestment]:
        """Busca investimento por ID."""
        return self.db.query(PoolInvestment).filter(PoolInvestment.investment_id == investment_id).first()
    
    def get_investments_by_investor(self, investor_id: str) -> List[PoolInvestment]:
        """Busca todos os investimentos de um investidor."""
        return self.db.query(PoolInvestment).filter(PoolInvestment.investor_id == investor_id).all()
    
    def create_investment(self, data: dict) -> PoolInvestment:
        """Cria novo investimento."""
        investment = PoolInvestment(**data)
        self.db.add(investment)
        self.db.commit()
        self.db.refresh(investment)
        return investment
