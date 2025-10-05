from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Dict, List, Any, Optional, Tuple
from datetime import datetime, timedelta
import uuid
import logging

from .repository import CreditRepository
from app.modules.wallet.repository import WalletRepository
from app.modules.pool.repository import PoolRepository
from app.models.models import (
    Loan, LoanStatus, LoanPayment, PaymentStatus, Transaction, TransactionType,
    CreditRequest, CreditRequestStatus, Pool, PoolStatus, PoolLoan,
    User, Currency, OwnerType, TransactionStatus
)

logger = logging.getLogger(__name__)


class CreditService:
    """Service layer para lógica de negócio de crédito."""
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = CreditRepository(db)
        self.wallet_repository = WalletRepository(db)
        self.pool_repository = PoolRepository(db)
    
    def create_credit_request(self, data: dict) -> dict:
        """
        Cria nova solicitação de crédito e tenta matching automático com pools.
        
        Args:
            data: Dados da solicitação contendo:
                - user_id: ID do tomador
                - amount_requested: Valor solicitado
                - duration_months: Prazo em meses
                - interest_rate: Taxa de juros (opcional)
                - collateral_type: Tipo de garantia (opcional)
                - collateral_description: Descrição da garantia (opcional)
                - approval_type: 'automatic', 'manual' ou 'both'
        
        Returns:
            Dicionário com dados da solicitação e status de aprovação
        """
        # Validações
        user_id = data.get('user_id')
        amount_requested = data.get('amount_requested')
        duration_months = data.get('duration_months')
        approval_type = data.get('approval_type', 'automatic')
        
        if not all([user_id, amount_requested, duration_months]):
            raise HTTPException(
                status_code=400,
                detail="Campos obrigatórios: user_id, amount_requested, duration_months"
            )
        
        if amount_requested < 100:
            raise HTTPException(
                status_code=400,
                detail="O valor mínimo é R$ 100"
            )
        
        # Buscar usuário e verificar score
        user = self.db.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=404,
                detail="Usuário não encontrado"
            )
        
        # Usar calculated_score ou credit_score
        user_score = user.calculated_score if user.calculated_score else user.credit_score
        
        # Criar solicitação
        request_data = {
            'request_id': str(uuid.uuid4()),
            'user_id': user_id,
            'amount_requested': amount_requested,
            'duration_months': duration_months,
            'interest_rate': data.get('interest_rate', 0),
            'status': CreditRequestStatus.PENDING,
            'collateral_type': data.get('collateral_type', 'NONE'),
            'collateral_description': data.get('collateral_description'),
            'collateral_docs': data.get('collateral_docs'),
            'requested_at': datetime.now()
        }
        
        credit_request = self.repository.create_credit_request(request_data)
        logger.info(f"[CreditService] Credit request criado: {credit_request.request_id}")
        
        # Se for automático ou ambos, tentar matching com pools
        if approval_type in ['automatic', 'both']:
            try:
                matched = self._try_automatic_matching(
                    credit_request=credit_request,
                    user_score=user_score,
                    user=user
                )
                
                if matched:
                    logger.info(f"[CreditService] Matching automático bem-sucedido para request {credit_request.request_id}")
                    # Recarregar para pegar status atualizado
                    self.db.refresh(credit_request)
                elif approval_type == 'both':
                    logger.info(f"[CreditService] Sem match automático, enviando para marketplace manual")
                else:
                    logger.info(f"[CreditService] Sem match automático e tipo é 'automatic', rejeitando")
                    credit_request.status = CreditRequestStatus.REJECTED
                    self.db.commit()
                    
            except Exception as e:
                logger.error(f"[CreditService] Erro no matching automático: {str(e)}")
                if approval_type == 'automatic':
                    credit_request.status = CreditRequestStatus.REJECTED
                    self.db.commit()
        
        return self._to_dict(credit_request)
    
    def _try_automatic_matching(
        self, 
        credit_request: CreditRequest, 
        user_score: int,
        user: User
    ) -> bool:
        """
        Tenta fazer matching automático da solicitação com pools ativas.
        
        Args:
            credit_request: Solicitação de crédito
            user_score: Score de crédito do usuário
            user: Objeto do usuário
        
        Returns:
            True se houve match e empréstimo foi criado, False caso contrário
        """
        # Buscar pools ativas
        active_pools = self.db.query(Pool).filter(
            Pool.status == PoolStatus.ACTIVE
        ).all()
        
        if not active_pools:
            logger.info("[CreditService] Nenhuma pool ativa disponível")
            return False
        
        # Filtrar pools compatíveis com critérios
        compatible_pools = []
        for pool in active_pools:
            # Verificar critérios de elegibilidade
            if user_score < pool.min_score:
                logger.debug(f"Pool {pool.pool_id} requer score {pool.min_score}, usuário tem {user_score}")
                continue
            
            if pool.requires_collateral and credit_request.collateral_type.value == 'NONE':
                logger.debug(f"Pool {pool.pool_id} requer garantia, solicitação não tem")
                continue
            
            if credit_request.duration_months > pool.max_term_months:
                logger.debug(f"Pool {pool.pool_id} permite max {pool.max_term_months} meses, solicitado {credit_request.duration_months}")
                continue
            
            # Verificar se a pool tem saldo disponível
            # raised_amount é o capital total da pool
            # Precisamos calcular quanto já foi alocado
            allocated = self.db.query(PoolLoan).filter(
                PoolLoan.pool_id == pool.pool_id
            ).all()
            
            total_allocated = sum(float(pl.allocated_amount) for pl in allocated)
            available = float(pool.raised_amount) - total_allocated
            
            if available < float(credit_request.amount_requested):
                logger.debug(f"Pool {pool.pool_id} tem apenas R$ {available:.2f} disponível, solicitado R$ {credit_request.amount_requested}")
                continue
            
            compatible_pools.append((pool, available))
        
        if not compatible_pools:
            logger.info("[CreditService] Nenhuma pool compatível encontrada")
            return False
        
        # Ordenar por melhor match (maior taxa de retorno esperado)
        compatible_pools.sort(key=lambda x: float(x[0].expected_return), reverse=True)
        selected_pool = compatible_pools[0][0]
        
        logger.info(f"[CreditService] Pool selecionada: {selected_pool.name} (ID: {selected_pool.pool_id})")
        
        # Criar empréstimo
        loan_created = self._create_loan_from_pool(
            credit_request=credit_request,
            pool=selected_pool,
            user=user
        )
        
        return loan_created
    
    def _create_loan_from_pool(
        self,
        credit_request: CreditRequest,
        pool: Pool,
        user: User
    ) -> bool:
        """
        Cria empréstimo a partir de uma pool e efetua transferência.
        
        Args:
            credit_request: Solicitação de crédito
            pool: Pool que vai fornecer o crédito
            user: Usuário tomador
        
        Returns:
            True se empréstimo foi criado com sucesso
        """
        try:
            # Definir taxa de juros (usar a mínima da pool ou a solicitada, o que for maior)
            interest_rate = max(
                float(credit_request.interest_rate or 0),
                float(pool.min_interest_rate or 0)
            )
            
            # Criar registro de alocação da pool
            pool_loan = PoolLoan(
                pool_loan_id=str(uuid.uuid4()),
                pool_id=pool.pool_id,
                credit_request_id=credit_request.request_id,
                allocated_amount=credit_request.amount_requested,
                status=LoanStatus.ACTIVE,
                allocated_at=datetime.now()
            )
            self.db.add(pool_loan)
            
            # Criar empréstimo
            loan = Loan(
                loan_id=str(uuid.uuid4()),
                credit_request_id=credit_request.request_id,
                user_id=user.user_id,
                pool_id=pool.pool_id,
                principal=credit_request.amount_requested,
                interest_rate=interest_rate,
                duration_months=credit_request.duration_months,
                status=LoanStatus.ACTIVE,
                disbursed_at=datetime.now()
            )
            self.db.add(loan)
            
            # Atualizar status do credit request
            credit_request.status = CreditRequestStatus.APPROVED
            credit_request.approved_at = datetime.now()
            
            # Buscar carteira BRL do tomador
            user_wallets = self.wallet_repository.get_wallet_by_owner(user.user_id, 'USER')
            user_brl_wallet = next((w for w in user_wallets if w.currency == 'BRL'), None)
            
            if not user_brl_wallet:
                # Criar carteira BRL se não existir
                from app.models.models import Wallet
                user_brl_wallet = Wallet(
                    wallet_id=str(uuid.uuid4()),
                    owner_id=user.user_id,
                    owner_type=OwnerType.USER,
                    currency=Currency.BRL,
                    balance=0,
                    blocked=0
                )
                self.db.add(user_brl_wallet)
                self.db.flush()  # Para obter o ID
            
            # Creditar valor na carteira do tomador
            new_balance = float(user_brl_wallet.balance) + float(credit_request.amount_requested)
            self.wallet_repository.update_balance(user_brl_wallet.wallet_id, new_balance)
            
            # Criar transação
            transaction = Transaction(
                transaction_id=str(uuid.uuid4()),
                sender_id=pool.investor_id,
                sender_type=OwnerType.INVESTOR,
                receiver_id=user.user_id,
                receiver_type=OwnerType.USER,
                wallet_id=user_brl_wallet.wallet_id,
                amount=credit_request.amount_requested,
                currency=Currency.BRL,
                type=TransactionType.INVESTMENT,
                status=TransactionStatus.COMPLETED,
                description=f"Empréstimo via pool {pool.name}",
                created_at=datetime.now()
            )
            self.db.add(transaction)
            
            # Criar parcelas do empréstimo
            self._create_loan_payments(loan)
            
            self.db.commit()
            
            logger.info(f"[CreditService] Empréstimo {loan.loan_id} criado com sucesso")
            return True
            
        except Exception as e:
            self.db.rollback()
            logger.error(f"[CreditService] Erro ao criar empréstimo: {str(e)}")
            raise
    
    def _create_loan_payments(self, loan: Loan) -> None:
        """
        Cria as parcelas do empréstimo.
        
        Args:
            loan: Empréstimo
        """
        # Calcular valor da parcela (principal + juros / número de meses)
        principal = float(loan.principal)
        interest_rate_monthly = float(loan.interest_rate) / 100 / 12
        n_payments = loan.duration_months
        
        # Fórmula de parcela fixa (Sistema Price)
        if interest_rate_monthly > 0:
            monthly_payment = principal * (
                interest_rate_monthly * (1 + interest_rate_monthly) ** n_payments
            ) / (
                (1 + interest_rate_monthly) ** n_payments - 1
            )
        else:
            monthly_payment = principal / n_payments
        
        # Criar parcelas
        for i in range(1, n_payments + 1):
            due_date = datetime.now() + timedelta(days=30 * i)
            
            payment = LoanPayment(
                payment_id=str(uuid.uuid4()),
                loan_id=loan.loan_id,
                installment_number=i,
                amount_due=monthly_payment,
                amount_paid=0,
                due_date=due_date.date(),
                status=PaymentStatus.PENDING
            )
            self.db.add(payment)
    
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
    
    def get_compatible_pools(self, user_id: str, amount: float, duration_months: int) -> dict:
        """
        Retorna pools compatíveis com os critérios do usuário.
        
        Args:
            user_id: ID do usuário
            amount: Valor solicitado
            duration_months: Prazo em meses
        
        Returns:
            Dicionário com lista de pools compatíveis
        """
        # Buscar usuário e score
        user = self.db.query(User).filter(User.user_id == user_id).first()
        if not user:
            raise HTTPException(
                status_code=404,
                detail="Usuário não encontrado"
            )
        
        user_score = user.calculated_score if user.calculated_score else user.credit_score
        
        # Buscar pools ativas
        active_pools = self.db.query(Pool).filter(
            Pool.status == PoolStatus.ACTIVE
        ).all()
        
        compatible = []
        for pool in active_pools:
            # Verificar critérios
            if user_score < pool.min_score:
                continue
            
            if duration_months > pool.max_term_months:
                continue
            
            # Calcular disponibilidade
            allocated = self.db.query(PoolLoan).filter(
                PoolLoan.pool_id == pool.pool_id
            ).all()
            
            total_allocated = sum(float(pl.allocated_amount) for pl in allocated)
            available = float(pool.raised_amount) - total_allocated
            
            if available < amount:
                continue
            
            compatible.append({
                "pool_id": pool.pool_id,
                "name": pool.name,
                "investor_id": pool.investor_id,
                "available_amount": available,
                "expected_return": float(pool.expected_return or 0),
                "min_interest_rate": float(pool.min_interest_rate or 0),
                "min_score": pool.min_score,
                "requires_collateral": pool.requires_collateral,
                "max_term_months": pool.max_term_months,
                "risk_profile": pool.risk_profile.value if hasattr(pool.risk_profile, 'value') else pool.risk_profile
            })
        
        return {
            "user_id": user_id,
            "user_score": user_score,
            "requested_amount": amount,
            "requested_duration": duration_months,
            "compatible_pools": compatible,
            "count": len(compatible)
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
