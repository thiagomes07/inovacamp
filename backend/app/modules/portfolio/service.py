from sqlalchemy.orm import Session
from typing import Dict, Any, List

from .repository import PortfolioRepository


class PortfolioService:
    """Service layer para lógica de negócio de portfólio."""
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = PortfolioRepository(db)
    
    def get_portfolio_overview(self, investor_id: str) -> Dict:
        """
        Retorna visão geral completa do portfólio.
        
        Inclui:
        - Saldos das carteiras (disponível, investido, bloqueado)
        - Pools do investidor
        - Investimentos diretos
        - Oportunidades de investimento
        """
        # Buscar carteiras
        wallets = self.repository.get_investor_wallets(investor_id)
        
        # Calcular totais das carteiras
        total_balance = sum(w["balance"] for w in wallets)
        total_available = sum(w["available"] for w in wallets)
        total_blocked = sum(w["blocked"] for w in wallets)
        
        # Buscar performance
        performance = self.repository.calculate_portfolio_performance(investor_id)
        total_invested = performance["total_invested"]
        
        # Buscar pools
        pools = self.repository.get_investor_pools(investor_id)
        
        # Buscar investimentos diretos
        direct_investments = self.repository.get_direct_investments(investor_id)
        
        # Buscar oportunidades
        opportunities = self.repository.get_investment_opportunities(investor_id, limit=10)
        
        return {
            "investor_id": investor_id,
            "balance": {
                "total": total_balance,
                "available": total_available,
                "invested": total_invested,
                "blocked": total_blocked
            },
            "wallets": wallets,
            "pools": pools,
            "direct_investments": direct_investments,
            "opportunities": opportunities,
            "performance": performance
        }
    
    def get_portfolio_performance(self, investor_id: str) -> Dict:
        """
        Retorna analytics de rentabilidade do portfólio.
        
        Inclui:
        - Total investido
        - Total recebido (juros + principal)
        - ROI (Return on Investment)
        - Taxa média de retorno
        - Número de empréstimos ativos
        """
        performance = self.repository.calculate_portfolio_performance(investor_id)
        
        total_invested = performance["total_invested"]
        total_received = performance["total_received"]
        
        # Calcular ROI
        roi = 0.0
        if total_invested > 0:
            roi = ((total_received - total_invested) / total_invested) * 100
        
        return {
            "investor_id": investor_id,
            "total_invested": total_invested,
            "total_received": total_received,
            "roi": round(roi, 2),
            "average_rate": performance["average_rate"],
            "active_loans": performance["active_loans"],
            "performance_summary": {
                "profit": total_received - total_invested,
                "invested_capital": total_invested,
                "returns": total_received
            }
        }
