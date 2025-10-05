from sqlalchemy.orm import Session
from typing import Optional, List
from app.models.models import CreditRequest


class CreditRepository:
    """Repository para operações de crédito no banco de dados."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_credit_request_by_id(self, request_id: str) -> Optional[CreditRequest]:
        """Busca solicitação de crédito por ID."""
        return self.db.query(CreditRequest).filter(CreditRequest.request_id == request_id).first()
    
    def get_credit_requests_by_user(self, user_id: str) -> List[CreditRequest]:
        """Busca todas as solicitações de crédito de um usuário."""
        return self.db.query(CreditRequest).filter(CreditRequest.user_id == user_id).all()
    
    def create_credit_request(self, data: dict) -> CreditRequest:
        """Cria nova solicitação de crédito."""
        credit_request = CreditRequest(**data)
        self.db.add(credit_request)
        self.db.commit()
        self.db.refresh(credit_request)
        return credit_request
    
    def update_credit_request(self, request_id: str, data: dict) -> Optional[CreditRequest]:
        """Atualiza solicitação de crédito."""
        credit_request = self.get_credit_request_by_id(request_id)
        if credit_request:
            for key, value in data.items():
                setattr(credit_request, key, value)
            self.db.commit()
            self.db.refresh(credit_request)
        return credit_request
