from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Dict, List, Any
from datetime import datetime, timedelta

from .repository import CreditRepository
from app.models.models import Loan, LoanStatus, LoanPayment, PaymentStatus, Transaction, TransactionType


class CreditService:
    """Service layer para lógica de negócio de crédito."""
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = CreditRepository(db)
    
    def create_credit_request(self, data: dict) -> dict:
        """
        Cria nova solicitação de crédito.
        
        Args:
            data: Dados da solicitação
        
        Returns:
            Dicionário com dados da solicitação criada
        """
        # TODO: Implementar lógica de validação
        # TODO: Implementar análise de crédito
        # TODO: Implementar score de risco
        
        credit_request = self.repository.create_credit_request(data)
        return self._to_dict(credit_request)
    
    def get_credit_request(self, request_id: str) -> dict:
        """
        Busca solicitação de crédito por ID.
        
        Args:
            request_id: ID da solicitação
        
        Returns:
            Dicionário com dados da solicitação
        """
        credit_request = self.repository.get_credit_request_by_id(request_id)
        
        if not credit_request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Credit request not found"
            )
        
        return self._to_dict(credit_request)
    
    def get_user_credit_requests(self, user_id: str) -> List[dict]:
        """
        Busca todas as solicitações de crédito de um usuário.
        
        Args:
            user_id: ID do usuário
        
        Returns:
            Lista de dicionários com dados das solicitações
        """
        requests = self.repository.get_credit_requests_by_user(user_id)
        return [self._to_dict(req) for req in requests]
    
    def get_borrower_dashboard(self, user_id: str) -> dict:
        """
        Retorna dados consolidados do dashboard do tomador.
        
        Args:
            user_id: ID do usuário
        
        Returns:
            Dicionário com empréstimos ativos, transações e estatísticas
        """
        # Buscar empréstimos ativos
        active_loans = self.db.query(Loan).filter(
            Loan.user_id == user_id,
            Loan.status == LoanStatus.ACTIVE
        ).all()
        
        # Buscar transações recentes (últimos 30 dias)
        thirty_days_ago = datetime.now() - timedelta(days=30)
        recent_transactions = self.db.query(Transaction).filter(
            ((Transaction.sender_id == user_id) | (Transaction.receiver_id == user_id)),
            Transaction.created_at >= thirty_days_ago
        ).order_by(Transaction.created_at.desc()).limit(10).all()
        
        # Calcular estatísticas
        total_borrowed = sum(float(loan.principal or 0) for loan in active_loans)
        # Para calcular total pago, precisamos buscar os pagamentos
        total_paid = 0
        for loan in active_loans:
            payments = self.db.query(LoanPayment).filter(
                LoanPayment.loan_id == loan.loan_id,
                LoanPayment.status == PaymentStatus.PAID
            ).all()
            total_paid += sum(float(p.amount_paid or 0) for p in payments)
        total_remaining = total_borrowed - total_paid
        
        return {
            "user_id": user_id,
            "active_loans": [self._loan_to_dict(loan) for loan in active_loans],
            "recent_transactions": [self._transaction_to_dict(tx) for tx in recent_transactions],
            "statistics": {
                "total_borrowed": total_borrowed,
                "total_paid": total_paid,
                "total_remaining": total_remaining,
                "active_loans_count": len(active_loans)
            }
        }
    
    def _loan_to_dict(self, loan: Loan) -> dict:
        """Converte empréstimo para dicionário."""
        # Calcular próximo pagamento e dias até vencimento
        next_payment_amount = None
        days_until_payment = None
        
        if loan.principal and loan.duration_months and loan.duration_months > 0:
            monthly_payment = float(loan.principal) / loan.duration_months
            next_payment_amount = monthly_payment
            
            # Calcular dias até próximo pagamento (estimativa baseada na data de desembolso)
            if loan.disbursed_at:
                months_since_disbursement = (datetime.now() - loan.disbursed_at).days // 30
                next_payment_date = loan.disbursed_at + timedelta(days=(months_since_disbursement + 1) * 30)
                days_until_payment = (next_payment_date - datetime.now()).days
        
        # Calcular total pago
        payments = self.db.query(LoanPayment).filter(
            LoanPayment.loan_id == loan.loan_id,
            LoanPayment.status == PaymentStatus.PAID
        ).all()
        amount_paid = sum(float(p.amount_paid or 0) for p in payments)
        
        # Determinar a fonte do empréstimo
        source = "Direto"
        loan_type = "direct"
        if loan.pool_id:
            # Buscar nome da pool
            from app.models.models import Pool
            pool = self.db.query(Pool).filter(Pool.pool_id == loan.pool_id).first()
            source = pool.name if pool else "Pool"
            loan_type = "pool"
        elif loan.investor_id:
            # Buscar nome do investidor
            from app.models.models import User
            investor = self.db.query(User).filter(User.user_id == loan.investor_id).first()
            source = investor.name if investor else "Investidor"
        
        return {
            "id": loan.loan_id,
            "amount": float(loan.principal) if loan.principal else 0,
            "nextPayment": next_payment_amount or 0,
            "daysUntilPayment": days_until_payment or 0,
            "source": source,
            "type": loan_type,
            "status": loan.status.value if hasattr(loan.status, 'value') else loan.status,
            "interest_rate": float(loan.interest_rate) if loan.interest_rate else 0,
            "term_months": loan.duration_months or 0,
            "amount_paid": amount_paid,
            "created_at": loan.disbursed_at.isoformat() if loan.disbursed_at else None
        }
    
    def _transaction_to_dict(self, transaction: Transaction) -> dict:
        """Converte transação para dicionário."""
        return {
            "id": transaction.transaction_id,
            "type": transaction.type.value if hasattr(transaction.type, 'value') else transaction.type,
            "amount": float(transaction.amount) if transaction.amount else 0,
            "date": transaction.created_at.date().isoformat() if transaction.created_at else None,
            "description": transaction.description or "Transação",
            "status": transaction.status.value if hasattr(transaction.status, 'value') else transaction.status
        }
    
    def get_approved_credit(self, user_id: str) -> dict:
        """
        Retorna o total de crédito aprovado para um usuário.
        
        Busca todos os credit_requests com status APPROVED e soma os valores.
        
        Args:
            user_id: ID do usuário
        
        Returns:
            Dicionário com total aprovado e lista de solicitações
        """
        from app.models.models import CreditRequest, CreditRequestStatus
        
        approved_requests = self.db.query(CreditRequest).filter(
            CreditRequest.user_id == user_id,
            CreditRequest.status == CreditRequestStatus.APPROVED
        ).all()
        
        total_approved = sum(float(req.amount_requested or 0) for req in approved_requests)
        
        return {
            "user_id": user_id,
            "total_approved": total_approved,
            "approved_requests": [self._to_dict(req) for req in approved_requests],
            "count": len(approved_requests)
        }
    
    def _to_dict(self, entity: Any) -> dict:
        """Converte entidade para dicionário."""
        return {
            "request_id": entity.request_id,
            "user_id": entity.user_id,
            "investor_id": entity.investor_id,
            "amount_requested": float(entity.amount_requested) if entity.amount_requested else None,
            "duration_months": entity.duration_months,
            "status": entity.status.value if hasattr(entity.status, 'value') else entity.status,
            "collateral_type": entity.collateral_type.value if hasattr(entity.collateral_type, 'value') else entity.collateral_type,
            "collateral_description": entity.collateral_description,
            "interest_rate": float(entity.interest_rate) if entity.interest_rate else None,
            "requested_at": entity.requested_at.isoformat() if entity.requested_at else None,
            "approved_at": entity.approved_at.isoformat() if entity.approved_at else None,
            "updated_at": entity.updated_at.isoformat() if entity.updated_at else None
        }
