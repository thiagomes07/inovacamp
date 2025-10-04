from sqlalchemy.orm import Session
from fastapi import HTTPException, status
from typing import Dict, List, Any

from .repository import CreditRepository


class CreditService:
    """Service layer para lógica de negócio de crédito."""
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = CreditRepository(db)
    
    def create_credit_request(self, data: dict) -> dict:
        """
        Cria nova solicitação de crédito.
        
        Args:
            data: Dados da solicitação
        
        Returns:
            Dicionário com dados da solicitação criada
        """
        # TODO: Implementar lógica de validação
        # TODO: Implementar análise de crédito
        # TODO: Implementar score de risco
        
        credit_request = self.repository.create_credit_request(data)
        return self._to_dict(credit_request)
    
    def get_credit_request(self, request_id: str) -> dict:
        """
        Busca solicitação de crédito por ID.
        
        Args:
            request_id: ID da solicitação
        
        Returns:
            Dicionário com dados da solicitação
        """
        credit_request = self.repository.get_credit_request_by_id(request_id)
        
        if not credit_request:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Credit request not found"
            )
        
        return self._to_dict(credit_request)
    
    def get_user_credit_requests(self, user_id: str) -> List[dict]:
        """
        Busca todas as solicitações de crédito de um usuário.
        
        Args:
            user_id: ID do usuário
        
        Returns:
            Lista de dicionários com dados das solicitações
        """
        requests = self.repository.get_credit_requests_by_user(user_id)
        return [self._to_dict(req) for req in requests]
    
    def _to_dict(self, entity: Any) -> dict:
        """Converte entidade para dicionário."""
        return {
            "request_id": entity.request_id,
            "user_id": entity.user_id,
            "amount_requested": float(entity.amount_requested) if entity.amount_requested else None,
            "purpose": entity.purpose,
            "status": entity.status.value if hasattr(entity.status, 'value') else entity.status,
            "collateral_type": entity.collateral_type.value if hasattr(entity.collateral_type, 'value') else entity.collateral_type,
            "collateral_value": float(entity.collateral_value) if entity.collateral_value else None,
            "interest_rate": float(entity.interest_rate) if entity.interest_rate else None,
            "term_months": entity.term_months,
            "created_at": entity.created_at.isoformat() if entity.created_at else None,
            "updated_at": entity.updated_at.isoformat() if entity.updated_at else None
        }
