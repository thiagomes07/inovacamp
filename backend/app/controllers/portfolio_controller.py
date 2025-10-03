from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session
from app.database import get_db

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])


@router.get("/overview")
def get_portfolio_overview(db: Session = Depends(get_db)):
    """
    Visão geral do portfólio do investidor.
    
    TODO: Implementar lógica de negócio.
    """
    return {"message": "Endpoint not implemented yet"}


@router.get("/performance")
def get_portfolio_performance(db: Session = Depends(get_db)):
    """
    Analytics de rentabilidade do portfólio.
    
    TODO: Implementar lógica de negócio.
    """
    return {"message": "Endpoint not implemented yet"}
