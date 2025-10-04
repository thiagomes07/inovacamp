from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Dict, List, Any

from .repository import LoanRepository


class LoanService:
    """Service layer para lógica de negócio de empréstimo."""
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = LoanRepository(db)
    
    # TODO: Implementar métodos do service
    pass
