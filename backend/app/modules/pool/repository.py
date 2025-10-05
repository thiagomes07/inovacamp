from sqlalchemy.orm import Session
from sqlalchemy import func, and_
from typing import Optional, List, Dict, Any
from app.models.models import Pool, Loan, LoanStatus, PoolStatus, CreditRequest, User


class PoolRepository:
    """Repository para operações de pool no banco de dados."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_pool_by_id(self, pool_id: str) -> Optional[Pool]:
        """Busca pool por ID."""
        return self.db.query(Pool).filter(Pool.pool_id == pool_id).first()
    
    def get_pools_by_investor(self, investor_id: str) -> List[Pool]:
        """Lista pools de um investidor específico."""
        return self.db.query(Pool).filter(Pool.investor_id == investor_id).all()
    
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
    
    def update_pool(self, pool_id: str, data: dict) -> Optional[Pool]:
        """Atualiza dados da pool."""
        pool = self.get_pool_by_id(pool_id)
        if not pool:
            return None
        
        for key, value in data.items():
            if hasattr(pool, key):
                setattr(pool, key, value)
        
        self.db.commit()
        self.db.refresh(pool)
        return pool
    
    def get_pool_loans(self, pool_id: str) -> List[Dict[str, Any]]:
        """Busca todos os empréstimos alocados em uma pool com detalhes do tomador."""
        loans = self.db.query(
            Loan,
            User.full_name.label('borrower_name'),
            User.calculated_score.label('borrower_score'),
            User.user_type.label('borrower_type'),
            CreditRequest.collateral_type,
            CreditRequest.collateral_description
        ).join(
            User, Loan.user_id == User.user_id
        ).join(
            CreditRequest, Loan.credit_request_id == CreditRequest.request_id
        ).filter(
            Loan.pool_id == pool_id
        ).all()
        
        result = []
        for loan, borrower_name, borrower_score, borrower_type, collateral_type, collateral_description in loans:
            # Mapeamento de user_type para profissão/tipo
            profession_map = {
                'individual': 'Pessoa Física',
                'mei': 'MEI',
                'company': 'Empresa'
            }
            
            result.append({
                'loan': loan,
                'borrower_name': borrower_name or 'N/A',
                'borrower_profession': profession_map.get(borrower_type.value if hasattr(borrower_type, 'value') else str(borrower_type), 'N/A'),
                'borrower_score': float(borrower_score) if borrower_score else 0,
                'collateral_type': collateral_type,
                'collateral_description': collateral_description
            })
        
        return result
    
    def get_pool_stats(self, pool_id: str) -> Dict[str, Any]:
        """Calcula estatísticas da pool."""
        # Total alocado (sum dos empréstimos ativos)
        allocated_amount = self.db.query(func.sum(Loan.principal)).filter(
            Loan.pool_id == pool_id,
            Loan.status == LoanStatus.ACTIVE
        ).scalar() or 0
        
        # Contagem de empréstimos
        loan_count = self.db.query(func.count(Loan.loan_id)).filter(
            Loan.pool_id == pool_id,
            Loan.status == LoanStatus.ACTIVE
        ).scalar() or 0
        
        # Taxa média de juros
        avg_rate = self.db.query(func.avg(Loan.interest_rate)).filter(
            Loan.pool_id == pool_id,
            Loan.status == LoanStatus.ACTIVE
        ).scalar() or 0
        
        # Empréstimos pagos
        completed_loans = self.db.query(func.count(Loan.loan_id)).filter(
            Loan.pool_id == pool_id,
            Loan.status == LoanStatus.PAID
        ).scalar() or 0
        
        return {
            'allocated_amount': float(allocated_amount),
            'loan_count': loan_count,
            'avg_interest_rate': float(avg_rate),
            'completed_loans': completed_loans
        }
