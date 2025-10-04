from sqlalchemy.orm import Session
from typing import Dict

from .repository import PIXRepository


class PIXService:
    """Service layer para lógica de negócio de PIX."""
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = PIXRepository(db)
    
    def send_pix(self, data: dict) -> dict:
        """Envia PIX."""
        # TODO: Integrar com API do banco
        # TODO: Validar chave PIX
        # TODO: Processar transação
        print("pix enviado")
        return {"message": "PIX sent", "status": "pending"}
    
    def receive_pix(self, data: dict) -> dict:
        """Recebe PIX."""
        # TODO: Processar recebimento
        return {"message": "PIX received", "status": "completed"}
