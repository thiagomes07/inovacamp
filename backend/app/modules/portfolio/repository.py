from sqlalchemy.orm import Session
from sqlalchemy import func, and_, case
from typing import Optional, List, Dict
from datetime import datetime, timedelta
from decimal import Decimal

from app.models.models import (
    Investor, Wallet, Pool, PoolInvestment, Loan, 
    LoanPayment, CreditRequest, User, LoanStatus, PaymentStatus,
    PoolStatus, CreditRequestStatus
)


class PortfolioRepository:
    """Repository para operações de portfólio no banco de dados."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_investor_wallets(self, investor_id: str) -> List[Dict]:
        """Busca todas as carteiras do investidor."""
        wallets = self.db.query(Wallet).filter(
            Wallet.owner_id == investor_id,
            Wallet.owner_type == "investor"
        ).all()
        
        return [{
            "wallet_id": w.wallet_id,
            "currency": w.currency.value,
            "balance": float(w.balance),
            "blocked": float(w.blocked),
            "available": float(w.balance - w.blocked)
        } for w in wallets]
    
    def get_investor_pools(self, investor_id: str) -> List[Dict]:
        """Busca todos os pools do investidor (criados e investidos)."""
        # Pools criados pelo investidor
        owned_pools = self.db.query(Pool).filter(
            Pool.investor_id == investor_id
        ).all()
        
        # Pools onde o investidor tem participação
        invested_pools = self.db.query(
            Pool,
            PoolInvestment.amount,
            PoolInvestment.share_percentage
        ).join(
            PoolInvestment, Pool.pool_id == PoolInvestment.pool_id
        ).filter(
            PoolInvestment.investor_id == investor_id
        ).all()
        
        pools_data = []
        
        # Adicionar pools criados
        for pool in owned_pools:
            # Contar loans alocados a este pool
            loans_count = self.db.query(func.count(Loan.loan_id)).filter(
                Loan.pool_id == pool.pool_id,
                Loan.status == LoanStatus.ACTIVE
            ).scalar() or 0
            
            # Calcular valor REALMENTE alocado (soma do principal dos loans ativos)
            allocated_amount = self.db.query(func.sum(Loan.principal)).filter(
                Loan.pool_id == pool.pool_id,
                Loan.status == LoanStatus.ACTIVE
            ).scalar() or 0
            
            pools_data.append({
                "id": pool.pool_id,
                "name": pool.name,
                "totalCapital": float(pool.target_amount),
                "allocated": float(allocated_amount),  # Valor realmente alocado em empréstimos
                "loans": loans_count,
                "maxLoans": 10,  # TODO: Adicionar campo no banco
                "averageReturn": float(pool.expected_return),
                "status": pool.status.value,
                "is_owner": True
            })
        
        # Adicionar pools investidos
        for pool, invested_amount, share_pct in invested_pools:
            if pool.investor_id != investor_id:  # Evitar duplicação
                loans_count = self.db.query(func.count(Loan.loan_id)).filter(
                    Loan.pool_id == pool.pool_id,
                    Loan.status == LoanStatus.ACTIVE
                ).scalar() or 0
                
                # Calcular valor REALMENTE alocado (soma do principal dos loans ativos)
                allocated_amount = self.db.query(func.sum(Loan.principal)).filter(
                    Loan.pool_id == pool.pool_id,
                    Loan.status == LoanStatus.ACTIVE
                ).scalar() or 0
                
                pools_data.append({
                    "id": pool.pool_id,
                    "name": pool.name,
                    "totalCapital": float(pool.target_amount),
                    "allocated": float(allocated_amount),  # Valor realmente alocado em empréstimos
                    "loans": loans_count,
                    "maxLoans": 10,
                    "averageReturn": float(pool.expected_return),
                    "status": pool.status.value,
                    "invested_amount": float(invested_amount),
                    "share_percentage": float(share_pct),
                    "is_owner": False
                })
        
        return pools_data
    
    def get_direct_investments(self, investor_id: str) -> List[Dict]:
        """Busca investimentos diretos do investidor."""
        loans = self.db.query(
            Loan,
            User.full_name.label("borrower_name"),
            CreditRequest.amount_requested
        ).join(
            User, Loan.user_id == User.user_id
        ).join(
            CreditRequest, Loan.credit_request_id == CreditRequest.request_id
        ).filter(
            Loan.investor_id == investor_id,
            Loan.pool_id.is_(None),  # Investimentos diretos (não via pool)
            Loan.status == LoanStatus.ACTIVE
        ).all()
        
        investments = []
        for loan, borrower_name, amount in loans:
            # Buscar próxima parcela
            next_payment = self.db.query(LoanPayment).filter(
                LoanPayment.loan_id == loan.loan_id,
                LoanPayment.status == PaymentStatus.PENDING
            ).order_by(LoanPayment.due_date).first()
            
            investments.append({
                "id": loan.loan_id,
                "borrower": borrower_name,
                "amount": float(loan.principal),
                "return": float(loan.interest_rate),
                "status": loan.status.value,
                "nextPayment": next_payment.due_date.isoformat() if next_payment else None
            })
        
        return investments
    
    def get_investment_opportunities(self, investor_id: str, limit: int = 10) -> List[Dict]:
        """Busca oportunidades de investimento disponíveis."""
        opportunities = self.db.query(
            CreditRequest,
            User.full_name.label("borrower_name"),
            User.calculated_score
        ).join(
            User, CreditRequest.user_id == User.user_id
        ).filter(
            CreditRequest.status == CreditRequestStatus.PENDING,
            CreditRequest.investor_id.is_(None)
        ).limit(limit).all()
        
        result = []
        for req, borrower_name, calculated_score in opportunities:
            # Usar calculated_score, com fallback para 0 se None
            score = calculated_score if calculated_score is not None else 0
            
            # Determinar risk level baseado no calculated_score
            if score >= 700:
                risk_level = "low"
            elif score >= 600:
                risk_level = "medium"
            else:
                risk_level = "high"
            
            result.append({
                "id": req.request_id,
                "borrower": borrower_name,
                "amount": float(req.amount_requested),
                "purpose": req.collateral_description or "Capital de giro",
                "rate": float(req.interest_rate) if req.interest_rate else 18.0,
                "term": req.duration_months,
                "score": score,
                "riskLevel": risk_level
            })
        
        return result
    
    def calculate_portfolio_performance(self, investor_id: str) -> Dict:
        """Calcula performance do portfólio."""
        # Total investido (capital alocado)
        total_invested = self.db.query(
            func.sum(Loan.principal)
        ).filter(
            Loan.investor_id == investor_id,
            Loan.status == LoanStatus.ACTIVE
        ).scalar() or Decimal(0)
        
        # Total investido via pools
        pool_invested = self.db.query(
            func.sum(PoolInvestment.amount)
        ).filter(
            PoolInvestment.investor_id == investor_id
        ).scalar() or Decimal(0)
        
        total_invested = float(total_invested + pool_invested)
        
        # Total recebido (parcelas pagas)
        total_received = self.db.query(
            func.sum(LoanPayment.amount_paid)
        ).join(
            Loan, LoanPayment.loan_id == Loan.loan_id
        ).filter(
            Loan.investor_id == investor_id,
            LoanPayment.status == PaymentStatus.PAID
        ).scalar() or Decimal(0)
        
        total_received = float(total_received)
        
        # Número de empréstimos ativos
        active_loans = self.db.query(
            func.count(Loan.loan_id)
        ).filter(
            Loan.investor_id == investor_id,
            Loan.status == LoanStatus.ACTIVE
        ).scalar() or 0
        
        # Taxa média de retorno
        avg_rate = self.db.query(
            func.avg(Loan.interest_rate)
        ).filter(
            Loan.investor_id == investor_id,
            Loan.status == LoanStatus.ACTIVE
        ).scalar() or Decimal(0)
        
        return {
            "total_invested": total_invested,
            "total_received": total_received,
            "active_loans": active_loans,
            "average_rate": float(avg_rate)
        }
