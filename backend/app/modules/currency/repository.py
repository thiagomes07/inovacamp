from sqlalchemy.orm import Session


class CurrencyRepository:
    """Repository para operações de moeda no banco de dados."""
    
    def __init__(self, db: Session):
        self.db = db
    
    # TODO: Implementar métodos para conversão de moeda
    # TODO: Integrar com API de cotações
    pass
