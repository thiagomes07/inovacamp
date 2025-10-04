from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.database import get_db
from .service import WalletService

router = APIRouter(prefix="/wallet", tags=["Wallet"])


@router.get("/{owner_type}/{owner_id}")
def get_wallets(
    owner_id: str,
    owner_type: str,
    db: Session = Depends(get_db)
):
    """
    Lista todas as carteiras de um usuário/investidor.
    
    **Ainda não implementado - Placeholder**
    """
    service = WalletService(db)
    result = service.get_user_wallets(owner_id, owner_type)
    return result
