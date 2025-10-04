from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter(prefix="/loans", tags=["Loans"])


@router.get("/active")
def get_active_loans(db: Session = Depends(get_db)):
    """
    Listar empréstimos ativos do usuário.
    
    TODO: Implementar lógica de negócio.
    """
    return {"message": "Endpoint not implemented yet"}


@router.post("/{loan_id}/payments", status_code=status.HTTP_201_CREATED)
def pay_loan_installment(loan_id: str, db: Session = Depends(get_db)):
    """
    Pagar parcela de empréstimo.
    
    TODO: Implementar lógica de negócio.
    """
    return {"message": "Endpoint not implemented yet", "loan_id": loan_id}
