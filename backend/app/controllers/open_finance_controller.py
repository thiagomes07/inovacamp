from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter(prefix="/open-finance", tags=["Open Finance"])


@router.post("/auth/initiate", status_code=status.HTTP_201_CREATED)
def initiate_bank_authentication(db: Session = Depends(get_db)):
    """
    Iniciar autenticação bancária via Open Finance.
    
    TODO: Implementar lógica de negócio.
    """
    return {"message": "Endpoint not implemented yet"}
