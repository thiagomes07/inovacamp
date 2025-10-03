from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter(prefix="/kyc", tags=["KYC Verification"])


@router.post("/facial-verification", status_code=status.HTTP_201_CREATED)
def submit_facial_verification(db: Session = Depends(get_db)):
    """
    Submeter verificação facial para KYC.
    
    TODO: Implementar lógica de negócio.
    """
    return {"message": "Endpoint not implemented yet"}


@router.post("/documents", status_code=status.HTTP_201_CREATED)
def submit_kyc_documents(db: Session = Depends(get_db)):
    """
    Submeter documentos para KYC.
    
    TODO: Implementar lógica de negócio.
    """
    return {"message": "Endpoint not implemented yet"}


@router.get("/status")
def get_kyc_status(db: Session = Depends(get_db)):
    """
    Verificar status do processo KYC.
    
    TODO: Implementar lógica de negócio.
    """
    return {"message": "Endpoint not implemented yet"}
