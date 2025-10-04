from sqlalchemy.orm import Session
from app.models.models import User, Investor


class KYCRepository:
    """Repository para operações de KYC no banco de dados."""
    
    def __init__(self, db: Session):
        self.db = db
    
    def get_user_by_id(self, user_id: str, user_type: str = "user"):
        """Busca usuário por ID."""
        if user_type == "investor":
            return self.db.query(Investor).filter(Investor.investor_id == user_id).first()
        return self.db.query(User).filter(User.user_id == user_id).first()
    
    def update_kyc_status(self, user_id: str, approved: bool, user_type: str = "user"):
        """Atualiza status do KYC do usuário."""
        if user_type == "investor":
            user = self.db.query(Investor).filter(Investor.investor_id == user_id).first()
        else:
            user = self.db.query(User).filter(User.user_id == user_id).first()
        
        if user:
            user.kyc_approved = approved
            self.db.commit()
            self.db.refresh(user)
        return user
