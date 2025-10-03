from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter(prefix="/pools", tags=["Investment Pools"])


@router.post("", status_code=status.HTTP_201_CREATED)
def create_pool(db: Session = Depends(get_db)):
    """
    Criar pool de investimento.
    
    TODO: Implementar lógica de negócio.
    """
    return {"message": "Endpoint not implemented yet"}


@router.post("/{pool_id}/invest", status_code=status.HTTP_201_CREATED)
def invest_in_pool(pool_id: str, db: Session = Depends(get_db)):
    """
    Investir em um pool específico.
    
    TODO: Implementar lógica de negócio.
    """
    return {"message": "Endpoint not implemented yet", "pool_id": pool_id}


@router.get("")
def list_available_pools(db: Session = Depends(get_db)):
    """
    Listar pools disponíveis para investimento.
    
    TODO: Implementar lógica de negócio.
    """
    return {"message": "Endpoint not implemented yet"}


@router.get("/{pool_id}/performance")
def get_pool_performance(pool_id: str, db: Session = Depends(get_db)):
    """
    Performance de um pool específico.
    
    TODO: Implementar lógica de negócio.
    """
    return {"message": "Endpoint not implemented yet", "pool_id": pool_id}
