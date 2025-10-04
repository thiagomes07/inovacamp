from sqlalchemy.orm import Session
from typing import Dict

from .repository import CurrencyRepository


class CurrencyService:
    """Service layer para lógica de negócio de moeda."""
    
    def __init__(self, db: Session):
        self.db = db
        self.repository = CurrencyRepository(db)
    
    def convert_currency(self, amount: float, from_currency: str, to_currency: str) -> dict:
        """Converte valor entre moedas."""
        # TODO: Implementar conversão real com API
        return {
            "amount": amount,
            "from_currency": from_currency,
            "to_currency": to_currency,
            "converted_amount": amount,  # Placeholder
            "exchange_rate": 1.0  # Placeholder
        }
