"""
Módulo de Investimento (Investment).
"""

from .controller import router
from .service import InvestmentService
from .repository import InvestmentRepository

__all__ = ["router", "InvestmentService", "InvestmentRepository"]
