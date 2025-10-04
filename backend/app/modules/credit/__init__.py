"""
Módulo de Crédito (Credit).

Responsável por solicitações e análises de crédito.
"""

from .controller import router
from .service import CreditService
from .repository import CreditRepository

__all__ = ["router", "CreditService", "CreditRepository"]
