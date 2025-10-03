from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter(prefix="/credit", tags=["Credit Requests"])


@router.post("/request", status_code=status.HTTP_201_CREATED)
def create_credit_request(db: Session = Depends(get_db)):
    """
    Solicitar crédito com documentos de garantia.
    
    TODO: Implementar lógica de negócio.
    """
    return {"message": "Endpoint not implemented yet"}


@router.get("/requests")
def list_my_credit_requests(db: Session = Depends(get_db)):
    """
    Listar minhas solicitações de crédito.
    
    TODO: Implementar lógica de negócio.
    """
    return {"message": "Endpoint not implemented yet"}


@router.get("/requests/{request_id}")
def get_credit_request_details(request_id: str, db: Session = Depends(get_db)):
    """
    Detalhes de uma solicitação de crédito específica.
    
    TODO: Implementar lógica de negócio.
    """
    return {"message": "Endpoint not implemented yet", "request_id": request_id}
