from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.database import get_db
from .service import LoanService

router = APIRouter(prefix="/loan", tags=["Loan"])


@router.get("/")
def list_loans(db: Session = Depends(get_db)):
    """
    Lista empréstimos.
    
    **Ainda não implementado - Placeholder**
    """
    return {"message": "Not implemented yet - Loan module"}
