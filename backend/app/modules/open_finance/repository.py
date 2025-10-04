from sqlalchemy.orm import Session


class OpenFinanceRepository:
    """Repository para operações de Open Finance no banco de dados."""
    
    def __init__(self, db: Session):
        self.db = db
    
    # TODO: Implementar operações relacionadas a Open Finance
    # TODO: Pode incluir armazenamento de consentimentos, tokens de acesso, etc.
