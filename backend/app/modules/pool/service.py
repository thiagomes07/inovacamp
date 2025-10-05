from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Dict, List, Any
from datetime import datetime
import uuid

from .repository import PoolRepository
from app.modules.wallet.repository import WalletRepository
from app.models.models import PoolStatus, LoanStatus, RiskProfile


class PoolService:
    """Service layer para lógica de negócio de pool."""
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = PoolRepository(db)
        self.wallet_repository = WalletRepository(db)
    
    def create_pool(self, data: dict) -> dict:
        """Cria novo pool de investimento com débito da carteira."""
        # Validações obrigatórias
        investor_id = data.get('investor_id')
        target_amount = data.get('target_amount')
        name = data.get('name')
        duration_months = data.get('duration_months')
        expected_return = data.get('expected_return')
        
        if not all([investor_id, target_amount, name, duration_months]):
            raise HTTPException(
                status_code=400,
                detail="Campos obrigatórios: investor_id, target_amount, name, duration_months"
            )
        
        if target_amount < 1000:
            raise HTTPException(
                status_code=400,
                detail="O capital mínimo é R$ 1.000"
            )
        
        if expected_return and expected_return <= 0:
            raise HTTPException(
                status_code=400,
                detail="O retorno esperado deve ser maior que zero"
            )
        
        # Busca carteira BRL do investidor
        wallets = self.wallet_repository.get_wallet_by_owner(investor_id, 'INVESTOR')
        brl_wallet = next((w for w in wallets if w.currency == 'BRL'), None)
        
        if not brl_wallet:
            raise HTTPException(
                status_code=404,
                detail="Carteira não encontrada"
            )
        
        # Valida saldo suficiente
        if float(brl_wallet.balance) < target_amount:
            raise HTTPException(
                status_code=400,
                detail=f"Saldo insuficiente. Disponível: R$ {float(brl_wallet.balance):.2f}"
            )
        
        # Cria pool
        pool_data = {
            'pool_id': str(uuid.uuid4()),
            'investor_id': investor_id,
            'name': name,
            'target_amount': target_amount,
            'raised_amount': target_amount,  # Pool já começa com capital total
            'duration_months': duration_months,
            'expected_return': expected_return or 0,
            'status': PoolStatus.ACTIVE,
            'risk_profile': RiskProfile[data.get('risk_profile', 'MEDIUM').upper()],
            'min_score': data.get('min_score', 700),
            'requires_collateral': data.get('requires_collateral', False),
            'min_interest_rate': data.get('min_interest_rate', 0),
            'max_term_months': data.get('max_term_months', 24),
        }
        
        pool = self.repository.create_pool(pool_data)
        
        # Debita da carteira
        new_balance = float(brl_wallet.balance) - target_amount
        self.wallet_repository.update_balance(brl_wallet.wallet_id, new_balance)
        
        return self._pool_to_dict(pool)
    
    def list_pools(self, status: str = None) -> List[dict]:
        """Lista pools disponíveis."""
        pools = self.repository.get_all_pools(status)
        return [self._pool_to_dict(p) for p in pools]
    
    def get_investor_pools(self, investor_id: str) -> List[dict]:
        """Lista pools de um investidor com estatísticas."""
        pools = self.repository.get_pools_by_investor(investor_id)
        result = []
        
        for pool in pools:
            stats = self.repository.get_pool_stats(pool.pool_id)
            pool_dict = self._pool_to_dict(pool)
            
            # Adiciona estatísticas
            pool_dict.update({
                'allocatedAmount': stats['allocated_amount'],
                'availableAmount': float(pool.target_amount) - stats['allocated_amount'],
                'currentLoansCount': stats['loan_count'],
                'averageReturn': stats['avg_interest_rate'],
                'completedLoans': stats['completed_loans']
            })
            
            result.append(pool_dict)
        
        return result
    
    def get_pool_details(self, pool_id: str) -> dict:
        """Busca detalhes completos de uma pool."""
        pool = self.repository.get_pool_by_id(pool_id)
        if not pool:
            raise HTTPException(status_code=404, detail="Pool not found")
        
        stats = self.repository.get_pool_stats(pool_id)
        loans = self.repository.get_pool_loans(pool_id)
        
        # Monta resposta
        pool_dict = self._pool_to_dict(pool)
        pool_dict.update({
            'allocatedAmount': stats['allocated_amount'],
            'availableAmount': float(pool.target_amount) - stats['allocated_amount'],
            'currentLoansCount': stats['loan_count'],
            'averageReturn': stats['avg_interest_rate'],
            'completedLoans': stats['completed_loans'],
            'loans': [self._loan_to_dict(loan_data) for loan_data in loans]
        })
        
        return pool_dict
    
    def update_pool_criteria(self, pool_id: str, updates: dict) -> dict:
        """Atualiza critérios da pool."""
        pool = self.repository.get_pool_by_id(pool_id)
        if not pool:
            raise HTTPException(status_code=404, detail="Pool not found")
        
        # Permite atualizar campos de configuração e critérios
        allowed_fields = [
            'name', 
            'expected_return', 
            'duration_months',
            'target_amount',
            'risk_profile',
            'min_score',
            'requires_collateral',
            'min_interest_rate',
            'max_term_months'
        ]
        filtered_updates = {k: v for k, v in updates.items() if k in allowed_fields}
        
        updated_pool = self.repository.update_pool(pool_id, filtered_updates)
        return self._pool_to_dict(updated_pool)
    
    def update_pool_status(self, pool_id: str, new_status: str) -> dict:
        """Atualiza status da pool (pause/resume/close)."""
        pool = self.repository.get_pool_by_id(pool_id)
        if not pool:
            raise HTTPException(status_code=404, detail="Pool not found")
        
        # Valida status
        try:
            status_enum = PoolStatus(new_status)
        except ValueError:
            raise HTTPException(status_code=400, detail=f"Invalid status: {new_status}")
        
        updated_pool = self.repository.update_pool(pool_id, {'status': status_enum})
        return self._pool_to_dict(updated_pool)
    
    def increase_pool_capital(self, pool_id: str, amount: float) -> dict:
        """Aumenta capital total da pool."""
        pool = self.repository.get_pool_by_id(pool_id)
        if not pool:
            raise HTTPException(status_code=404, detail="Pool not found")
        
        if amount <= 0:
            raise HTTPException(status_code=400, detail="Amount must be positive")
        
        new_target = float(pool.target_amount) + amount
        updated_pool = self.repository.update_pool(pool_id, {'target_amount': new_target})
        
        return self._pool_to_dict(updated_pool)
    
    def _pool_to_dict(self, pool: Any) -> dict:
        """Converte entidade Pool para dicionário."""
        return {
            "id": pool.pool_id,
            "name": pool.name,
            "investorId": pool.investor_id,
            "totalCapital": float(pool.target_amount) if pool.target_amount else 0,
            "raisedAmount": float(pool.raised_amount) if pool.raised_amount else 0,
            "status": pool.status.value if hasattr(pool.status, 'value') else pool.status,
            "expectedReturn": float(pool.expected_return) if pool.expected_return else 0,
            "durationMonths": pool.duration_months,
            "riskProfile": pool.risk_profile.value if hasattr(pool.risk_profile, 'value') else pool.risk_profile,
            "fundingDeadline": pool.funding_deadline.isoformat() if pool.funding_deadline else None,
            "criteria": {
                "minScore": pool.min_score if hasattr(pool, 'min_score') else 700,
                "requiresCollateral": pool.requires_collateral if hasattr(pool, 'requires_collateral') else False,
                "collateralTypes": [],  # TODO: implementar quando tiver tabela de tipos
                "minInterestRate": float(pool.min_interest_rate) if hasattr(pool, 'min_interest_rate') and pool.min_interest_rate else 0,
                "maxTermMonths": pool.max_term_months if hasattr(pool, 'max_term_months') else 24
            },
            "createdAt": pool.created_at.isoformat() if pool.created_at else None
        }
    
    def _loan_to_dict(self, loan_data: dict) -> dict:
        """Converte dados de empréstimo para dicionário."""
        loan = loan_data['loan']
        
        result = {
            "id": loan.loan_id,
            "poolId": loan.pool_id,
            "borrowerId": loan.user_id,
            "borrowerName": loan_data['borrower_name'],
            "borrowerProfession": loan_data['borrower_profession'],
            "score": loan_data['borrower_score'],
            "amount": float(loan.principal),
            "interestRate": float(loan.interest_rate),
            "termMonths": loan.duration_months,
            "status": loan.status.value if hasattr(loan.status, 'value') else loan.status,
            "disbursedAt": loan.disbursed_at.isoformat() if loan.disbursed_at else None
        }
        
        # Adiciona colateral se existir
        if loan_data['collateral_type']:
            result['collateral'] = {
                'type': loan_data['collateral_type'],
                'description': loan_data['collateral_description'] or 'N/A'
            }
        else:
            result['collateral'] = None
        
        return result
