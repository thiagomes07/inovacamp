from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database import get_db
from .service import PIXService

router = APIRouter(prefix="/pix", tags=["PIX"])


@router.post("/send")
def send_pix(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Envia PIX.
    
    **Ainda não implementado - Placeholder**
    """
    service = PIXService(db)
    result = service.send_pix(data)
    return result


@router.post("/receive")
def receive_pix(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Recebe PIX.
    
    **Ainda não implementado - Placeholder**
    """
    service = PIXService(db)
    result = service.receive_pix(data)
    return result
