"""
Módulo de Depósitos.
"""

from .controller import router
from .service import DepositService
from .repository import DepositRepository

__all__ = ["router", "DepositService", "DepositRepository"]
