from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter(prefix="/credit-requests", tags=["Investment Marketplace"])


@router.get("/marketplace")
def get_credit_marketplace(db: Session = Depends(get_db)):
    """
    Listar requisições de crédito disponíveis para investir.
    
    TODO: Implementar lógica de negócio.
    """
    return {"message": "Endpoint not implemented yet"}


@router.post("/{request_id}/accept", status_code=status.HTTP_201_CREATED)
def accept_credit_request(request_id: str, db: Session = Depends(get_db)):
    """
    Aceitar e conceder crédito a uma requisição.
    
    TODO: Implementar lógica de negócio.
    """
    return {"message": "Endpoint not implemented yet", "request_id": request_id}
