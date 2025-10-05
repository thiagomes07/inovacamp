from fastapi import APIRouter, Depends, Body
from sqlalchemy.orm import Session
from typing import Dict, Any

from app.database import get_db
from .service import KYCService

router = APIRouter(prefix="/kyc", tags=["KYC"])


@router.post("/submit")
def submit_kyc(
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Submete dados de KYC para verificação.
    
    **Ainda não implementado - Placeholder**
    """
    service = KYCService(db)
    result = service.submit_kyc(data)
    return result


@router.get("/status/{user_id}")
def get_kyc_status(
    user_id: str,
    user_type: str = "user",
    db: Session = Depends(get_db)
):
    """
    Obtém status do KYC de um usuário.
    """
    service = KYCService(db)
    result = service.get_kyc_status(user_id, user_type)
    return result if result else {"error": "User not found"}


@router.post("/verify/{user_id}")
def verify_kyc(
    user_id: str,
    data: Dict[str, Any] = Body(...),
    db: Session = Depends(get_db)
):
    """
    Verifica e aprova/rejeita um KYC.
    
    **Ainda não implementado - Placeholder**
    """
    service = KYCService(db)
    approved = data.get("approved", False)
    user_type = data.get("user_type", "user")
    result = service.verify_kyc(user_id, approved, user_type)
    return result
