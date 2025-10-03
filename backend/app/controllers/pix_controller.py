from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter(prefix="/pix", tags=["PIX Payments"])


@router.post("/send", status_code=status.HTTP_201_CREATED)
def send_pix(db: Session = Depends(get_db)):
    """
    Enviar pagamento via PIX.
    
    TODO: Implementar lógica de negócio.
    """
    return {"message": "Endpoint not implemented yet"}


@router.post("/receive/generate-qr", status_code=status.HTTP_201_CREATED)
def generate_pix_qr_code(db: Session = Depends(get_db)):
    """
    Gerar QR Code para receber PIX.
    
    TODO: Implementar lógica de negócio.
    """
    return {"message": "Endpoint not implemented yet"}
