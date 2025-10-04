from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from .service import PortfolioService

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])


@router.get("/investor/{investor_id}")
def get_portfolio(
    investor_id: str,
    db: Session = Depends(get_db)
):
    """
    Busca portfólio completo de um investidor.
    
    **Ainda não implementado - Placeholder**
    """
    service = PortfolioService(db)
    result = service.get_portfolio_summary(investor_id)
    return result


@router.get("/investor/{investor_id}/analytics")
def get_portfolio_analytics(
    investor_id: str,
    db: Session = Depends(get_db)
):
    """
    Retorna análises detalhadas do portfólio.
    
    **Ainda não implementado - Placeholder**
    """
    return {"message": "Portfolio analytics not implemented"}
