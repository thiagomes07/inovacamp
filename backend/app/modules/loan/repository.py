from sqlalchemy.orm import Session
from typing import Optional, List


class LoanRepository:
    """Repository para operações de empréstimo no banco de dados."""
    
    def __init__(self, db: Session):
        self.db = db
    
    # TODO: Implementar métodos do repository
    pass
