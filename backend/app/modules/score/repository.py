from sqlalchemy.orm import Session
from app.models.models import User
from typing import Optional


class ScoreRepository:
    """Repository para operações de score no banco de dados."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Busca usuário por ID."""
        return self.db.query(User).filter(User.user_id == user_id).first()
    
    def update_calculated_score(self, user_id: str, new_score: int) -> Optional[User]:
        """Atualiza o calculated_score do usuário."""
        user = self.get_user_by_id(user_id)
        if user:
            user.calculated_score = new_score
            self.db.commit()
            self.db.refresh(user)
        return user
    
    def update_user_documents(self, user_id: str, document_links: list) -> Optional[User]:
        """Atualiza os documentos do usuário."""
        user = self.get_user_by_id(user_id)
        if user:
            # Merge com documentos existentes se houver
            existing_docs = user.document_links or []
            if isinstance(existing_docs, str):
                import json
                existing_docs = json.loads(existing_docs)
            
            user.document_links = existing_docs + document_links
            self.db.commit()
            self.db.refresh(user)
        return user
    
    def update_financial_docs(self, user_id: str, financial_docs: list) -> Optional[User]:
        """Atualiza os documentos financeiros do usuário."""
        user = self.get_user_by_id(user_id)
        if user:
            # Merge com documentos existentes se houver
            existing_docs = user.financial_docs or []
            if isinstance(existing_docs, str):
                import json
                existing_docs = json.loads(existing_docs)
            
            user.financial_docs = existing_docs + financial_docs
            self.db.commit()
            self.db.refresh(user)
        return user
