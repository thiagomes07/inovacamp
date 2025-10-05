from fastapi import APIRouter, Depends, status, Body, Query
from sqlalchemy.orm import Session
from typing import Dict, Any, Optional

from app.database import get_db
from .service import PoolService

router = APIRouter(prefix="/pool", tags=["Pool"])


@router.post("/", status_code=status.HTTP_201_CREATED)
def create_pool(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Cria novo pool de investimento.
    
    **Ainda não implementado - Placeholder**
    """
    service = PoolService(db)
    result = service.create_pool(data)
    return {"message": "Pool created", "data": result}


@router.get("/")
def list_pools(
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db)
):
    """
    Lista todos os pools disponíveis.
    
    **Ainda não implementado - Placeholder**
    """
    service = PoolService(db)
    result = service.list_pools(status)
    return result


@router.get("/investor/{investor_id}")
def get_investor_pools(
    investor_id: str,
    db: Session = Depends(get_db)
):
    """
    Lista todas as pools de um investidor específico com estatísticas.
    """
    service = PoolService(db)
    result = service.get_investor_pools(investor_id)
    return result


@router.get("/{pool_id}")
def get_pool_details(
    pool_id: str,
    db: Session = Depends(get_db)
):
    """
    Busca detalhes completos de uma pool incluindo empréstimos alocados.
    """
    service = PoolService(db)
    result = service.get_pool_details(pool_id)
    return result


@router.put("/{pool_id}")
def update_pool(
    pool_id: str,
    updates: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Atualiza critérios de uma pool (nome, retorno esperado, prazo).
    """
    service = PoolService(db)
    result = service.update_pool_criteria(pool_id, updates)
    return result


@router.put("/{pool_id}/status")
def update_pool_status(
    pool_id: str,
    data: Dict[str, str] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Atualiza status da pool (active, funding, closed).
    
    Body: {"status": "active" | "funding" | "closed"}
    """
    new_status = data.get('status')
    if not new_status:
        return {"error": "Status is required"}, 400
    
    service = PoolService(db)
    result = service.update_pool_status(pool_id, new_status)
    return result


@router.post("/{pool_id}/increase-capital")
def increase_pool_capital(
    pool_id: str,
    data: Dict[str, float] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Aumenta o capital total da pool.
    
    Body: {"amount": 10000.00}
    """
    amount = data.get('amount')
    if not amount:
        return {"error": "Amount is required"}, 400
    
    service = PoolService(db)
    result = service.increase_pool_capital(pool_id, amount)
    return {"message": "Capital increased successfully", "pool": result}


@router.post("/{pool_id}/fund")
def fund_pool(
    pool_id: str,
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Financia um pool (investidor).
    
    **Ainda não implementado - Placeholder**
    """
    return {"message": "Fund pool not implemented"}
