from sqlalchemy.orm import Session
from typing import Dict

from .repository import KYCRepository


class KYCService:
    """Service layer para lógica de negócio de KYC."""
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = KYCRepository(db)
    
    def _entity_to_dict(self, user) -> dict:
        """Converte entidade User/Investor para dicionário com info KYC."""
        if hasattr(user, 'user_id'):  # User
            return {
                "user_id": user.user_id,
                "email": user.email,
                "full_name": user.full_name,
                "cpf_cnpj": user.cpf_cnpj,
                "document_type": user.document_type.value,
                "kyc_approved": user.kyc_approved,
                "document_links": user.document_links,
                "created_at": user.created_at.isoformat() if user.created_at else None
            }
        else:  # Investor
            return {
                "investor_id": user.investor_id,
                "email": user.email,
                "full_name": user.full_name,
                "cpf_cnpj": user.cpf_cnpj,
                "document_type": user.document_type.value,
                "kyc_approved": user.kyc_approved,
                "document_links": user.document_links,
                "created_at": user.created_at.isoformat() if user.created_at else None
            }
    
    def submit_kyc(self, data: dict) -> dict:
        """Submete dados de KYC."""
        # TODO: Validar documentos
        # TODO: Integrar com serviço de verificação (ex: Onfido, Trulioo)
        user_id = data.get("user_id")
        user_type = data.get("user_type", "user")
        
        user = self.repository.get_user_by_id(user_id, user_type)
        if not user:
            return {"error": "User not found"}
        
        return {
            "message": "KYC documents submitted for review",
            "user_id": user_id,
            "status": "pending"
        }
    
    def get_kyc_status(self, user_id: str, user_type: str = "user") -> dict:
        """Obtém status do KYC do usuário."""
        user = self.repository.get_user_by_id(user_id, user_type)
        return self._entity_to_dict(user) if user else None
    
    def verify_kyc(self, user_id: str, approved: bool, user_type: str = "user") -> dict:
        """Verifica e aprova/rejeita KYC."""
        # TODO: Implementar lógica de verificação
        user = self.repository.update_kyc_status(user_id, approved, user_type)
        return self._entity_to_dict(user) if user else {"error": "User not found"}
