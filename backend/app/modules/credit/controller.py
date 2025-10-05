from fastapi import APIRouter, Depends, status, Body
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database import get_db
from .service import CreditService

router = APIRouter(prefix="/credit", tags=["Credit"])


@router.post("/request", status_code=status.HTTP_201_CREATED)
def create_credit_request(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Cria nova solicitação de crédito com matching automático de pools.
    
    **Body JSON:**
    ```json
    {
        "user_id": "u1000000-0000-0000-0000-000000000001",
        "amount_requested": 5000.00,
        "duration_months": 12,
        "interest_rate": 2.5,
        "approval_type": "automatic",  // "automatic", "manual" ou "both"
        "collateral_type": "VEHICLE",  // Opcional
        "collateral_description": "Honda Civic 2019",  // Opcional
        "collateral_docs": ["url1", "url2"]  // Opcional
    }
    ```
    
    **Approval Types:**
    - `automatic`: Tenta match automático com pools. Se não houver, rejeita.
    - `manual`: Vai direto para marketplace manual (não implementado ainda)
    - `both`: Tenta automático primeiro, se não houver match vai para manual
    
    **Retorna:**
    - Status da solicitação (PENDING, APPROVED ou REJECTED)
    - Se aprovado automaticamente, o crédito é imediatamente liberado na carteira
    """
    service = CreditService(db)
    result = service.create_credit_request(data)
    
    # O status vem como string em minúsculas do enum
    is_approved = result.get('status', '').upper() == 'APPROVED'
    
    return {
        "message": "Crédito aprovado e liberado na carteira!" if is_approved else "Solicitação criada com sucesso",
        "data": result,
        "approved": is_approved
    }


# ROTAS ESPECÍFICAS DEVEM VIR ANTES DAS ROTAS PARAMETRIZADAS
# Exemplo: /opportunities ANTES de /{request_id}

@router.get("/opportunities")
def get_investment_opportunities(
    db: Session = Depends(get_db)
):
    """
    Lista todas as oportunidades de investimento (credit requests PENDING).
    
    **Retorna:**
    - Lista de solicitações de crédito pendentes
    - Para cada uma: dados do tomador, valor, prazo, garantia, score
    """
    service = CreditService(db)
    result = service.get_investment_opportunities()
    
    return result


@router.get("/{request_id}")
def get_credit_request(
    request_id: str,
    db: Session = Depends(get_db)
):
    """
    Busca solicitação de crédito por ID.
    
    **Ainda não implementado - Placeholder**
    """
    service = CreditService(db)
    result = service.get_credit_request(request_id)
    
    return result


@router.get("/user/{user_id}")
def get_user_credit_requests(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Lista todas as solicitações de crédito de um usuário.
    
    **Ainda não implementado - Placeholder**
    """
    service = CreditService(db)
    result = service.get_user_credit_requests(user_id)
    
    return result


@router.get("/dashboard/{user_id}")
def get_borrower_dashboard(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Retorna dados consolidados do dashboard do tomador de crédito.
    
    Inclui:
    - Empréstimos ativos
    - Histórico de transações
    - Estatísticas gerais
    """
    service = CreditService(db)
    result = service.get_borrower_dashboard(user_id)
    
    return result


@router.get("/approved/{user_id}")
def get_approved_credit(
    user_id: str,
    db: Session = Depends(get_db)
):
    """
    Retorna o total de crédito aprovado para um usuário.
    
    Soma todos os credit_requests com status APPROVED.
    """
    service = CreditService(db)
    result = service.get_approved_credit(user_id)
    
    return result


@router.get("/compatible-pools/{user_id}")
def get_compatible_pools(
    user_id: str,
    amount: float,
    duration_months: int,
    db: Session = Depends(get_db)
):
    """
    Retorna pools compatíveis para um usuário fazer solicitação de crédito.
    
    **Query Parameters:**
    - amount: Valor solicitado
    - duration_months: Prazo em meses
    
    **Retorna:**
    - Lista de pools que atendem aos critérios do usuário
    - Para cada pool: nome, taxa esperada, disponibilidade
    """
    service = CreditService(db)
    result = service.get_compatible_pools(user_id, amount, duration_months)
    
    return result


@router.post("/invest", status_code=status.HTTP_201_CREATED)
def invest_in_credit_request(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Investidor financia diretamente uma solicitação de crédito.
    
    **Body JSON:**
    ```json
    {
        "investor_id": "i1000000-0000-0000-0000-000000000001",
        "credit_request_id": "cr123...",
        "amount": 5000.00,
        "interest_rate": 2.5
    }
    ```
    
    **Fluxo:**
    1. Valida saldo do investidor
    2. Debita da carteira do investidor
    3. Credita na carteira do tomador
    4. Cria registro do Loan
    5. Gera parcelas de pagamento
    6. Atualiza status do CreditRequest para APPROVED
    
    **Retorna:**
    - Detalhes do empréstimo criado
    - ID da transação
    """
    service = CreditService(db)
    result = service.invest_in_credit_request(data)
    
    return {
        "message": "Investimento realizado com sucesso!",
        "data": result
    }
