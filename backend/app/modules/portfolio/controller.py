from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app.database import get_db
from .service import PortfolioService

router = APIRouter(prefix="/portfolio", tags=["Portfolio"])


@router.get("/overview")
def get_portfolio_overview(
    investor_id: str,
    db: Session = Depends(get_db)
):
    """
    **GET /portfolio/overview**
    
    Retorna visão geral completa do portfólio do investidor.
    
    **Query Parameters:**
    - `investor_id`: ID do investidor
    
    **Retorna:**
    - Saldos das carteiras (total, disponível, investido, bloqueado)
    - Lista de pools (criados e investidos)
    - Investimentos diretos ativos
    - Oportunidades de investimento disponíveis
    - Métricas de performance
    
    **Exemplo de resposta:**
    ```json
    {
      "investor_id": "inv123",
      "balance": {
        "total": 50000.00,
        "available": 15000.00,
        "invested": 35000.00,
        "blocked": 0.00
      },
      "wallets": [...],
      "pools": [...],
      "direct_investments": [...],
      "opportunities": [...],
      "performance": {...}
    }
    ```
    """
    try:
        service = PortfolioService(db)
        result = service.get_portfolio_overview(investor_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao buscar portfólio: {str(e)}")


@router.get("/performance")
def get_portfolio_performance(
    investor_id: str,
    db: Session = Depends(get_db)
):
    """
    **GET /portfolio/performance**
    
    Retorna analytics de rentabilidade e performance do portfólio.
    
    **Query Parameters:**
    - `investor_id`: ID do investidor
    
    **Retorna:**
    - Total investido
    - Total recebido (juros + principal)
    - ROI (Return on Investment) em %
    - Taxa média de retorno
    - Número de empréstimos ativos
    - Resumo de lucros
    
    **Exemplo de resposta:**
    ```json
    {
      "investor_id": "inv123",
      "total_invested": 35000.00,
      "total_received": 8500.00,
      "roi": 12.5,
      "average_rate": 18.3,
      "active_loans": 12,
      "performance_summary": {
        "profit": 4375.00,
        "invested_capital": 35000.00,
        "returns": 8500.00
      }
    }
    ```
    """
    try:
        service = PortfolioService(db)
        result = service.get_portfolio_performance(investor_id)
        return result
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Erro ao calcular performance: {str(e)}")


# Manter endpoint legado para compatibilidade
@router.get("/investor/{investor_id}")
def get_portfolio_legacy(
    investor_id: str,
    db: Session = Depends(get_db)
):
    """
    **[DEPRECATED]** Use `/portfolio/overview?investor_id=xxx` ao invés.
    
    Endpoint legado mantido para compatibilidade.
    """
    return get_portfolio_overview(investor_id=investor_id, db=db)
