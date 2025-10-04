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


@router.get("/{pool_id}")
def get_pool(
    pool_id: str,
    db: Session = Depends(get_db)
):
    """
    Busca detalhes de um pool específico.
    
    **Ainda não implementado - Placeholder**
    """
    return {"message": "Get pool not implemented"}


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
