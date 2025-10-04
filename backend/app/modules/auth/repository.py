from sqlalchemy.orm import Session
from typing import Optional
from app.models.models import User, Investor
import uuid


class AuthRepository:
    """Repository para operações de autenticação no banco de dados."""
    
    def __init__(self, db: Session):
        self.db = db
    
    # ========== USER METHODS ==========
    
    def get_user_by_email(self, email: str) -> Optional[User]:
        """Busca usuário por email."""
        return self.db.query(User).filter(User.email == email).first()
    
    def get_user_by_cpf_cnpj(self, cpf_cnpj: str) -> Optional[User]:
        """Busca usuário por CPF/CNPJ."""
        return self.db.query(User).filter(User.cpf_cnpj == cpf_cnpj).first()
    
    def get_user_by_id(self, user_id: str) -> Optional[User]:
        """Busca usuário por ID."""
        return self.db.query(User).filter(User.user_id == user_id).first()
    
    def create_user(self, user_data: dict) -> User:
        """Cria novo usuário."""
        user_data['user_id'] = str(uuid.uuid4())
        user = User(**user_data)
        self.db.add(user)
        self.db.commit()
        self.db.refresh(user)
        return user
    
    def update_user(self, user_id: str, update_data: dict) -> Optional[User]:
        """Atualiza informações do usuário."""
        user = self.get_user_by_id(user_id)
        if user:
            for key, value in update_data.items():
                setattr(user, key, value)
            self.db.commit()
            self.db.refresh(user)
        return user
    
    # ========== INVESTOR METHODS ==========
    
    def get_investor_by_email(self, email: str) -> Optional[Investor]:
        """Busca investidor por email."""
        return self.db.query(Investor).filter(Investor.email == email).first()
    
    def get_investor_by_cpf_cnpj(self, cpf_cnpj: str) -> Optional[Investor]:
        """Busca investidor por CPF/CNPJ."""
        return self.db.query(Investor).filter(Investor.cpf_cnpj == cpf_cnpj).first()
    
    def get_investor_by_id(self, investor_id: str) -> Optional[Investor]:
        """Busca investidor por ID."""
        return self.db.query(Investor).filter(Investor.investor_id == investor_id).first()
    
    def create_investor(self, investor_data: dict) -> Investor:
        """Cria novo investidor."""
        investor_data['investor_id'] = str(uuid.uuid4())
        investor = Investor(**investor_data)
        self.db.add(investor)
        self.db.commit()
        self.db.refresh(investor)
        return investor
    
    def update_investor(self, investor_id: str, update_data: dict) -> Optional[Investor]:
        """Atualiza informações do investidor."""
        investor = self.get_investor_by_id(investor_id)
        if investor:
            for key, value in update_data.items():
                setattr(investor, key, value)
            self.db.commit()
            self.db.refresh(investor)
        return investor
